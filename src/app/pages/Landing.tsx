import React, { useState } from 'react';
import { Link } from 'react-router';
import { FileText, Check, Calculator, Sparkles } from 'lucide-react';
import { useKPIData } from '../context/KPIDataContext';

const kpiLabels: Record<string, string> = {
  companyName: 'Company',
  winRate: 'Win rate',
  dealSize: 'Avg deal size (ASP)',
  opptys: 'Annual piped opptys',
  reps: 'Sales reps',
  cycle: 'Sales cycle',
  costPerRep: 'Cost per rep',
};

export function Landing() {
  const { applyResultsFromText } = useKPIData();
  const [pasteValue, setPasteValue] = useState('');
  const [appliedFields, setAppliedFields] = useState<string[] | null>(null);

  const handleApply = () => {
    if (!pasteValue.trim()) return;
    const parsed = applyResultsFromText(pasteValue);
    setAppliedFields(Object.keys(parsed).map((k) => kpiLabels[k] || k));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">ROI & KPI Modeler</h1>
        <p className="text-slate-600">
          Paste your ROI and KPI estimates from Gemini below, then explore the General Model and Highspot Impact visuals.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-800">Input your ROI & KPI results</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Paste the full document from Gemini (e.g. one-page ROI model with the KPI table). We’ll parse Win Rate, Deal Size (ASP), Annual Piped Opptys, Sales Reps, Sales Cycle, and company name.
        </p>
        <textarea
          value={pasteValue}
          onChange={(e) => { setPasteValue(e.target.value); setAppliedFields(null); }}
          placeholder="Paste your Gemini ROI / KPI document here…"
          className="w-full h-48 px-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          aria-label="Paste ROI and KPI results from Gemini"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleApply}
            disabled={!pasteValue.trim()}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            Apply to model
          </button>
          {appliedFields && appliedFields.length > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <Check className="w-4 h-4" />
              Applied: {appliedFields.join(', ')}
            </span>
          )}
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-sm font-medium text-slate-600">Then go to:</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/general"
          className="flex items-center gap-4 p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
        >
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">General Model</h3>
            <p className="text-sm text-slate-500 mt-0.5">Company-wide ROI & KPI visuals</p>
          </div>
        </Link>
        <Link
          to="/highspot"
          className="flex items-center gap-4 p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-left"
        >
          <div className="p-3 bg-emerald-100 rounded-lg">
            <Sparkles className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Highspot Impact</h3>
            <p className="text-sm text-slate-500 mt-0.5">Before/after impact on KPIs & ROI</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
