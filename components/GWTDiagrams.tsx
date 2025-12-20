import React from 'react';

const Node = ({ x, y, label, sub, color = "stroke-white", fill = "fill-surface" }: { x: number, y: number, label: string, sub?: string, color?: string, fill?: string }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="-60" y="-30" width="120" height="60" rx="8" className={`${color} stroke-2 ${fill}`} />
    <text x="0" y="-5" textAnchor="middle" className="fill-white text-sm font-bold pointer-events-none">{label}</text>
    {sub && <text x="0" y="15" textAnchor="middle" className="fill-muted text-[10px] pointer-events-none">{sub}</text>}
  </g>
);

const Edge = ({ x1, y1, x2, y2, label, dashed = false }: { x1: number, y1: number, x2: number, y2: number, label?: string, dashed?: boolean }) => {
  const adjX2 = x2 - (x2 > x1 ? 60 : -60) * 0.9; 
  const adjX1 = x1 + (x2 > x1 ? 60 : -60) * 0.9;
  
  return (
    <g>
      <line 
        x1={adjX1} y1={y1} x2={adjX2} y2={y2} 
        className="stroke-muted stroke-1" 
        strokeDasharray={dashed ? "5,5" : "none"}
        markerEnd="url(#arrowhead)" 
      />
      {label && (
        <g transform={`translate(${(x1+x2)/2}, ${(y1+y2)/2 - 10})`}>
          <rect x="-30" y="-10" width="60" height="20" className="fill-background" />
          <text textAnchor="middle" dy="4" className="fill-primary text-[10px] font-mono">{label}</text>
        </g>
      )}
    </g>
  );
};

export const Fig1Conceptual: React.FC = () => {
  return (
    <div className="w-full h-64 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
      <svg width="600" height="240" viewBox="0 0 600 240">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-muted" />
          </marker>
        </defs>
        
        <Node x={60} y={120} label="O" sub="Observation" color="stroke-slate-500" />
        <Node x={220} y={120} label="X" sub="Backstage (LSTM)" color="stroke-blue-500" />
        <Node x={380} y={120} label="W" sub="Global Workspace" color="stroke-primary" fill="fill-primary/20" />
        <Node x={530} y={60} label="π / V" sub="Policy & Value" color="stroke-green-500" />
        <Node x={530} y={180} label="Y" sub="Task Relevant" color="stroke-orange-500" />

        <Edge x1={60} y1={120} x2={220} y2={120} label="f_φ" />
        
        <path d="M 190 90 C 160 60, 280 60, 250 90" fill="none" className="stroke-blue-500 stroke-1" markerEnd="url(#arrowhead)" />
        <text x="220" y="55" textAnchor="middle" className="fill-blue-400 text-[10px] font-mono">h_t-1</text>

        <Edge x1={220} y1={120} x2={380} y2={120} label="q(w|x)" />
        <Edge x1={380} y1={120} x2={530} y2={60} />
        <Edge x1={220} y1={120} x2={530} y2={180} dashed label="Implicit" />
        
        <path d="M 380 160 Q 380 220 500 220" fill="none" className="stroke-accent stroke-1" strokeDasharray="4,4" />
        <text x="440" y="210" className="fill-accent text-xs font-mono">IB: min I(W;X)</text>
      </svg>
    </div>
  );
};

