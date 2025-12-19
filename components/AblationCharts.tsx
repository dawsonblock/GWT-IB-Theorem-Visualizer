import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ShieldAlert, Cpu, Lock } from 'lucide-react';

const ABLATION_DATA = [
  { name: 'Full Model', reward: 95, stability: 98, robustness: 92 },
  { name: 'No Gate', reward: 60, stability: 85, robustness: 30 },
  { name: 'No IB', reward: 88, stability: 90, robustness: 45 },
  { name: 'Fixed Curr.', reward: 75, stability: 60, robustness: 70 },
];

export const AblationCharts: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center mb-8">
         <h2 className="text-2xl font-bold text-white">Projected Ablation Results</h2>
         <p className="text-muted mt-2 max-w-2xl mx-auto">
           Comparative analysis showing the necessity of each component (IB Regularization, Causal Gate, Adaptive Curriculum) for optimal performance.
         </p>
      </div>

      <div className="bg-surface p-6 rounded-lg border border-white/10 h-80">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics by Configuration</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={ABLATION_DATA}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              cursor={{fill: '#334155', opacity: 0.4}}
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="reward" name="Task Reward" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="robustness" name="Robustness Score" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="stability" name="Training Stability" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Ablation Claims & Effects */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">Ablation Details: Claims & Effects</h3>
        
        {/* Ablation 1: No Gate */}
        <div className="bg-surface p-5 rounded-lg border border-white/10 border-l-4 border-l-red-500 hover:bg-white/5 transition">
           <div className="flex items-start gap-4">
             <div className="p-3 bg-red-500/10 rounded-lg text-red-400 shrink-0">
               <ShieldAlert size={24} />
             </div>
             <div>
               <h4 className="text-lg font-bold text-white">Ablation: Remove Causal Gate (g(w) ≡ 1)</h4>
               <p className="text-sm text-slate-300 italic mt-1 mb-3">
                 "Without gating, the agent cannot selectively suppress corrupted workspace content."
               </p>
               <div className="bg-black/20 rounded p-3 border border-white/5">
                 <p className="text-xs font-bold text-muted uppercase mb-2">Predicted Measurable Effects:</p>
                 <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                   <li><strong className="text-red-400">Robustness Collapse:</strong> Lower "attack-phase" reward.</li>
                   <li><strong className="text-red-400">Instability:</strong> Larger KL spikes under curriculum step-ups.</li>
                   <li>Lower correlation between "attack presence" and internal suppression.</li>
                 </ul>
               </div>
             </div>
           </div>
        </div>

        {/* Ablation 2: No IB */}
        <div className="bg-surface p-5 rounded-lg border border-white/10 border-l-4 border-l-primary hover:bg-white/5 transition">
           <div className="flex items-start gap-4">
             <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
               <Cpu size={24} />
             </div>
             <div>
               <h4 className="text-lg font-bold text-white">Ablation: Remove IB (β = 0)</h4>
               <p className="text-sm text-slate-300 italic mt-1 mb-3">
                 "Without IB regularization, the workspace ceases to be minimal; it can encode nuisance/backstage information."
               </p>
               <div className="bg-black/20 rounded p-3 border border-white/5">
                 <p className="text-xs font-bold text-muted uppercase mb-2">Predicted Measurable Effects:</p>
                 <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                   <li><strong className="text-primary">High Rank:</strong> Higher effective rank of workspace W (less compression).</li>
                   <li><strong className="text-primary">Adversarial Brittleness:</strong> Increased sensitivity to perturbations.</li>
                   <li>Lower shuffle/nearest-wrong performance drop during evaluation (paradoxical signal of non-compactness).</li>
                 </ul>
               </div>
             </div>
           </div>
        </div>

        {/* Ablation 3: Fixed Curriculum */}
        <div className="bg-surface p-5 rounded-lg border border-white/10 border-l-4 border-l-secondary hover:bg-white/5 transition">
           <div className="flex items-start gap-4">
             <div className="p-3 bg-secondary/10 rounded-lg text-secondary shrink-0">
               <Lock size={24} />
             </div>
             <div>
               <h4 className="text-lg font-bold text-white">Ablation: Freeze Curriculum</h4>
               <p className="text-sm text-slate-300 italic mt-1 mb-3">
                 "A fixed schedule cannot jointly maintain PPO stability (KL ceiling) and robustness targets."
               </p>
               <div className="bg-black/20 rounded p-3 border border-white/5">
                 <p className="text-xs font-bold text-muted uppercase mb-2">Predicted Measurable Effects:</p>
                 <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                   <li><strong className="text-secondary">Learning Instability:</strong> KL blowups at high corruption levels.</li>
                   <li><strong className="text-secondary">Under-robustness:</strong> Agent fails to adapt to difficulty if set too low.</li>
                   <li>Higher variance across seeds and poorer "regression consistency".</li>
                 </ul>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};