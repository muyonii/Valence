import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthAction } from '../lib/auth';
import { addActivity } from '../lib/activities';
import { useSessions } from '../lib/sessions';

const Valuation: React.FC = () => {
  const { activeSession } = useSessions();
  const valuationAnal = activeSession?.analysisData?.valuation;
  
  const baseEV = valuationAnal?.baseEnterpriseValue || 0;
  const withAuth = useAuthAction();
  
  const initialAdjustments = valuationAnal?.adjustments ? valuationAnal.adjustments.map((a: any, i: number) => ({
    id: i + 1,
    title: a.description,
    amount: a.type === 'negative' ? -Math.abs(a.amount) : Math.abs(a.amount),
    active: true,
    agent: 'AI Analysis',
    type: a.category || 'misc'
  })) : [];

  const [adjustments, setAdjustments] = useState(initialAdjustments);

  // Sync adjustments when session data changes
  useEffect(() => {
    setAdjustments(initialAdjustments);
  }, [activeSession?.id, valuationAnal]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleAdjustment = (id: number) => {
    setAdjustments((prev: any[]) => prev.map((adj: any) => {
      if (adj.id === id) {
        const nextActive = !adj.active;
        addActivity(
          'valuation', 
          `Valuation Adjustment ${nextActive ? 'Enabled' : 'Disabled'}`, 
          `Auditor toggled "${adj.title}" adjustment (${formatCurrency(adj.amount)}).`
        );
        return { ...adj, active: nextActive };
      }
      return adj;
    }));
  };

  const totalAdjustments = adjustments.filter((a: any) => a.active).reduce((sum: number, adj: any) => sum + adj.amount, 0);
  const adjustedEV = baseEV + totalAdjustments;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] bg-[#F5F4F0] p-6">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-8 h-full">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-stone-200 text-stone-700 text-xs font-bold tracking-widest uppercase rounded">
                    <Calculator size={14} /> Integrated Valuation Engine
                </div>
                <h1 className="text-3xl font-serif font-semibold text-stone-900">Interactive Valuation Model: {activeSession?.name || 'Target'}</h1>
            </div>
            <button 
                onClick={withAuth(() => {})} 
                disabled={baseEV === 0}
                className="px-6 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                Export Model (.xlsx)
            </button>
        </header>

        {baseEV === 0 ? (
          <div className="max-w-xl mx-auto w-full text-center py-16 px-6 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center gap-6 mt-12">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
              <Calculator size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-serif font-bold tracking-tight text-stone-950">No Valuation Data Present</h3>
              <p className="text-sm text-stone-500 max-w-sm">
                We haven't detected an initial enterprise value or EBITDA adjusters. Please upload financial reports or contracts via VDR Ingestion to analyze the Deal valuation.
              </p>
            </div>
            <Link 
              to="/workspace/ingestion"
              className="px-6 py-2.5 bg-stone-950 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-all duration-200 shadow-sm font-medium hover:shadow-md"
            >
              Go to VDR Ingestion
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Control Panel */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
                      <h2 className="text-lg font-semibold text-stone-900 mb-6 flex items-center justify-between">
                          Discovered Adjustments
                          <span className="text-sm font-normal text-stone-500">Toggle to recalculate EV</span>
                      </h2>
                      
                      <div className="space-y-3">
                          {adjustments.map((adj: any) => (
                              <div 
                                  key={adj.id} 
                                  className={`p-4 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                                      adj.active 
                                          ? 'bg-stone-50 border-stone-300' 
                                          : 'bg-white border-stone-100 opacity-60 hover:opacity-100'
                                  }`}
                                  onClick={withAuth(() => toggleAdjustment(adj.id))}
                              >
                                  <div className="flex items-center gap-4">
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${adj.active ? 'bg-stone-900 border-stone-900' : 'border-stone-300'}`}>
                                          {adj.active && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                      </div>
                                      <div>
                                          <p className="font-medium text-stone-900">{adj.title}</p>
                                          <div className="flex gap-2 mt-1">
                                              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 bg-stone-200 px-1.5 py-0.5 rounded">{adj.agent}</span>
                                              <span className="text-xs uppercase tracking-wider text-stone-400">{adj.type}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className={`font-mono font-medium ${adj.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {formatCurrency(adj.amount)}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* The Math Widget */}
              <div className="lg:col-span-1">
                  <div className="bg-stone-900 rounded-xl border border-stone-800 shadow-lg p-6 text-stone-100 sticky top-24">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6">Live Deal Calculation</h3>
                      
                      <div className="space-y-4 font-mono text-sm border-b border-stone-700 pb-6 mb-6">
                          <div className="flex justify-between items-center text-stone-300">
                              <span>Base LOI Valuation</span>
                              <span>{formatCurrency(baseEV)}</span>
                          </div>
                          <div className="flex justify-between items-center text-red-400 border-b border-stone-700 pb-4">
                              <span>Total Adjustments</span>
                              <span>{formatCurrency(totalAdjustments)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xl font-bold text-white pt-2">
                              <span className="font-sans">Adjusted EV</span>
                              <span>{formatCurrency(adjustedEV)}</span>
                          </div>
                      </div>

                      <div className="bg-stone-800 rounded-lg p-4 text-sm text-stone-300">
                          <p className="flex items-center gap-2 text-stone-100 font-semibold mb-2">
                              <Info size={16} className="text-[#bb6cff]" /> Integrated Valuation Analysis
                          </p>
                          <p className="leading-relaxed">
                              The current structure results in an {((totalAdjustments / baseEV) * -100).toFixed(1)}% haircut to the initial LOI valuation. Action required pending adjustments review.
                          </p>
                      </div>
                  </div>
              </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Valuation;