export const Fig2Variational: React.FC = () => {
  return (
    <div className="w-full h-80 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
      <svg width="600" height="320" viewBox="0 0 600 320">
         <defs>
          <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-muted" />
          </marker>
        </defs>

        <Node x={80} y={160} label="X" sub="Input" color="stroke-blue-500" />
        
        <g transform="translate(200, 160)">
             <rect x="-40" y="-80" width="80" height="160" className="stroke-muted fill-surface stroke-1 dashed" strokeDasharray="4,4" />
             <text x="0" y="-90" textAnchor="middle" className="fill-muted text-xs">Encoder</text>
        </g>

        <Node x={200} y={120} label="μ(x)" color="stroke-primary" />
        <Node x={200} y={200} label="log σ²(x)" color="stroke-primary" />
        
        <Edge x1={80} y1={160} x2={200} y2={120} />
        <Edge x1={80} y1={160} x2={200} y2={200} />

        <Node x={400} y={80} label="W = μ(x)" sub="Deterministic (PPO)" color="stroke-green-500" />
        <Node x={400} y={240} label="KL(q||p)" sub="Regularizer" color="stroke-accent" />

        <Edge x1={260} y1={120} x2={400} y2={80} label="PPO Path" />
        <path d="M 260 120 C 300 120, 300 240, 340 240" fill="none" className="stroke-muted stroke-1" markerEnd="url(#arrowhead2)" />
        <path d="M 260 200 C 300 200, 300 240, 340 240" fill="none" className="stroke-muted stroke-1" markerEnd="url(#arrowhead2)" />

        <Node x={540} y={80} label="Action" sub="Logits" color="stroke-white" />
        <Edge x1={460} y1={80} x2={540} y2={80} />
      </svg>
    </div>
  );
};

export const Fig3Gate: React.FC = () => {
  return (
    <div className="w-full h-72 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
      <svg width="600" height="280" viewBox="0 0 600 280">
        <defs>
          <marker id="arrowhead3" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-muted" />
          </marker>
        </defs>

        <Node x={80} y={100} label="W" sub="Workspace" color="stroke-primary" />
        
        <g transform="translate(200, 200)">
            <rect x="-40" y="-30" width="80" height="60" rx="4" className="stroke-accent fill-surface" />
            <text x="0" y="5" textAnchor="middle" className="fill-accent text-sm font-bold">Corrupt</text>
        </g>
        
        <path d="M 140 100 C 160 100, 160 200, 160 200" fill="none" className="stroke-muted stroke-1" markerEnd="url(#arrowhead3)" />

        <Node x={350} y={200} label="π(W~)" sub="Corrupted Policy" color="stroke-accent" />
        <Node x={350} y={100} label="π(W)" sub="Clean Policy" color="stroke-primary" />
        
        <Edge x1={140} y1={100} x2={290} y2={100} />
        <Edge x1={240} y1={200} x2={290} y2={200} />

        <Node x={500} y={150} label="Δ" sub="Disagreement" color="stroke-orange-500" />
        
        <path d="M 410 100 L 440 150" fill="none" className="stroke-muted stroke-1" />
        <path d="M 410 200 L 440 150" fill="none" className="stroke-muted stroke-1" markerEnd="url(#arrowhead3)" />
        
        <path d="M 500 120 C 500 50, 250 50, 250 80" fill="none" className="stroke-secondary stroke-1 dashed" markerEnd="url(#arrowhead3)" />
        <text x="375" y="40" textAnchor="middle" className="fill-secondary text-xs">Train Gate g(W)</text>
        
        <rect x="230" y="80" width="40" height="40" rx="20" className="fill-secondary/20 stroke-secondary" />
        <text x="250" y="105" textAnchor="middle" className="fill-secondary text-xs font-bold">g</text>

      </svg>
    </div>
  );
};

export const Fig4GateAction: React.FC = () => {
  return (
    <div className="w-full h-72 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
      <svg width="600" height="280" viewBox="0 0 600 280">
        <defs>
          <marker id="arrowhead4" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-muted" />
          </marker>
        </defs>

        <Node x={80} y={140} label="W" sub="Raw Workspace" color="stroke-primary" />

        <path d="M 140 140 C 180 140, 180 60, 220 60" fill="none" className="stroke-muted stroke-1" markerEnd="url(#arrowhead4)" />
        
        <g transform="translate(280, 60)">
             <rect x="-50" y="-25" width="100" height="50" rx="4" className="stroke-secondary fill-surface" />
             <text x="0" y="5" textAnchor="middle" className="fill-secondary text-sm font-bold">Gate g(W)</text>
        </g>

        <path d="M 330 60 C 360 60, 360 110, 360 110" fill="none" className="stroke-secondary stroke-1 dashed" markerEnd="url(#arrowhead4)" />
        <text x="390" y="90" className="fill-secondary text-xs">Suppression</text>
        
        <Edge x1={140} y1={140} x2={340} y2={140} />
        
        <circle cx={360} cy={140} r={16} className="fill-surface stroke-white stroke-2" />
        <text x={360} y={145} textAnchor="middle" className="fill-white font-bold text-lg pointer-events-none">×</text>
        <text x={360} y={175} textAnchor="middle" className="fill-muted text-xs">1 - g(w)</text>

        <Edge x1={376} y1={140} x2={460} y2={140} />
        <Node x={520} y={140} label="W_eff" sub="Filtered State" color="stroke-green-400" />
        
        <text x={520} y={190} textAnchor="middle" className="fill-slate-400 text-xs font-mono">Input to Policy π</text>

      </svg>
    </div>
  );
};

