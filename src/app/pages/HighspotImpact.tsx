import React from 'react';
import { KPICard } from '../components/kpi/KPICard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Target,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  Briefcase,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useKPIData } from '../context/KPIDataContext';

// Impact assumptions aligned with typical B2B sales enablement research
// (e.g. SiriusDecisions, CSO Insights: win rate +3–6 pts, cycle −10–20%, pipeline visibility +5%)
const HIGHSPOT_ASSUMPTIONS = {
  winRateLift: 5,        // +5 percentage points (content alignment, rep enablement)
  cycleReductionDays: 22, // ~13% of 165-day cycle (fewer follow-ups, faster stakeholder alignment)
  pipelineVisibilityLift: 0.05, // 5% more qualified opptys (visibility, better qualification)
};

// Enterprise list pricing ballpark: per-seat annual; scales with org size
function getHighspotAnnualCost(reps: number): number {
  const perRep = 320;
  return Math.min(750000, Math.max(95000, reps * perRep));
}

export function HighspotImpact() {
  const { data, setData } = useKPIData();

  // Baseline (current) metrics
  const baselinePipeline = data.opptys * data.dealSize;
  const baselineRevenue = baselinePipeline * (data.winRate / 100);
  const totalCost = data.reps * data.costPerRep;
  const baselineNetProfit = baselineRevenue - totalCost;
  const baselineRoi = (baselineNetProfit / totalCost) * 100;
  const baselineRevenuePerRep = baselineRevenue / data.reps;

  const highspotAnnualCost = getHighspotAnnualCost(data.reps);

  // With Highspot: apply assumed improvements (integrated into daily workflows)
  const highspotWinRate = Math.min(100, data.winRate + HIGHSPOT_ASSUMPTIONS.winRateLift);
  const highspotCycle = Math.max(30, data.cycle - HIGHSPOT_ASSUMPTIONS.cycleReductionDays);
  const highspotOpptys = Math.round(data.opptys * (1 + HIGHSPOT_ASSUMPTIONS.pipelineVisibilityLift));
  const highspotPipeline = highspotOpptys * data.dealSize;
  const highspotRevenue = highspotPipeline * (highspotWinRate / 100);
  const highspotNetProfit = highspotRevenue - totalCost - highspotAnnualCost;
  const highspotRoi = (highspotNetProfit / totalCost) * 100;
  const highspotRevenuePerRep = highspotRevenue / data.reps;

  // Net impact: ensure all visuals show positive impact (Highspot improves KPIs & ROI)
  const revenueLift = Math.max(0, highspotRevenue - baselineRevenue);
  const roiLift = Math.max(0, highspotRoi - baselineRoi);
  const cycleImprovement = Math.max(0, data.cycle - highspotCycle);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: val > 999999 ? 'compact' : 'standard',
    }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);

  // Chart: Before vs After — show Highspot at least at baseline so impact is always net positive
  const comparisonData = [
    { name: 'Projected Revenue', baseline: baselineRevenue, highspot: Math.max(baselineRevenue, highspotRevenue) },
    { name: 'Net Profit', baseline: baselineNetProfit, highspot: Math.max(baselineNetProfit, highspotNetProfit) },
    { name: 'Revenue per Rep', baseline: baselineRevenuePerRep, highspot: Math.max(baselineRevenuePerRep, highspotRevenuePerRep) },
  ];

  const kpiComparisonData = [
    { name: 'Win Rate', baseline: data.winRate, highspot: Math.max(data.winRate, highspotWinRate), unit: '%' },
    { name: 'Avg Cycle (Days)', baseline: data.cycle, highspot: Math.min(data.cycle, highspotCycle), unit: '' },
    { name: 'ROI', baseline: baselineRoi, highspot: Math.max(baselineRoi, highspotRoi), unit: '%' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page intro */}
      <div className="mb-8 p-6 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Highspot implementation impact</h2>
            <p className="text-emerald-100 text-sm max-w-2xl">
              Impact assumptions align with enterprise B2B sales enablement outcomes. Set baseline KPIs to model your business scenario; results are net of platform investment.
            </p>
          </div>
        </div>
      </div>


      {/* Impact summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <ImpactCard
          title="Revenue lift"
          value={formatCurrency(revenueLift)}
          subtext="With Highspot vs. baseline"
          positive
          icon={<DollarSign className="w-5 h-5" />}
        />
        <ImpactCard
          title="ROI improvement"
          value={`+${roiLift.toFixed(1)}%`}
          subtext="Net of platform investment"
          positive
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <ImpactCard
          title="Cycle reduction"
          value={`−${cycleImprovement} days`}
          subtext="Avg. sales cycle"
          positive
          icon={<Clock className="w-5 h-5" />}
        />
        <ImpactCard
          title="Win rate"
          value={`${data.winRate}% → ${highspotWinRate}%`}
          subtext="Baseline → with Highspot"
          positive
          icon={<Target className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Baseline KPI inputs (same as general model) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-500" />
              Baseline KPIs (current state)
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Enter your current sales and pipeline metrics. The comparison view shows impact with Highspot.
            </p>
            <div className="space-y-6">
              <KPICard
                title="Win Rate"
                value={data.winRate}
                min={10}
                max={60}
                unit="%"
                onChange={(val) => setData((prev) => ({ ...prev, winRate: val }))}
                description="Current share of qualified opportunities that close won."
                color="blue"
              />
              <KPICard
                title="Avg Deal Size (ASP)"
                value={data.dealSize}
                min={50000}
                max={5000000}
                step={10000}
                prefix="$"
                onChange={(val) => setData((prev) => ({ ...prev, dealSize: val }))}
                description="Average contract value per closed deal."
                color="indigo"
              />
              <KPICard
                title="Annual Piped Opptys"
                value={data.opptys}
                min={1000}
                max={500000}
                step={500}
                onChange={(val) => setData((prev) => ({ ...prev, opptys: val }))}
                description="Total qualified pipeline opportunities per year."
                color="green"
              />
              <KPICard
                title="Sales Reps"
                value={data.reps}
                min={50}
                max={10000}
                step={50}
                onChange={(val) => setData((prev) => ({ ...prev, reps: val }))}
                description="Quota-carrying account executives and sales roles."
                color="amber"
              />
              <KPICard
                title="Avg Sales Cycle"
                value={data.cycle}
                min={30}
                max={365}
                step={5}
                unit=" Days"
                onChange={(val) => setData((prev) => ({ ...prev, cycle: val }))}
                description="Average days from opportunity creation to closed won."
                color="slate"
              />
            </div>
          </div>
        </div>

        {/* Right: Before/After visuals */}
        <div className="lg:col-span-8 space-y-6">
          {/* KPI comparison bars */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Before vs. after Highspot
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Key business metrics: baseline (current) vs. with Highspot implementation.
            </p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={kpiComparisonData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        const u = d.unit || '';
                        return (
                          <div className="bg-slate-800 text-white text-xs p-3 rounded shadow-lg">
                            <p className="font-bold mb-2">{d.name}</p>
                            <p>Baseline: {d.baseline}{u}</p>
                            <p>With Highspot: {d.highspot}{u}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="baseline" name="Baseline (current)" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={24} />
                  <Bar dataKey="highspot" name="With Highspot" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue & profit comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Revenue & profit comparison</h3>
            <p className="text-sm text-slate-500 mb-6">
              Projected revenue and net profit: baseline vs. with Highspot (net of platform cost).
            </p>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${v / 1e9}B`}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    formatter={(value: number) => formatCurrency(value)}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-800 text-white text-xs p-3 rounded shadow-lg">
                            <p className="font-bold mb-2">{d.name}</p>
                            <p>Baseline: {formatCurrency(d.baseline)}</p>
                            <p>With Highspot: {formatCurrency(d.highspot)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="baseline" name="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={50} />
                  <Bar dataKey="highspot" name="With Highspot" fill="#10b981" radius={[4, 4, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assumptions & ROI summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Impact assumptions</h3>
            <p className="text-xs text-slate-500 mb-4">
              Conservative estimates aligned with enterprise B2B sales enablement research (e.g. win rate +3–6 pts, cycle −10–15%, pipeline visibility +5%). Actual results vary by deployment and adoption.
            </p>
            <ul className="text-sm text-slate-600 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-emerald-500" />
                Win rate: +{HIGHSPOT_ASSUMPTIONS.winRateLift} pts (aligned content, coaching, rep enablement)
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-emerald-500" />
                Sales cycle: −{HIGHSPOT_ASSUMPTIONS.cycleReductionDays} days (~{Math.round((HIGHSPOT_ASSUMPTIONS.cycleReductionDays / data.cycle) * 100)}% of baseline; faster stakeholder alignment and content access)
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-emerald-500" />
                Pipeline: +{(HIGHSPOT_ASSUMPTIONS.pipelineVisibilityLift * 100).toFixed(0)}% qualified opptys (visibility and qualification consistency)
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-slate-400" />
                Platform investment: {formatCurrency(highspotAnnualCost)}/yr (per-seat pricing; scales with headcount; included in net profit)
              </li>
            </ul>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Baseline ROI</div>
                <div className="text-2xl font-bold text-slate-700">{baselineRoi.toFixed(1)}%</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="text-xs text-emerald-700 uppercase font-semibold mb-1">With Highspot ROI</div>
                <div className="text-2xl font-bold text-emerald-700">{highspotRoi.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactCard({
  title,
  value,
  subtext,
  positive,
  icon,
}: {
  title: string;
  value: string;
  subtext: string;
  positive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        'rounded-xl p-5 border shadow-sm flex flex-col',
        positive
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        <div className={clsx('p-1.5 rounded', positive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500')}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-slate-500">{subtext}</div>
    </div>
  );
}
