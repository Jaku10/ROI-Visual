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

// Realistic enterprise defaults (B2B / strategic sales; fully loaded cost per rep)
const INITIAL_DATA: KPIData = {
  companyName: 'Enterprise Sales',
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

/** Parse pasted ROI/KPI document text and return any recognized fields */
export function parseResultsFromText(text: string): Partial<KPIData> {
  const out: Partial<KPIData> = {};
  const lower = text.toLowerCase();

  // ----- One-page doc format: table rows like | **Win Rate** | **~42%** | -----
  // Win rate: "**Win Rate** | **~42%**" or "win rate: 35", "35%"
  const winMatch =
    text.match(/\|\s*\*?\*?Win Rate\*?\*?\s*\|\s*[^|]*?~?(\d+)\s*%?/i) ??
    text.match(/(?:win\s*rate|winrate)[:\s]*(\d+)|(\d+)\s*%\s*(?:win|rate)/i) ??
    lower.match(/(\d+)\s*%\s*win/);
  if (winMatch) {
    const n = parseNumber(winMatch[1] || winMatch[2] || '');
    if (n >= 0 && n <= 100) out.winRate = n;
  }

  // Average Deal Size (ASP): "**$1.2M**", "**$450,000**", "$250k" in table or body
  const dealTableM = text.match(/\|\s*\*?\*?Average Deal Size \(ASP\)\*?\*?\s*\|\s*[^|]*?\$?(\d+(?:\.\d+)?)\s*M/i);
  const dealTableNum = text.match(/\|\s*\*?\*?Average Deal Size \(ASP\)\*?\*?\s*\|\s*[^|]*?\$?([\d,]+)(?!\s*M)/i);
  const dealBodyM = text.match(/\$?(\d+(?:\.\d+)?)\s*M\b/i);
  const dealBodyK = text.match(/(?:deal\s*size|asp)[:\s]*\$?([\d,]+)\s*k|\$([\d,]+)\s*k\b/i);
  const dealBodyNum = text.match(/(?:deal\s*size|asp|average\s*deal)[:\s]*\$?([\d,]+)(?!\s*[kM])/i);
  if (dealTableM) {
    const n = parseFloat(dealTableM[1]) * 1e6;
    if (n > 0) out.dealSize = Math.round(n);
  } else if (dealTableNum) {
    const n = parseNumber(dealTableNum[1]);
    if (n > 0) out.dealSize = n;
  } else if (dealBodyM) {
    const n = parseFloat(dealBodyM[1]) * 1e6;
    if (n > 0) out.dealSize = Math.round(n);
  } else if (dealBodyK) {
    let n = parseNumber(dealBodyK[1] || dealBodyK[2] || '');
    if (n > 0 && n < 100000) out.dealSize = n * 1000;
    else if (n > 0) out.dealSize = n;
  } else if (dealBodyNum) {
    const n = parseNumber(dealBodyNum[1]);
    if (n > 0) out.dealSize = n;
  }

  // Annual Piped Opptys: "**~12,000**" in table
  const oppMatch =
    text.match(/\|\s*\*?\*?Annual Piped Opptys?\*?\*?\s*\|\s*[^|]*?~?([\d,]+)/i) ??
    text.match(/(?:opportunit(?:y|ies)|pipeline|opptys?)[:\s]*([\d,]+)|([\d,]+)\s*opportunit/i);
  if (oppMatch) {
    const n = parseNumber(oppMatch[1] || oppMatch[2] || '');
    if (n > 0) out.opptys = n;
  }

  // Number of Sales Reps: "**~1,200**" in table
  const repsMatch =
    text.match(/\|\s*\*?\*?Number of Sales Reps?\*?\*?\s*\|\s*[^|]*?~?([\d,]+)/i) ??
    text.match(/(?:sales\s*)?reps?[:\s]*([\d,]+)|([\d,]+)\s*reps?\b/i);
  if (repsMatch) {
    const n = parseNumber(repsMatch[1] || repsMatch[2] || '');
    if (n > 0) out.reps = n;
  }

  // Sales Cycle Duration: "**155 Days**" in table
  const cycleMatch =
    text.match(/\|\s*\*?\*?Sales Cycle Duration\*?\*?\s*\|\s*[^|]*?(\d+)\s*Days?/i) ??
    text.match(/(?:cycle|sales\s*cycle)[:\s]*(\d+)\s*days?|(\d+)\s*days?\s*(?:cycle|avg)/i) ??
    text.match(/(\d+)\s*days?\s*cycle|cycle[:\s]*(\d+)/i);
  if (cycleMatch) {
    const n = parseNumber(cycleMatch[1] || cycleMatch[2] || '');
    if (n > 0) out.cycle = n;
  }

  // Cost per rep (optional in one-pager; keep for other docs)
  const costMatch = text.match(/cost\s*per\s*rep[:\s]*\$?([\d,]+)|(?:per\s*rep\s*)?cost[:\s]*\$?([\d,]+)/i);
  if (costMatch) {
    const n = parseNumber(costMatch[1] || costMatch[2] || '');
    if (n > 0) out.costPerRep = n;
  }

  // Company / scenario: "Nike Wholesale ROI Model", "Apple Enterprise ROI Model", "model for Apple"
  const nameMatch =
    text.match(/([A-Za-z]+)\s+(?:Wholesale|Enterprise|Strategic|B2B|DTC)\s+ROI\s+Model/i) ??
    text.match(/(?:general\s+)?(?:enterprise\s+)?model\s+for\s+([A-Za-z]+)/i) ??
    text.match(/([A-Za-z]+)\s+Enterprise\s+ROI\s+Model/i) ??
    text.match(/(?:company|scenario|model)[:\s]*([^\n.,]+)/i);
  if (nameMatch && nameMatch[1]) {
    let name = nameMatch[1].trim().replace(/\*\*/g, '');
    if (text.match(/\s+Wholesale\s+ROI/i)) name += ' Wholesale';
    else if (text.match(/\s+Enterprise\s+ROI/i) && !name.toLowerCase().includes('enterprise')) name += ' Enterprise';
    if (name.length > 0) out.companyName = name.slice(0, 80);
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