export const Fig5InternalState: React.FC = () => {
  return (
    <div className="w-full h-80 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -20;
            }
          }
          .flow-dashed {
            stroke-dasharray: 5;
            animation: dash 1s linear infinite;
          }
          @keyframes pulse-core {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.05); }
          }
          .core-pulse {
            transform-box: fill-box;
            transform-origin: center;
            animation: pulse-core 2s ease-in-out infinite;
          }
        `}
      </style>
      <svg width="600" height="300" viewBox="0 0 600 300">
        <defs>
          <marker id="arrowhead5" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-muted" />
          </marker>
        </defs>

        {/* Backdrop for Grouping */}
        <rect x="210" y="20" width="180" height="240" rx="16" className="stroke-white/10 fill-white/5 stroke-1 dashed" strokeDasharray="4,4" />
        <text x="300" y="40" textAnchor="middle" className="fill-white/20 text-[10px] font-bold uppercase tracking-widest">Backstage Encoder f_φ</text>

        {/* Nodes */}
        <Node x={100} y={150} label="h_t-1" sub="Context history" color="stroke-blue-500" />
        <Node x={300} y={230} label="O_t" sub="Observation" color="stroke-slate-500" />
        
        {/* LSTM Block with more visual detail */}
        <g transform="translate(300, 150)">
          <rect x="-60" y="-30" width="120" height="60" rx="8" className="stroke-primary stroke-2 fill-primary/20 shadow-lg" />
          <text x="0" y="-5" textAnchor="middle" className="fill-white text-sm font-bold">LSTM Core</text>
           {/* Visual Pulse */}
           <rect x="-60" y="-30" width="120" height="60" rx="8" className="fill-primary core-pulse pointer-events-none" />
           
          {/* Internal Gates visual hint */}
          <g transform="translate(-40, 10)">
            <circle cx="0" cy="0" r="4" className="fill-blue-400 opacity-80" />
            <circle cx="15" cy="0" r="4" className="fill-green-400 opacity-80" />
            <circle cx="30" cy="0" r="4" className="fill-red-400 opacity-80" />
            <circle cx="80" cy="0" r="4" className="fill-white opacity-80" />
          </g>
        </g>

        <Node x={500} y={150} label="h_t" sub="Updated Context" color="stroke-blue-500" />
        <Node x={300} y={70} label="X_t" sub="Internal State" color="stroke-green-500" />

        {/* Edges with flow animation */}
        {/* h_t-1 -> LSTM */}
        <line x1={160} y1={150} x2={240} y2={150} className="stroke-blue-500/50 stroke-2 flow-dashed" markerEnd="url(#arrowhead5)" />
        
        {/* LSTM -> h_t */}
        <line x1={360} y1={150} x2={440} y2={150} className="stroke-blue-500/50 stroke-2 flow-dashed" markerEnd="url(#arrowhead5)" />
        
        {/* O_t -> LSTM */}
        <line x1={300} y1={200} x2={300} y2={188} className="stroke-slate-500/50 stroke-2 flow-dashed" markerEnd="url(#arrowhead5)" />
        
        {/* LSTM -> X_t */}
        <line x1={300} y1={120} x2={300} y2={108} className="stroke-green-500/50 stroke-2 flow-dashed" markerEnd="url(#arrowhead5)" />

        {/* Recurrence Loop visualization */}
        <path d="M 500 120 C 500 20, 100 20, 100 120" fill="none" className="stroke-blue-500/20 stroke-1 dashed" markerEnd="url(#arrowhead5)" />
        <text x="300" y="15" textAnchor="middle" className="fill-blue-400/40 text-[9px] uppercase tracking-tighter">Recurrent Loop</text>

        <text x="300" y="285" textAnchor="middle" className="fill-muted text-xs font-mono opacity-50">State Evolution: X_t, h_t = LSTM(O_t, h_t-1)</text>

      </svg>
    </div>
  );
};

export const Fig6FilteredOutput: React.FC = () => {
  return (
    <div className="w-full h-80 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
      <svg width="600" height="300" viewBox="0 0 600 300">
        <defs>
          <marker id="arrowhead6" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-muted" />
          </marker>
        </defs>

        {/* Input W */}
        <Node x={80} y={150} label="W" sub="Workspace" color="stroke-primary" />

        {/* Split paths - Bifurcation */}
        <path d="M 140 150 L 180 150" fill="none" className="stroke-muted stroke-1" />
        <path d="M 160 150 L 160 80 L 220 80" fill="none" className="stroke-muted stroke-1 dashed" markerEnd="url(#arrowhead6)" />

        {/* Gate Block - The Learned Filter Controller */}
        <g transform="translate(260, 80)">
             <rect x="-40" y="-30" width="80" height="60" rx="6" className="stroke-accent fill-surface shadow-lg" />
             <text x="0" y="-5" textAnchor="middle" className="fill-accent text-sm font-bold">Gate g(w)</text>
             <text x="0" y="15" textAnchor="middle" className="fill-muted text-[10px] font-mono">σ(Linear(W))</text>
        </g>

        {/* Inversion/Suppression Logic */}
        <path d="M 300 80 L 350 80 L 350 110" fill="none" className="stroke-accent stroke-1 dashed" markerEnd="url(#arrowhead6)" />
        <rect x="330" y="110" width="40" height="20" rx="4" className="fill-surface stroke-muted stroke-1" />
        <text x="350" y="123" textAnchor="middle" className="fill-slate-300 text-[10px] font-mono">1 - g</text>
        <line x1="350" y1="130" x2="350" y2="138" className="stroke-muted stroke-1" markerEnd="url(#arrowhead6)" />

        
        {/* Main flow to Operation */}
        <line x1={180} y1={150} x2={330} y2={150} className="stroke-muted stroke-1" markerEnd="url(#arrowhead6)" />
        
        {/* Operation Node (Multiplication) */}
        <circle cx={350} cy={150} r={18} className="fill-surface stroke-white stroke-2" />
        <text x={350} y={156} textAnchor="middle" className="fill-white font-bold text-xl pointer-events-none">×</text>

        {/* Output W_eff */}
        <line x1={368} y1={150} x2={430} y2={150} className="stroke-green-400 stroke-1" markerEnd="url(#arrowhead6)" />
        <Node x={460} y={150} label="W_eff" sub="Filtered" color="stroke-green-400" />
        
        {/* Downstream branching to Policy and Value */}
        <path d="M 490 120 C 510 80, 520 80, 540 80" fill="none" className="stroke-muted stroke-1" markerEnd="url(#arrowhead6)" />
        <path d="M 490 180 C 510 220, 520 220, 540 220" fill="none" className="stroke-muted stroke-1" markerEnd="url(#arrowhead6)" />

        <Node x={570} y={80} label="Policy π" sub="π(a | w_eff)" color="stroke-blue-400" />
        <Node x={570} y={220} label="Value V" sub="V(w_eff)" color="stroke-orange-400" />

        {/* Equation Annotation */}
        <g transform="translate(350, 260)">
           <rect x="-100" y="-15" width="200" height="30" rx="15" className="fill-black/40 stroke-white/10" />
           <text x="0" y="5" textAnchor="middle" className="fill-green-400 font-mono text-xs font-bold">W_eff = W ⊙ (1 - g(W))</text>
        </g>

      </svg>
    </div>
  );
};
