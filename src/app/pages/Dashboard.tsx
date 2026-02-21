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
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Clock, 
  DollarSign, 
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { clsx } from 'clsx';
import { useKPIData } from '../context/KPIDataContext';

export function Dashboard() {
  const { data, setData, resetData } = useKPIData();

  // Calculations
  const totalPipelineValue = data.opptys * data.dealSize;
  const projectedRevenue = totalPipelineValue * (data.winRate / 100);
  const totalCost = data.reps * data.costPerRep;
  const netProfit = projectedRevenue - totalCost;
  const roi = (netProfit / totalCost) * 100;
  const revenuePerRep = projectedRevenue / data.reps;
  const dealsPerRep = (data.opptys * (data.winRate / 100)) / data.reps;

  // Chart Data - Sensitivity Analysis (Win Rate Impact)
  const sensitivityData = [-5, 0, 5, 10].map(change => {
    const newWinRate = Math.min(100, Math.max(0, data.winRate + change));
    const revenue = (data.opptys * data.dealSize * (newWinRate / 100));
    return {
      name: `${newWinRate}%`,
      revenue: revenue,
      isCurrent: change === 0
    };
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0,
      notation: val > 999999 ? 'compact' : 'standard' 
    }).format(val);

  const formatNumber = (val: number) => 
    new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
          <Briefcase className="w-3 h-3" />
          {data.companyName}
        </div>
        <button
          onClick={resetData}
          className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
        >
          Reset to Default
        </button>
      </div>

      <div>
        
        {/* Top Level Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            title="Projected Revenue" 
            value={formatCurrency(projectedRevenue)} 
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
            trend="From pipeline × win rate"
            trendUp={true}
            color="emerald"
          />
          <SummaryCard 
            title="Est. ROI" 
            value={`${roi.toFixed(1)}%`} 
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            trend="Based on Rep Cost"
            color="blue"
          />
          <SummaryCard 
            title="Revenue Per Rep" 
            value={formatCurrency(revenuePerRep)} 
            icon={<Users className="w-5 h-5 text-indigo-600" />}
            trend={`${dealsPerRep.toFixed(1)} Deals/Rep`}
            color="indigo"
          />
          <SummaryCard 
            title="Pipeline Velocity" 
            value={`$${formatNumber(totalPipelineValue / (data.cycle / 30))} / mo`} 
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            trend={`${data.cycle} Days Avg Cycle`}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                KPI Inputs
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Adjust the drivers below to see how changes impact the bottom line.
              </p>
              
              <div className="space-y-6">
                <KPICard
                  title="Win Rate"
                  value={data.winRate}
                  min={10}
                  max={60}
                  unit="%"
                  onChange={(val) => setData(prev => ({ ...prev, winRate: val }))}
                  description="Percentage of qualified opportunities that close won."
                  commentary="Enterprise B2B benchmarks often sit in the 25–40% range by segment."
                  color="blue"
                />

                <KPICard
                  title="Avg Deal Size (ASP)"
                  value={data.dealSize}
                  min={50000}
                  max={5000000}
                  step={10000}
                  prefix="$"
                  onChange={(val) => setData(prev => ({ ...prev, dealSize: val }))}
                  description="Average contract value per closed deal."
                  commentary="Varies by segment (e.g. mid-market vs strategic/enterprise)."
                  color="indigo"
                />

                <KPICard
                  title="Annual Piped Opptys"
                  value={data.opptys}
                  min={1000}
                  max={500000}
                  step={500}
                  onChange={(val) => setData(prev => ({ ...prev, opptys: val }))}
                  description="Total qualified opportunities in the pipeline per year."
                  commentary="Driven by coverage model, TAM, and conversion from lead to opportunity."
                  color="green"
                />

                <KPICard
                  title="Sales Reps"
                  value={data.reps}
                  min={50}
                  max={10000}
                  step={50}
                  onChange={(val) => setData(prev => ({ ...prev, reps: val }))}
                  description="Quota-carrying account executives and sales roles."
                  commentary="Fully loaded headcount (OTE + benefits, ramp, management)."
                  color="amber"
                />

                <KPICard
                  title="Avg Sales Cycle"
                  value={data.cycle}
                  min={30}
                  max={365}
                  step={5}
                  unit=" Days"
                  onChange={(val) => setData(prev => ({ ...prev, cycle: val }))}
                  description="Average days from opportunity creation to closed won."
                  commentary="Enterprise deals often 90–200 days; varies by deal size and complexity."
                  color="slate"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-lg font-bold text-slate-800">Revenue Sensitivity</h3>
                    <p className="text-sm text-slate-500">Impact of win rate changes on total revenue</p>
                 </div>
                 <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-full">
                    Live Projection
                 </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sensitivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tickFormatter={(val) => `$${val / 1000000000}B`} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg">
                              <p className="font-bold mb-1">{payload[0].payload.name} Win Rate</p>
                              <p>Revenue: {formatCurrency(payload[0].value as number)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]} barSize={60}>
                      {sensitivityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#3b82f6' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center text-xs text-slate-400">
                Current Win Rate: <strong>{data.winRate}%</strong> vs Sensitivity Range
              </div>
            </div>

            {/* Pipeline Funnel Visual */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-lg font-bold text-slate-800 mb-6">Pipeline Flow</h3>
               <div className="space-y-4">
                  <FunnelStage 
                    label="Total Pipeline Value" 
                    value={totalPipelineValue} 
                    color="bg-slate-200" 
                    textColor="text-slate-600"
                    width="100%"
                    subtext={`${formatNumber(data.opptys)} Opportunities`}
                  />
                  
                  {/* Intermediate inferred stage for visual effect */}
                  <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-slate-300 rotate-90 my-1" /></div>
                  
                  <FunnelStage 
                    label="Projected Revenue (Won)" 
                    value={projectedRevenue} 
                    color="bg-emerald-100" 
                    barColor="bg-emerald-500"
                    textColor="text-emerald-900"
                    width={`${data.winRate}%`}
                    subtext={`${data.winRate}% Win Rate`}
                  />
               </div>

               <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Deal Velocity</div>
                    <div className="text-2xl font-bold text-slate-800">{data.cycle} Days</div>
                    <div className="text-xs text-slate-400 mt-1">Avg time to close</div>
                  </div>
                   <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Avg Deal Size</div>
                    <div className="text-2xl font-bold text-slate-800">{formatCurrency(data.dealSize)}</div>
                    <div className="text-xs text-slate-400 mt-1">Per closed opportunity</div>
                  </div>
               </div>
            </div>

            {/* ROI Explanation */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">ROI Summary</h3>
                    <p className="text-blue-100 text-sm max-w-md">
                       At <strong>{formatCurrency(data.costPerRep)}</strong> fully loaded cost per rep (OTE + benefits, ramp, overhead), 
                       the sales organization shows a <strong>{roi.toFixed(0)}%</strong> return on investment from projected revenue.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{roi.toFixed(0)}%</div>
                    <div className="text-blue-200 text-sm">Net ROI</div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, trend, trendUp, color }: any) {
  const colorStyles: any = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
  };
  
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={clsx("p-2 rounded-lg", colorStyles[color])}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-slate-500 text-sm font-medium mb-1">{title}</div>
        <div className="text-2xl font-bold text-slate-900 mb-2">{value}</div>
        <div className="text-xs text-slate-400 font-medium">
          {trend}
        </div>
      </div>
    </div>
  );
}

function FunnelStage({ label, value, color, barColor, textColor, width, subtext }: any) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0,
      notation: 'compact' 
    }).format(val);

  return (
    <div className="relative">
      <div className="flex justify-between text-sm font-medium mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{formatCurrency(value)}</span>
      </div>
      <div className="h-12 w-full bg-slate-100 rounded-lg overflow-hidden relative flex items-center px-4">
         <div 
            className={clsx("absolute left-0 top-0 bottom-0 transition-all duration-500", barColor || color)} 
            style={{ width }}
         />
         <div className="relative z-10 flex justify-between w-full">
            <span className={clsx("text-xs font-bold uppercase tracking-wider", textColor)}>
               {subtext}
            </span>
         </div>
      </div>
    </div>
  );
}
