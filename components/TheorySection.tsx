import React from 'react';
import { M } from './MathUtils';
import { Clock, Layers, Zap, BrainCircuit, Activity } from 'lucide-react';

export const TheorySection: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in text-slate-300 leading-relaxed">
      
      {/* Introduction */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
          <Layers className="text-primary" size={24} />
          1. Formal GWT ↔ Information Bottleneck
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-surface p-4 rounded border border-white/5 shadow-inner">
            <h3 className="text-primary font-bold mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Definitions
            </h3>
            <ul className="space-y-2 text-sm">
              <li><strong className="text-white font-mono">X</strong>: Backstage State (Latent Representation).</li>
              <li><strong className="text-white font-mono">Y</strong>: Task-relevant target (Policy/Value signal).</li>
              <li><strong className="text-white font-mono">W</strong>: Global Workspace (Compressed Broadcast).</li>
            </ul>
          </div>

          <div className="bg-surface p-4 rounded border border-white/5 shadow-inner">
             <h3 className="text-primary font-bold mb-2 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-primary" />
               Markovian Structure
             </h3>
             <p className="text-sm">Markov Chain: <M>W ← X → Y</M></p>
             <p className="text-xs text-muted mt-2">
               Information in <M>W</M> is a bottlenecked distillation of <M>X</M>. 
               Task relevance <M>Y</M> is conditionally independent of <M>W</M> given <M>X</M>.
             </p>
          </div>
          
          <div className="bg-surface/50 p-6 rounded-xl border border-primary/20 md:col-span-2 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <BrainCircuit size={120} />
             </div>
             
             <h3 className="text-primary font-black mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                <Clock size={14} /> 
                The Backstage Encoder f_φ: Temporal Sufficiency
             </h3>
             
             <p className="text-sm mb-4 leading-relaxed">
               In Partially Observable Markov Decision Processes (POMDPs), raw observations <M>o_t</M> are often non-Markovian. 
               The Global Workspace architecture incorporates a <strong>recurrent LSTM layer</strong> within the Backstage Encoder <M>f_φ</M> to capture long-range temporal dependencies and synthesize a stable, history-aware state <M>X_t</M>.
             </p>
             
             <div className="bg-black/40 p-5 rounded-lg border border-white/10 mb-4 shadow-inner">
                <div className="text-[10px] text-muted mb-2 uppercase tracking-widest font-bold">Temporal Aggregation Logic</div>
                <M block>{"X_t = f_φ(o_t, h_{t-1}) = LSTM(o_t, h_{t-1})"}</M>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] font-mono uppercase tracking-tighter text-muted">
                <div className="bg-black/20 p-2 rounded border border-white/5 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                   <span><span className="text-primary">In:</span> o_t (Obs)</span>
                </div>
                <div className="bg-black/20 p-2 rounded border border-white/5 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   <span><span className="text-primary">Memory:</span> h_t-1</span>
                </div>
                <div className="bg-black/20 p-2 rounded border border-white/5 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                   <span><span className="text-primary">Out:</span> X_t (State)</span>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-surface to-black/40 p-6 rounded-xl border border-primary/30 shadow-2xl relative">
          <div className="absolute -top-3 -right-3">
             <div className="bg-primary p-2 rounded-lg shadow-lg rotate-12">
                <Zap size={16} className="text-white" />
             </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Theorem: Optimal Workspace Compression</h3>
          <p className="mb-4 text-sm">
            The Global Workspace <M>W</M> is the variational solution to the Information Bottleneck, 
            minimizing mutual information with the Backstage while preserving task relevance:
          </p>
          <div className="py-2">
            <M block>{"\\mathcal{L}_{IB} = I(W;X) - β I(W;Y)"}</M>
          </div>
          <p className="mt-4 text-sm border-t border-white/10 pt-4">
            <strong>Equivalence:</strong> The Global Workspace (GWT) is functionally identical to the 
            minimal information-preserving broadcast channel (IB) required for robust agentic behavior.
          </p>
        </div>
      </section>

      {/* Variational IB */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
           <Zap className="text-accent" size={24} />
           2. Implementation Corollary
        </h2>
        <p className="mb-4 text-sm">
          To optimize this via Stochastic Gradient Descent, we assume a Gaussian encoder 
          <M>{"q_θ(w|x) = \\mathcal{N}(μ(x), σ²(x))"}</M> and use the KL divergence as an upper bound on <M>I(W;X)</M>:
        </p>
        <M block>{"\\mathcal{R}_{bottleneck} = \\mathbb{E}_{x \\sim p(x)} [ KL( q_θ(w|x) || p(w) ) ]"}</M>
        <p className="text-xs text-muted italic mt-2">
          This "Bottleneck Pressure" forces the LSTM memory to prune noise before it reaches the Workspace.
        </p>
      </section>

      {/* Required Upgrades Checklist */}
      <section className="bg-black/20 p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          Surgical Upgrade Checklist
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-surface p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
              PPO-IB Decoupling
            </h3>
            <p className="text-xs text-slate-400">
              Sampling noise in <M>W</M> destabilizes Importance Sampling. 
              <strong>Fix:</strong> Use <M>μ(x)</M> for policy path, <M>σ²(x)</M> for KL penalty only.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-white/5 hover:border-secondary/30 transition-colors">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-secondary mr-2" />
              Causal Disagreement Signal
            </h3>
            <p className="text-xs text-slate-400">
              Train <M>g(w)</M> using teacher signal <M>Δ</M> from policy divergence under adversarial noise.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-white/5 hover:border-blue-400/30 transition-colors">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-2" />
              Temporal Recurrence
            </h3>
            <p className="text-xs text-slate-400">
              Integrate <M>{"LSTM(o_t, h_{t-1})"}</M> to capture partial observability and temporal dependencies.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};