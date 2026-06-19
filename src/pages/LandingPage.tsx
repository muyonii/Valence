import React, { useState, useEffect } from 'react';
import { HeroScene } from '../../components/QuantumScene';
import { ArrowDown, Menu, X, FileText, Calculator, BarChart3, ShieldAlert, Users, Settings, CircleDollarSign, ShieldCheck, GitMerge, Gavel, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AgentCard = ({ title, role, mandate, responsibilities, outputs, icon: Icon, delay, isDark }: any) => (
  <div className={`flex flex-col group animate-fade-in-up p-8 rounded-xl border shadow-sm hover:shadow-xl transition-all duration-500 w-full hover:border-nobel-gold/50 ${isDark ? 'bg-[#141211] border-[#2D2825] text-stone-100' : 'bg-white border-stone-200 text-stone-900 relative overflow-hidden'}`} style={{ animationDelay: delay }}>
    {!isDark && (
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-nobel-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    )}
    <div className="flex items-start gap-4 mb-4 relative z-10">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 duration-500 ${isDark ? 'bg-[#221F1E] text-nobel-gold group-hover:bg-nobel-gold group-hover:text-[#141211]' : 'bg-stone-50 text-nobel-gold border border-stone-100 group-hover:bg-nobel-gold group-hover:text-white group-hover:border-nobel-gold'}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className={`font-serif text-2xl ${isDark ? 'text-white' : 'text-stone-900'}`}>{title}</h3>
        <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-[#D4C8C3]' : 'text-stone-500'}`}>{role}</p>
      </div>
    </div>
    <div className="w-12 h-0.5 bg-nobel-gold mb-6 opacity-60 transition-all duration-500 group-hover:w-full group-hover:opacity-30"></div>
    <div className="mb-4 relative z-10">
      <strong className={`text-sm tracking-wide uppercase ${isDark ? 'text-[#E7E0DC]' : 'text-stone-900'}`}>Core Mandate:</strong>
      <p className={`text-sm mt-1 leading-relaxed ${isDark ? 'text-[#D4C8C3]' : 'text-stone-600'}`}>{mandate}</p>
    </div>
    <div className="mb-6 flex-grow relative z-10">
      <strong className={`text-sm tracking-wide uppercase ${isDark ? 'text-[#E7E0DC]' : 'text-stone-900'}`}>Responsibilities:</strong>
      <ul className={`list-disc pl-5 text-sm mt-2 space-y-1.5 leading-relaxed ${isDark ? 'text-[#D4C8C3]' : 'text-stone-600'}`}>
        {responsibilities.map((r: string, i: number) => <li key={i}>{r}</li>)}
      </ul>
    </div>
    <div className={`p-4 rounded-lg border mt-auto relative z-10 transition-colors duration-500 ${isDark ? 'bg-[#1C1A19] border-[#2D2825] group-hover:border-nobel-gold/30' : 'bg-[#FAF9F6] border-stone-100 group-hover:bg-white group-hover:border-nobel-gold/20'}`}>
      <strong className={`text-sm block mb-1 tracking-wide uppercase ${isDark ? 'text-[#E7E0DC]' : 'text-stone-900'}`}>Outputs:</strong>
      <p className={`text-sm italic leading-relaxed ${isDark ? 'text-[#D4C8C3]' : 'text-stone-600'}`}>{outputs}</p>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-stone-800 selection:bg-nobel-gold selection:text-white flex flex-col">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#F9F8F4]/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className={`font-serif font-bold text-xl tracking-wide transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              VALENCE
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-stone-600">
            <a href="#introduction" onClick={scrollToSection('introduction')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Introduction</a>
            <a href="#layer-1" onClick={scrollToSection('layer-1')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Ingestion</a>
            <a href="#layer-2" onClick={scrollToSection('layer-2')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Execution</a>
            <a href="#layer-3" onClick={scrollToSection('layer-3')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Synthesis</a>
            <Link to="/workspace/ingestion" className="px-5 py-2.5 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 transition-colors shadow-md">
              Initialize War Room
            </Link>
          </div>

          <button className="md:hidden text-stone-900 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#F9F8F4] flex flex-col items-center justify-center gap-8 text-xl font-serif animate-fade-in">
            <a href="#introduction" onClick={scrollToSection('introduction')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Introduction</a>
            <a href="#layer-1" onClick={scrollToSection('layer-1')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Ingestion</a>
            <a href="#layer-2" onClick={scrollToSection('layer-2')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Execution</a>
            <a href="#layer-3" onClick={scrollToSection('layer-3')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Synthesis</a>
            <Link to="/workspace/ingestion" className="px-6 py-3 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 transition-colors shadow-md text-lg">
              Initialize War Room
            </Link>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroScene />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(249,248,244,0.92)_0%,rgba(249,248,244,0.6)_50%,rgba(249,248,244,0.3)_100%)]" />

        <div className="relative z-10 container mx-auto px-6 text-center mt-12">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 border border-nobel-gold/50 text-nobel-gold text-xs tracking-widest uppercase font-bold rounded-full backdrop-blur-sm bg-white/30 shadow-sm">
            Autonomous Due Diligence for Elite Deal Teams
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.1] mb-8 text-stone-900 drop-shadow-sm max-w-5xl mx-auto">
            Zero-compromise document verification in <span className="italic text-nobel-gold">hours, not weeks.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-stone-600 font-light leading-relaxed mb-10">
            A comprehensive AI ecosystem featuring 6 specialized agents working sequentially, eliminating M&A silos to execute deep corporate due diligence with absolute rigor.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
             <Link to="/workspace/ingestion" className="px-8 py-4 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 transition-colors shadow-xl shadow-stone-900/10 text-lg flex items-center gap-3 group border border-stone-800">
                Initialize War Room <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-nobel-gold" />
             </Link>
             <div className="flex items-center gap-2 text-stone-500 text-xs font-medium uppercase tracking-wider mt-4 sm:mt-0">
               <ShieldCheck size={16} /> SOC2 Type II • ISO 27001 • Zero-Data-Retention
             </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        {/* Master Architecture Flow */}
        <section className="py-24 bg-[#141211] border-y border-[#2A2624] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
               <div className="w-[800px] h-[800px] rounded-full bg-nobel-gold/15 blur-[100px] absolute top-[-400px] right-[-200px]"></div>
            </div>
            <div className="container mx-auto px-6 relative z-10">
               <div className="inline-block mx-auto mb-3 text-xs font-bold tracking-widest text-[#D4C8C3] uppercase w-full text-center">System Overview</div>
               <h3 className="text-center font-serif text-4xl text-white mb-16">Ecosystem Architecture</h3>
               <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch justify-between gap-8 pb-8">
                   
                   {/* Layer 1 */}
                   <div className="flex flex-col items-center flex-1 group">
                       <span className="text-xs font-bold uppercase tracking-widest text-[#D4C8C3] mb-4 group-hover:text-nobel-gold transition-colors">Layer 1 (Intake)</span>
                       <div className="px-6 py-5 bg-[#1C1A19] border border-[#2D2825] text-white shadow-xl rounded-xl text-center w-full h-full flex flex-col justify-center group-hover:border-nobel-gold/50 transition-all">
                           <span className="font-serif text-xl block mb-2 font-medium">Document Triager</span>
                           <span className="text-xs text-[#D4C8C3]/80">Reads and structures incoming documents for the specialized agents.</span>
                       </div>
                   </div>
                   
                   <div className="flex items-center justify-center text-nobel-gold/60 flex-shrink-0 self-center">
                     <ArrowRight className="hidden lg:block rotate-0" size={24} />
                     <ArrowDown className="lg:hidden rotate-0" size={24} />
                   </div>
                   
                   {/* Layer 2 */}
                   <div className="flex flex-col items-center flex-1 group">
                       <span className="text-xs font-bold uppercase tracking-widest text-[#D4C8C3] mb-4">Layer 2 (Discovery Analysts)</span>
                       <div className="flex flex-col gap-3 w-full h-full justify-center">
                           <div className="px-6 py-4 bg-[#FAF9F6] border border-[#E7E0DC] shadow-lg rounded-xl text-center text-stone-900 hover:scale-[1.02] transition-transform">
                             <span className="text-[15px] font-semibold tracking-wide block">Financial Forensic</span>
                             <span className="text-[11px] text-stone-500">Formulates ratios & preliminary valuations.</span>
                           </div>
                           <div className="px-6 py-4 bg-[#FAF9F6] border border-[#E7E0DC] shadow-lg rounded-xl text-center text-stone-900 hover:scale-[1.02] transition-transform">
                             <span className="text-[15px] font-semibold tracking-wide block">Legal Compliance</span>
                             <span className="text-[11px] text-stone-500">Uncovers contract landmines and USD exposures.</span>
                           </div>
                       </div>
                   </div>
                   
                   <div className="flex items-center justify-center text-nobel-gold/60 flex-shrink-0 self-center">
                     <ArrowRight className="hidden lg:block rotate-0" size={24} />
                     <ArrowDown className="lg:hidden rotate-0" size={24} />
                   </div>

                   {/* Layer 3 */}
                   <div className="flex flex-col items-center flex-1 group">
                       <span className="text-xs font-bold uppercase tracking-widest text-[#D4C8C3] mb-4">Layer 3 (Decision / Arbitrage)</span>
                       <div className="flex flex-col gap-3 w-full h-full justify-center">
                           <div className="px-6 py-3 bg-[#1C1A19] border border-[#2D2825] text-white shadow-xl rounded-xl text-center hover:border-nobel-gold/50 transition-colors">
                               <span className="font-serif text-[15px] block font-medium">Valuation Adjustment</span>
                               <span className="text-[11px] text-[#D4C8C3]/75">Calculates ultimate EV haircuts.</span>
                           </div>
                           <div className="px-6 py-3 bg-[#1C1A19] border border-[#2D2825] text-white shadow-xl rounded-xl text-center hover:border-nobel-gold/50 transition-colors">
                               <span className="font-serif text-[15px] block font-medium">Risk Synthesis</span>
                               <span className="text-[11px] text-[#D4C8C3]/75">Compiles compound risk ratios.</span>
                           </div>
                           <div className="px-6 py-3 bg-nobel-gold border border-[#DEB86F] text-white shadow-xl rounded-xl text-center hover:bg-[#DEB86F] transition-colors relative overflow-hidden group">
                               <span className="font-serif text-[15px] block font-medium relative z-10">Executive Arbitrator</span>
                               <span className="text-[11px] text-white/90 relative z-10 block font-light">Definitive Go/No-Go final judgment.</span>
                           </div>
                       </div>
                   </div>
               </div>
            </div>
        </section>

        {/* Introduction */}
        <section id="introduction" className="py-28 bg-[#FAF9F6]">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold tracking-widest uppercase rounded-full">The Challenge</div>
              <h2 className="font-serif text-5xl mb-6 leading-[1.1] text-stone-900">Breaking Down Silos</h2>
              <div className="w-16 h-1.5 bg-nobel-gold mb-6 rounded-full"></div>
            </div>
            <div className="md:col-span-8 text-xl text-stone-600 leading-relaxed space-y-6">
              <p className="font-light">
                <span className="text-6xl float-left mr-4 mt-[-12px] font-serif justify-center items-center text-nobel-gold leading-none">I</span>n the real world, M&A due diligence fails when teams work in silos. Financial auditors miss context from legal contracts, while operations experts overlook commercial churn dynamics. 
              </p>
              <p className="font-normal text-stone-800">
                <strong>Valence</strong> solves this by deploying a structured, hierarchical ecosystem of 6 highly specialized AI agents. Divided into three distinct functional layers—Ingestion, Discovery, and Decision—they autonomously parse documents, flag cross-disciplinary compound risks, and translate findings into definitive valuation adjustments and negotiation tactics.
              </p>
            </div>
          </div>
        </section>

        {/* Layer 1 */}
        <section id="layer-1" className="py-28 bg-[#141211] border-t border-[#2A2624] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(197,160,89,0.05)_0%,transparent_50%)] pointer-events-none"></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-14">
                    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-[#1C1A19] border border-[#2D2825] text-nobel-gold text-[10px] font-bold tracking-widest uppercase rounded-full">Phase 1</div>
                    <h2 className="font-serif text-5xl leading-tight text-white drop-shadow-sm">Ingestion & Data Management</h2>
                    <p className="text-xl text-[#D4C8C3] mt-5 max-w-2xl font-light">The gateway of the ecosystem. Organizing chaos into structured data streams.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AgentCard 
                        title="Document Triager"
                        role="Agent 1 • Intake Coordinator"
                        mandate="Ingest raw data, structure it, and ensure data integrity to route appropriately."
                        responsibilities={[
                            "Runs OCR and vectorization on thousands of unstructured virtual data room files.",
                            "Automatically categorizes documents into structured folders (Corporate, Financial, Legal, Contracts).",
                            "Generates the Missing Information Log to guide supplementary requests."
                        ]}
                        outputs="Organized data streams routed to specific execution agents; dynamic missing-document checklists."
                        icon={FileText}
                        delay="0s"
                        isDark={false}
                    />
                </div>
            </div>
        </section>

        {/* Layer 2 */}
        <section id="layer-2" className="py-28 bg-[#FAF9F6] border-t border-stone-200 relative">
             <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
                <div className="w-[600px] h-[600px] rounded-full bg-nobel-gold blur-[150px] absolute top-[-300px] right-[-200px]"></div>
             </div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-14">
                     <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white border border-stone-200 text-stone-600 shadow-sm text-[10px] font-bold tracking-widest uppercase rounded-full">Phase 2</div>
                     <h2 className="font-serif text-5xl leading-tight text-stone-900">Discovery & Specialized Analysis</h2>
                     <p className="text-xl text-stone-600 mt-5 max-w-2xl font-light">The specialized workstreams. Investigating the absolute mathematical and contractual realities.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AgentCard 
                        title="Financial Forensic Agent"
                        role="Agent 2 • Forensic Analyst"
                        mandate="Verify historical financial truth and spot calculation anomalies."
                        responsibilities={[
                            "Calculates key financial ratios and benchmarks findings against custom industry standard baselines.",
                            "Identifies windows of ledger or EBITDA anomalies; validates normalized parameters against active receipts.",
                            "Produces an explicit preliminary valuation range formulated using revenue and EBITDA multiples."
                        ]}
                        outputs="Key Financial Ratios list, preliminary valuation multipliers matrix, flagged ledger/add-back anomalies."
                        icon={Calculator}
                        delay="0s"
                        isDark={true}
                    />
                    <AgentCard 
                        title="Legal Compliance Analyst"
                        role="Agent 3 • Compliance Attorney"
                        mandate="Uncover contract landmines and quantify cash liability exposures."
                        responsibilities={[
                            "Combs through agreements looking for uncapped liabilities, IP ambiguity, or GDPR deficiencies.",
                            "Identifies unfavorable renewal clauses, assigning customized severity ratings to findings.",
                            "Quantifies the complete financial exposure in dollars (USD) for every contract risk detected."
                        ]}
                        outputs="Contract Vulnerability Log, regulatory exposures, dollared-risk profile matrix consumed by Agent 4."
                        icon={ShieldAlert}
                        delay="0.1s"
                        isDark={true}
                    />
                </div>
            </div>
        </section>

        {/* Layer 3 */}
        <section id="layer-3" className="py-28 bg-[#141211] border-t border-[#2A2624] text-stone-100 relative overflow-hidden flex-grow">
             <div className="absolute top-0 left-0 w-full h-full opacity-15 pointer-events-none">
                <div className="w-[700px] h-[700px] rounded-full bg-nobel-gold blur-[180px] absolute top-[-300px] left-[-200px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-14">
                     <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-[#1C1A19] border border-nobel-gold text-nobel-gold shadow-[0_0_15px_rgba(197,160,89,0.3)] text-[10px] font-bold tracking-widest uppercase rounded-full">Phase 3</div>
                     <h2 className="font-serif text-5xl leading-tight text-white drop-shadow-md">Strategic Pricing & Synthesis</h2>
                     <p className="text-xl text-[#D4C8C3] mt-5 max-w-2xl font-light">The decision makers. Adjusting valuations, synthesizing weighted risks, and delivering final verdicts.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <AgentCard 
                        title="Valuation Adjustment Agent"
                        role="Agent 4 • PE Pricing Architect"
                        mandate="Dynamically translate discovered liabilities into cold, hard pricing haircuts."
                        responsibilities={[
                            "Receives Agent 2's preliminary valuation ranges and Agent 3's quantified legal exposures.",
                            "Mathematically recalculates Enterprise Value (EV) applying exact risk adjustments and discounts.",
                            "Models worst-case, base-case, and best-case financial outcome valuations."
                        ]}
                        outputs="Live Adjusted Enterprise Value Ledger, discount multipliers sheet, recommended earn-outs."
                        icon={CircleDollarSign}
                        delay="0s"
                        isDark={false}
                    />
                    <AgentCard 
                        title="Risk Synthesis Agent"
                        role="Agent 5 • Due Diligence Director"
                        mandate="Connect the dots across workstreams to form a weighted unified risk profile."
                        responsibilities={[
                            "Correlates prior agent findings, compiling them into a single-pane risk matrix.",
                            "Applies fixed, mathematically weighted risk scoring: Financial (35%), Legal (40%), Valuation (25%).",
                            "Establishes a composite risk score (0-100) and ranks top 3 critical issues requiring pre-sign resolution."
                        ]}
                        outputs="Unified Weighted Risk Score (0-100), top 3 priorities list, synthesis matrix."
                        icon={GitMerge}
                        delay="0.1s"
                        isDark={false}
                    />
                    <AgentCard 
                        title="Executive Arbitrator"
                        role="Agent 6 • Deal Arbitrator"
                        mandate="Act as quality-control chair, drafting plain language brief & definitive recommendation."
                        responsibilities={[
                            "Receives Agent 5's risk matrix and synthesizes findings into a CEO-facing 3-sentence brief.",
                            "Issues a clear, final GO, CONDITIONAL GO, or NO-GO recommendation with no technical jargon.",
                            "Includes automatic security escalation logic requiring Legal/CFO sign-off if composite risk score exceeds 70."
                        ]}
                        outputs="Final 3-Sentence C-Suite Brief, definitive deal verdict, administrative escalation logs."
                        icon={Gavel}
                        delay="0.2s"
                        isDark={false}
                    />
                </div>
            </div>
        </section>

      </main>

      <footer className="bg-black border-t border-stone-900 text-[#D4C8C3] py-16 relative">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div className="text-center md:text-left">
                <div className="text-white font-serif font-bold text-2xl mb-2 justify-center md:justify-start">
                    Valence
                </div>
                <p className="text-sm text-[#D4C8C3]/85">M&A Due Diligence War Room Architecture</p>
            </div>
            
            <div className="flex gap-4">
               <Link to="/workspace/ingestion" className="px-6 py-2 border border-[#D4C8C3]/30 rounded-lg hover:bg-[#D4C8C3]/10 transition-colors text-sm font-medium">Launch Platform</Link>
            </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-stone-900 text-xs text-[#D4C8C3]/60 relative z-10">
            Powered by an orchestration of 6 specialized AI agents. <br className="md:hidden" /><span className="hidden md:inline"> • </span> SOC2 Type II & ISO 27001 Compliant.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
