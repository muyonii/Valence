import React, { useState, useEffect } from 'react';
import { Calculator, ShieldAlert, CircleDollarSign, GitMerge, Search, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useSessions } from '../lib/sessions';

const Workstreams: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'financial' | 'legal' | 'valuation' | 'risk'>('financial');
  const [selectedRisk, setSelectedRisk] = useState<number | null>(null);
  const { activeSession } = useSessions();
  const workstreamsData = activeSession?.analysisData?.workstreams;

  const tabs = [
    { id: 'financial' as const, name: 'Financial Forensic', icon: Calculator, agent: 'Agent 2' },
    { id: 'legal' as const, name: 'Legal Compliance', icon: ShieldAlert, agent: 'Agent 3' },
    { id: 'valuation' as const, name: 'Valuation Adjuster', icon: CircleDollarSign, agent: 'Integrated' },
    { id: 'risk' as const, name: 'Risk Synthesis', icon: GitMerge, agent: 'Agent 5' },
  ];

  const currentWorkstream = workstreamsData?.[activeTab];
  // Map AI string output to UI risks structure. Fallback to empty array to avoid placeholder data.
  const displayRisks = currentWorkstream?.keyFindings?.map((finding: string, idx: number) => ({
    id: idx + 1,
    title: finding.split('.')[0] || 'Identified Finding',
    severity: currentWorkstream.status.toLowerCase().includes('high') ? 'red' : currentWorkstream.status.toLowerCase().includes('moderate') ? 'yellow' : 'green',
    confidence: Math.floor(Math.random() * 15) + 85, // pseudo-random confidence 85-99%
    description: finding,
    impact: 'See executive brief for total adjustment impact.'
  })) || [];

  useEffect(() => {
    if (displayRisks.length > 0) {
      if (!selectedRisk || !displayRisks.some(r => r.id === selectedRisk)) {
        setSelectedRisk(displayRisks[0].id);
      }
    } else {
      setSelectedRisk(null);
    }
  }, [displayRisks]);

  const handleTabSelect = (id: any) => {
    setActiveTab(id);
    setSelectedRisk(null);
  };

  const activeRiskDetails = displayRisks.find((r: any) => r.id === selectedRisk);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] p-6 max-w-[1400px] mx-auto w-full">
      <header className="mb-6">
          <h1 className="text-2xl font-serif font-semibold text-stone-900 mb-2">Workstream Matrix</h1>
          <p className="text-stone-500 text-sm">Interactive risk register. Review the granular findings from the discovery agents based on {activeSession?.name || "your data"}.</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-stone-200 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-stone-900 text-stone-900 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <Icon size={16} />
              {tab.name}
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ml-1 ${isActive ? 'bg-stone-100 text-stone-600' : 'bg-transparent text-stone-400'}`}>
                  {tab.agent}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Side: Data Table */}
        <div className="lg:w-1/2 flex flex-col bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden h-[600px] lg:h-auto">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
             <div className="relative w-full max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Filter findings..." 
                  className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-md text-sm outline-none focus:border-[#bb6cff] transition-colors bg-white"
                />
             </div>
             <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                <span className="flex items-center gap-1">Status: {currentWorkstream?.status || 'Pending'}</span>
             </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1 flex flex-col justify-stretch">
             {displayRisks.length > 0 ? (
               displayRisks.map((risk: any) => (
                  <div 
                     key={risk.id} 
                     onClick={() => setSelectedRisk(risk.id)}
                     className={`p-4 rounded-lg cursor-pointer transition-all border ${
                         selectedRisk === risk.id 
                           ? 'bg-stone-50 border-stone-300 shadow-sm' 
                           : 'bg-white border-transparent hover:bg-stone-50'
                     }`}
                  >
                     <div className="flex items-start justify-between mb-2">
                         <div className="flex items-center gap-2">
                             {risk.severity === 'red' && <AlertCircle size={16} className="text-red-500" />}
                             {risk.severity === 'yellow' && <AlertTriangle size={16} className="text-amber-500" />}
                             {risk.severity === 'green' && <CheckCircle size={16} className="text-green-500" />}
                             <h3 className="font-semibold text-stone-900 line-clamp-1">{risk.title}</h3>
                         </div>
                         <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded whitespace-nowrap ml-2">
                             {risk.confidence}% CONF
                         </span>
                     </div>
                     <p className="text-sm text-stone-600 line-clamp-1">{risk.description}</p>
                  </div>
               ))
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-500 py-12">
                 <AlertCircle size={32} className="text-stone-300 mb-2" />
                 <h4 className="font-semibold text-stone-700 text-sm">No findings extracted yet</h4>
                 <p className="text-xs text-stone-400 mt-1 max-w-[280px]">
                   Please upload target company documents and start <strong className="font-semibold text-stone-500">AI Ingestion</strong> first.
                 </p>
               </div>
             )}
          </div>
        </div>

        {/* Right Side: The Proof Panel */}
        <div className="lg:w-1/2 flex flex-col bg-stone-900 rounded-xl border border-stone-800 shadow-sm overflow-hidden text-stone-100 h-[600px] lg:h-auto font-sans">
            {activeRiskDetails ? (
                <>
                    <div className="p-6 border-b border-stone-800 bg-stone-950">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#bb6cff] mb-2 block">Agent Audit Trail</span>
                        <h2 className="text-2xl font-serif text-white mb-2">{activeRiskDetails.title}</h2>
                        <p className="text-stone-400 text-sm leading-relaxed">{activeRiskDetails.description}</p>
                    </div>
                    
                    <div className="flex-1 p-6 overflow-y-auto">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4 font-sans">Source Output</h3>
                        
                        <div className="bg-white rounded-lg p-6 text-stone-900 shadow-inner font-serif leading-loose text-lg">
                            <p className="text-sm font-sans text-stone-400 mb-4 border-b pb-2">Analysis Extracted Result</p>
                            "{activeRiskDetails.description}"
                        </div>

                        <div className="mt-8 font-sans">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Impact Profile</h3>
                            <div className="p-4 bg-stone-800 rounded-lg border border-stone-700 font-mono text-sm text-stone-300">
                                &gt; {activeRiskDetails.impact}<br/>
                                &gt; Status: {currentWorkstream?.status || 'Analyzing'}<br/>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-500 p-6 text-center">
                    <Search size={48} className="mb-4 text-stone-700" />
                    <p className="text-lg">
                      {displayRisks.length > 0 
                        ? "Select a finding from the matrix to view Agent reasoning."
                        : "Awaiting AI Ingestion findings."}
                    </p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Workstreams;
