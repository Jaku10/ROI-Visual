import React, { createContext, useContext, useState, useCallback } from 'react';

export interface KPIData {
  companyName: string;
  winRate: number;
  dealSize: number;
  opptys: number;
  reps: number;
  cycle: number;
  costPerRep: number;
}

// Enterprise / B2B defaults: strategic sales, fully loaded cost per rep (OTE, benefits, ramp)
const INITIAL_DATA: KPIData = {
  companyName: 'Enterprise scenario',
  winRate: 32,
  dealSize: 350000,
  opptys: 15000,
  reps: 500,
  cycle: 165,
  costPerRep: 185000,
};

function parseNumber(str: string): number {
  return parseInt(String(str).replace(/,/g, ''), 10) || 0;
}

function parseDecimal(str: string): number {
  const cleaned = String(str).replace(/,/g, '').trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

// Sanity bounds so parsed values stay reasonable in the visualization
const BOUNDS = {
  winRate: { min: 1, max: 100 },
  dealSize: { min: 1000, max: 50_000_000 },
  opptys: { min: 100, max: 10_000_000 },
  reps: { min: 1, max: 100_000 },
  cycle: { min: 7, max: 730 },
  costPerRep: { min: 50_000, max: 500_000 },
} as const;

function clamp<T extends keyof typeof BOUNDS>(key: T, value: number): number {
  const { min, max } = BOUNDS[key];
  return Math.max(min, Math.min(max, Math.round(value)));
}

/** Parse pasted ROI/KPI document text and return any recognized fields. Handles Gemini-style docs (tables, bullets, "Label: value" lines). */
export function parseResultsFromText(text: string): Partial<KPIData> {
  const out: Partial<KPIData> = {};

  // ----- Win Rate: table, "Win rate: 42%", "42% win rate", "~42%", decimals, bullets -----
  const winPatterns = [
    /\|\s*\*?\*?Win\s*Rate\*?\*?\s*\|\s*[^|]*?~?(\d+(?:\.\d+)?)\s*%?/i,
    /(?:^|\n)\s*[-*•]\s*(?:win\s*rate|winrate)[:\s\-]+(\d+(?:\.\d+)?)\s*%?/im,
    /(?:win\s*rate|winrate)[:\s\-]+(\d+(?:\.\d+)?)\s*%?/i,
    /(?:win\s*rate|winrate)[:\s\-]+(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*%\s*(?:win\s*rate|win\s*rate)/i,
    /(\d+(?:\.\d+)?)\s*%\s*win/i,
    /win\s*rate\s*(?:is\s*)?(?:at\s*)?(?:~?)?(\d+(?:\.\d+)?)\s*%?/i,
    /\*\*Win\s*Rate\*\*[:\s]*~?(\d+(?:\.\d+)?)\s*%?/i,
  ];
  for (const re of winPatterns) {
    const m = text.match(re);
    if (m) {
      const n = parseDecimal(m[1]);
      if (n >= 0 && n <= 100) {
        out.winRate = clamp('winRate', n);
        break;
      }
    }
  }

  // ----- Deal Size (ASP): table, $1.2M, $450k, "Average deal size: 350000", "deal size: $1.2M" -----
  const dealPatterns: { re: RegExp; scale: number }[] = [
    { re: /\|\s*\*?\*?Average\s*Deal\s*Size\s*\(ASP\)\*?\*?\s*\|\s*[^|]*?\$?(\d+(?:\.\d+)?)\s*M/i, scale: 1e6 },
    { re: /\|\s*\*?\*?Average\s*Deal\s*Size\*?\*?\s*\|\s*[^|]*?\$?(\d+(?:\.\d+)?)\s*M/i, scale: 1e6 },
    { re: /\|\s*\*?\*?Deal\s*Size\*?\*?\s*\|\s*[^|]*?\$?([\d,]+(?:\.\d+)?)\s*M/i, scale: 1e6 },
    { re: /\|\s*\*?\*?Average\s*Deal\s*Size\s*\(ASP\)\*?\*?\s*\|\s*[^|]*?\$?([\d,]+)(?!\s*M)/i, scale: 1 },
    { re: /(?:^|\n)\s*[-*•]\s*(?:average\s*)?deal\s*size[:\s\-]+\$?(\d+(?:\.\d+)?)\s*M/im, scale: 1e6 },
    { re: /(?:average\s*)?deal\s*size\s*(?:\(asp\))?[:\s\-]+\$?(\d+(?:\.\d+)?)\s*M/i, scale: 1e6 },
    { re: /(?:average\s*)?deal\s*size\s*(?:\(asp\))?[:\s\-]+\$?([\d,]+)\s*k/i, scale: 1000 },
    { re: /(?:average\s*)?deal\s*size\s*(?:\(asp\))?[:\s\-]+\$?([\d,]+)/i, scale: 1 },
    { re: /asp[:\s\-]+\$?(\d+(?:\.\d+)?)\s*M/i, scale: 1e6 },
    { re: /asp[:\s\-]+\$?([\d,]+)\s*k/i, scale: 1000 },
    { re: /\*\*Average\s*Deal\s*Size\*\*[:\s]*\$?(\d+(?:\.\d+)?)\s*M/i, scale: 1e6 },
    { re: /\$(\d+(?:\.\d+)?)\s*M\b/, scale: 1e6 },
    { re: /\$([\d,]+)\s*k\b/i, scale: 1000 },
  ];
  for (const { re, scale } of dealPatterns) {
    const m = text.match(re);
    if (m) {
      const raw = parseDecimal(m[1]);
      const n = raw * scale;
      if (n > 0) {
        out.dealSize = clamp('dealSize', n);
        break;
      }
    }
  }

  // ----- Annual Piped Opptys / opportunities -----
  const oppPatterns = [
    /\|\s*\*?\*?Annual\s*Piped\s*Opptys?\*?\*?\s*\|\s*[^|]*?~?([\d,]+)/i,
    /\|\s*\*?\*?Pipeline\s*Opportunities\*?\*?\s*\|\s*[^|]*?~?([\d,]+)/i,
    /(?:^|\n)\s*[-*•]\s*(?:annual\s*)?(?:piped\s*)?(?:pipeline\s*)?opportunit(?:y|ies)[:\s\-]+([\d,]+)/im,
    /(?:annual\s*)?(?:piped\s*)?(?:pipeline\s*)?opportunit(?:y|ies)[:\s\-]+([\d,]+)/i,
    /(?:annual\s*)?(?:piped\s*)?opptys?[:\s\-]+([\d,]+)/i,
    /(?:pipeline|opportunities)[:\s\-]+([\d,]+)/i,
    /([\d,]+)\s*(?:annual\s*)?(?:piped\s*)?opportunit/i,
    /\*\*Annual\s*Piped\s*Opptys?\*\*[:\s]*~?([\d,]+)/i,
  ];
  for (const re of oppPatterns) {
    const m = text.match(re);
    if (m) {
      const n = parseNumber(m[1]);
      if (n > 0) {
        out.opptys = clamp('opptys', n);
        break;
      }
    }
  }

  // ----- Sales Reps -----
  const repsPatterns = [
    /\|\s*\*?\*?Number\s*of\s*Sales\s*Reps?\*?\*?\s*\|\s*[^|]*?~?([\d,]+)/i,
    /\|\s*\*?\*?Sales\s*Reps?\*?\*?\s*\|\s*[^|]*?~?([\d,]+)/i,
    /(?:^|\n)\s*[-*•]\s*(?:number\s*of\s*)?(?:sales\s*)?reps?[:\s\-]+([\d,]+)/im,
    /(?:number\s*of\s*)?(?:sales\s*)?reps?[:\s\-]+([\d,]+)/i,
    /([\d,]+)\s*(?:sales\s*)?reps?\b/i,
    /\*\*Number\s*of\s*Sales\s*Reps?\*\*[:\s]*~?([\d,]+)/i,
  ];
  for (const re of repsPatterns) {
    const m = text.match(re);
    if (m) {
      const n = parseNumber(m[1]);
      if (n > 0) {
        out.reps = clamp('reps', n);
        break;
      }
    }
  }

  // ----- Sales Cycle (days) -----
  const cyclePatterns = [
    /\|\s*\*?\*?Sales\s*Cycle\s*Duration\*?\*?\s*\|\s*[^|]*?(\d+)\s*Days?/i,
    /\|\s*\*?\*?Sales\s*Cycle\*?\*?\s*\|\s*[^|]*?(\d+)\s*Days?/i,
    /(?:^|\n)\s*[-*•]\s*(?:sales\s*)?cycle\s*(?:duration)?[:\s\-]+(\d+)\s*days?/im,
    /(?:sales\s*)?cycle\s*(?:duration)?[:\s\-]+(\d+)\s*days?/i,
    /(?:sales\s*)?cycle[:\s\-]+(\d+)/i,
    /(\d+)\s*days?\s*(?:sales\s*)?cycle/i,
    /cycle[:\s\-]+(\d+)\s*days?/i,
    /\*\*Sales\s*Cycle\s*Duration\*\*[:\s]*(\d+)\s*Days?/i,
  ];
  for (const re of cyclePatterns) {
    const m = text.match(re);
    if (m) {
      const n = parseNumber(m[1]);
      if (n > 0) {
        out.cycle = clamp('cycle', n);
        break;
      }
    }
  }

  // ----- Cost per rep -----
  const costPatterns = [
    /cost\s*per\s*rep[:\s\-]+\$?([\d,]+)/i,
    /(?:per\s*rep\s*)?cost[:\s\-]+\$?([\d,]+)/i,
    /(?:fully\s*loaded\s*)?cost\s*per\s*rep[:\s\-]+\$?([\d,]+)/i,
  ];
  for (const re of costPatterns) {
    const m = text.match(re);
    if (m) {
      const n = parseNumber(m[1]);
      if (n > 0) {
        out.costPerRep = clamp('costPerRep', n);
        break;
      }
    }
  }

  // ----- Company / scenario name (Gemini often uses "X ROI Model" or "Model for X") -----
  const namePatterns = [
    /([A-Za-z0-9&\s]+)\s+(?:Wholesale|Enterprise|Strategic|B2B|DTC)\s+ROI\s+Model/i,
    /(?:general\s+)?(?:enterprise\s+)?model\s+for\s+([A-Za-z0-9&\s]+)/i,
    /([A-Za-z0-9&\s]+)\s+Enterprise\s+ROI\s+Model/i,
    /(?:company|scenario|client|organization)[:\s]+([^\n.,]+)/i,
    /(?:company|scenario|model)[:\s]*([^\n.,]+)/i,
  ];
  for (const re of namePatterns) {
    const nameMatch = text.match(re);
    if (nameMatch?.[1]) {
      let name = nameMatch[1].trim().replace(/\*\*/g, '').slice(0, 80);
      if (name.length > 0) {
        if (text.match(/\s+Wholesale\s+ROI/i)) name += ' Wholesale';
        else if (text.match(/\s+Enterprise\s+ROI/i) && !name.toLowerCase().includes('enterprise')) name += ' Enterprise';
        out.companyName = name;
        break;
      }
    }
  }

  return out;
}

type KPIDataContextValue = {
  data: KPIData;
  setData: React.Dispatch<React.SetStateAction<KPIData>>;
  applyResultsFromText: (text: string) => Partial<KPIData>;
  resetData: () => void;
};

const KPIDataContext = createContext<KPIDataContextValue | null>(null);

export function KPIDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<KPIData>(INITIAL_DATA);

  const applyResultsFromText = useCallback((text: string) => {
    const parsed = parseResultsFromText(text);
    if (Object.keys(parsed).length > 0) {
      setData((prev) => ({ ...prev, ...parsed }));
    }
    return parsed;
  }, []);

  const resetData = useCallback(() => setData(INITIAL_DATA), []);

  return (
    <KPIDataContext.Provider value={{ data, setData, applyResultsFromText, resetData }}>
      {children}
    </KPIDataContext.Provider>
  );
}

export function useKPIData() {
  const ctx = useContext(KPIDataContext);
  if (!ctx) throw new Error('useKPIData must be used within KPIDataProvider');
  return ctx;
}
