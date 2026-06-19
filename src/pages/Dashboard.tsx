import React from 'react';
import { Activity, ShieldAlert, BarChart3, TrendingDown, Info, CircleDollarSign, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Markdown from 'react-markdown';
import { ActivityFeed } from '../components/ActivityFeed';
import { useSessions } from '../lib/sessions';

const Dashboard: React.FC = () => {
  const { activeSession } = useSessions();
  const analysis = activeSession?.analysisData?.dashboard;
  const valuationAnal = activeSession?.analysisData?.valuation;

  const totalValue = analysis?.totalValueFound || 0;
  const currency = analysis?.totalValueCurrency || "USD";
  const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, notation: 'compact' }).format(totalValue);
  
  const impliedEV = valuationAnal?.baseEnterpriseValue || 0;
  const formattedImpliedEV = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, notation: 'compact' }).format(impliedEV);

  const adjEV = valuationAnal?.adjustedEnterpriseValue || 0;
  const formattedAdjEV = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, notation: 'compact' }).format(adjEV);
  
  const difference = adjEV - impliedEV;
  const formattedDiff = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, notation: 'compact' }).format(Math.abs(difference));

  const chartData = valuationAnal?.adjustments ? [
    { name: 'Initial', value: impliedEV / 1000000 },
    ...valuationAnal.adjustments.map((a: any) => ({ name: a.category, value: (impliedEV + (a.type === 'negative' ? -a.amount : a.amount)) / 1000000 })),
    { name: 'Current', value: adjEV / 1000000 }
  ] : [];

  const criticalRisks = analysis?.criticalRisksIdentified ?? 0;
  const score = activeSession?.analysisData?.executiveBrief?.confidenceScore ?? 0;

  const recommendation = activeSession?.analysisData?.executiveBrief?.goNoGoRecommendation ?? "Awaiting Data";
  const summary = activeSession?.analysisData?.executiveBrief?.executiveSummary ?? "Please proceed to AI Ingestion to start analysis.";

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs font-bold tracking-widest uppercase rounded">{activeSession?.name || 'Project Phoenix'}</span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold tracking-widest uppercase rounded">{activeSession ? 'AI Analyzed' : 'B2B SaaS'}</span>
           </div>
           <h1 className="text-3xl font-serif font-bold tracking-tight text-stone-950">Target Company Analysis</h1>
        </div>
        <div className="flex items-center gap-6 bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
           <div className="text-right">
              <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold">Implied EV</p>
              <p className="text-xl font-medium text-stone-900">{formattedImpliedEV}</p>
           </div>
           <div className="w-px h-8 bg-stone-200"></div>
           <div className="text-right">
              <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold w-full flex justify-end gap-1 items-center">Risk Score <Info size={12}/></p>
              <p className={`text-xl font-medium flex items-center gap-2 justify-end ${score > 70 ? 'text-red-600' : score > 30 ? 'text-amber-600' : 'text-green-600'}`}>
                 {score}/100 
              </p>
           </div>
        </div>
      </header>

      {/* Escalation Alert Banner */}
      {score > 70 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm text-red-950">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0 animate-pulse">
                 <ShieldAlert size={20} />
              </div>
              <div>
                 <h4 className="font-bold text-sm uppercase tracking-wide">Automatic Escalation Triggered (Agent 6)</h4>
                 <p className="text-xs text-red-700 mt-0.5">
                    Overall risk score of {score} exceeds the threshold of 70. High legal or valuation exposure requires CFO and Legal Counsel written sign-off before proceeding with LOI.
                 </p>
              </div>
           </div>
           <span className="text-[10px] font-mono select-none uppercase tracking-widest bg-red-200 text-red-800 px-2 py-1 rounded font-bold">
              Escalation Active
           </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* The "Go/No-Go" Terminal */}
         <div className="lg:col-span-2 bg-stone-900 rounded-xl p-6 text-stone-100 shadow-md border border-stone-800 flex flex-col justify-between relative overflow-hidden">
             
             <div className="absolute top-0 right-0 p-4 opacity-50">
                 <ShieldAlert size={120} className="text-stone-800" />
             </div>

             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-[#bb6cff] rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold tracking-widest text-stone-300 uppercase">Agent 6 Executive Arbitrator</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-white mb-4">{recommendation}</h2>
                <div className="prose prose-invert text-stone-300 text-sm leading-relaxed max-w-none space-y-3 mb-6">
                  <Markdown
                    components={{
                      p: ({children}) => <p className="mb-2.5 text-stone-300 leading-relaxed last:mb-0">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-5 my-2 space-y-1.5 text-stone-300">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-5 my-2 space-y-1.5 text-stone-300">{children}</ol>,
                      li: ({children}) => <li className="text-stone-300">{children}</li>,
                      strong: ({children}) => <strong className="font-semibold text-amber-400">{children}</strong>,
                      em: ({children}) => <em className="italic text-stone-400">{children}</em>,
                    }}
                  >
                    {summary}
                  </Markdown>
                </div>
             </div>
             
             <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
                  <div className="p-3 border border-stone-700 bg-stone-800 rounded-lg">
                    <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-1">Financial Forensic (A2)</p>
                    <p className="text-red-400 font-medium text-xs truncate">{activeSession?.analysisData?.workstreams?.financial?.status || 'Pending'}</p>
                 </div>
                 <div className="p-3 border border-stone-700 bg-stone-800 rounded-lg">
                    <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-1">Legal Compliance (A3)</p>
                    <p className="text-amber-400 font-medium text-xs truncate">{activeSession?.analysisData?.workstreams?.legal?.status || 'Pending'}</p>
                 </div>
                 <div className="p-3 border border-stone-700 bg-stone-800 rounded-lg">
                    <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-1">Valuation Adjuster (A4)</p>
                    <p className="text-purple-400 font-medium text-xs truncate">{activeSession?.analysisData?.workstreams?.valuation?.status || 'Pending'}</p>
                 </div>
                 <div className="p-3 border border-stone-700 bg-stone-800 rounded-lg">
                    <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-1">Risk Synthesis (A5)</p>
                    <p className="text-blue-400 font-medium text-xs truncate">{activeSession?.analysisData?.workstreams?.risk?.status || 'Pending'}</p>
                 </div>
             </div>
         </div>

         {/* Mini Valuation Graph */}
         <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-stone-900">Adjusted Valuation</h3>
                <CircleDollarSign size={18} className="text-stone-400" />
            </div>
            <p className={`text-3xl font-medium mb-1 flex items-center gap-2 ${difference < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formattedAdjEV} {difference < 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
            </p>
            <p className="text-sm text-stone-500 mb-6">{difference < 0 ? '-' : '+'}{formattedDiff} from Initial</p>
            
            <div className="flex-1 min-h-[150px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#78716c'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#78716c'}} domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#ef4444" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>
      
      {/* Risk & Audit Trail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="font-sans font-bold text-lg text-stone-900 tracking-tight border-b border-stone-200 pb-2 mb-4">Critical Compound Risks Identified ({criticalRisks})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSession?.analysisData?.executiveBrief?.redFlags ? activeSession.analysisData.executiveBrief.redFlags.map((flag: string, i: number) => (
                <div key={i} className="p-5 bg-red-50 border border-red-100 rounded-xl flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                       <ShieldAlert className="text-red-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-red-900">Risk #{i+1}</h4>
                        <p className="text-sm text-red-800 mt-1">
                            {flag}
                        </p>
                    </div>
                </div>
              )) : (
                <div className="p-5 bg-stone-50 border border-stone-100 rounded-xl">
                  <p className="text-sm text-stone-500">No data available. Please complete AI ingestion.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
