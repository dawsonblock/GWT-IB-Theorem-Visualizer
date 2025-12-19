import React, { useState } from 'react';
import { ViewState } from './types';
import { TheorySection } from './components/TheorySection';
import { Fig1Conceptual, Fig2Variational, Fig3Gate, Fig4GateAction, Fig5InternalState, Fig6FilteredOutput } from './components/GWTDiagrams';
import { SimulationPanel } from './components/SimulationPanel';
import { AblationCharts } from './components/AblationCharts';
import { MonitoringPanel } from './components/MonitoringPanel';
import { FeatureStorePanel } from './components/FeatureStorePanel';
import { BookOpen, Activity, GitBranch, BarChart2, Layers, Database, Gauge } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.THEORY);

  const renderContent = () => {
    switch (view) {
      case ViewState.THEORY:
        return <TheorySection />;
      case ViewState.DIAGRAMS:
        return (
          <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 gap-6">
                <div className="bg-surface p-4 rounded border border-white/10">
                   <h3 className="text-white font-semibold mb-4 text-center">Fig 1: GWT-IB Computational Graph</h3>
                   <Fig1Conceptual />
                </div>
                <div className="bg-surface p-4 rounded border border-white/10">
                   <h3 className="text-white font-semibold mb-4 text-center">Fig 2: Variational Implementation (PPO Safe)</h3>
                   <Fig2Variational />
                </div>
                 <div className="bg-surface p-4 rounded border border-white/10">
                   <h3 className="text-white font-semibold mb-4 text-center">Fig 3: Deployable Causal Gate</h3>
                   <Fig3Gate />
                </div>
                <div className="bg-surface p-4 rounded border border-white/10">
                   <h3 className="text-white font-semibold mb-4 text-center">Fig 4: Gate Filtering Mechanism</h3>
                   <Fig4GateAction />
                </div>
                <div className="bg-surface p-4 rounded border border-white/10">
                   <h3 className="text-white font-semibold mb-4 text-center">Fig 5: Backstage LSTM Processing</h3>
                   <Fig5InternalState />
                </div>
                <div className="bg-surface p-4 rounded border border-white/10">
                   <h3 className="text-white font-semibold mb-4 text-center">Fig 6: Downstream Task Heads</h3>
                   <Fig6FilteredOutput />
                </div>
             </div>
          </div>
        );
      case ViewState.SIMULATION:
        return <SimulationPanel />;
      case ViewState.ABLATION:
        return <AblationCharts />;
      case ViewState.MONITORING:
        return <MonitoringPanel />;
      case ViewState.FEATURE_STORE:
        return <FeatureStorePanel />;
      default:
        return <TheorySection />;
    }
  };

  const NavItem = ({ id, label, icon: Icon }: { id: ViewState, label: string, icon: any }) => (
    <button
      onClick={() => setView(id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm md:text-base ${
        view === id 
          ? 'bg-primary text-white shadow-lg shadow-primary/25' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} />
      <span className="hidden md:inline font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-surface/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center">
               <Layers size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-lg md:text-xl tracking-tight hidden sm:block">GWT-IB <span className="text-muted font-normal">Visualizer</span></h1>
          </div>
          
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <NavItem id={ViewState.THEORY} label="Theory" icon={BookOpen} />
            <NavItem id={ViewState.DIAGRAMS} label="Diagrams" icon={GitBranch} />
            <NavItem id={ViewState.SIMULATION} label="Sim" icon={Activity} />
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <NavItem id={ViewState.MONITORING} label="Monitor" icon={Gauge} />
            <NavItem id={ViewState.FEATURE_STORE} label="Store" icon={Database} />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-8 text-center text-slate-500 text-sm">
        <p>Formal GWT-IB Implementation Guide • {new Date().getFullYear()}</p>
        <p className="mt-2 text-xs">Optimized for PPO-based Reinforcement Learning Agents</p>
      </footer>
    </div>
  );
};

export default App;