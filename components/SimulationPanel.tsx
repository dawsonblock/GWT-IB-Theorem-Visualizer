import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { CurriculumStep } from '../types';
import { M } from './MathUtils';

// Icons
import { Play, Pause, RefreshCw, Activity, ShieldCheck, Zap, Lock, Scan, Radiation, ArrowDown, Bomb, XCircle, AlertTriangle, Sliders, MousePointerClick, TrendingUp, Target } from 'lucide-react';

const INITIAL_DATA: CurriculumStep[] = Array.from({ length: 20 }, (_, i) => ({
  step: i,
  corruptionProb: 0.1,
  ppoKL: 0.01,
  robustnessDrop: 0.05,
  gateActivation: 0.1,
  ppoRatio: 1.0 + (Math.random() - 0.5) * 0.02
}));

// Particle helper for the visualization
const Particle: React.FC<{ x: number, y: number, delay: number, speed: number, active: boolean }> = ({ x, y, delay, speed, active }) => (
  <div 
    className={`absolute w-1 h-1 rounded-full transition-opacity duration-500 ${active ? 'bg-rose-400 shadow-[0_0_5px_#f43f5e]' : 'bg-primary shadow-[0_0_5px_#6366f1]'}`}
    style={{
      left: `${x}%`,
      top: `${y}%`,
      animation: `particleFlow ${speed}s linear infinite`,
      animationDelay: `${delay}s`,
      opacity: active ? 0.8 : 0.4
    }}
  />
);

export const SimulationPanel: React.FC = () => {
  const [data, setData] = useState<CurriculumStep[]>(INITIAL_DATA);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepCount, setStepCount] = useState(20);
  const timerRef = useRef<number | null>(null);

  // Simulation State
  const [corruptionMode, setCorruptionMode] = useState<'none' | 'shuffle' | 'nearest'>('none');
  
  // Reward Shaping State
  const [shapingMode, setShapingMode] = useState<'sparse' | 'dense' | 'potential'>('sparse');
  const [shapingGain, setShapingGain] = useState(0.5);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const reset = () => {
    setIsPlaying(false);
    setData(INITIAL_DATA);
    setStepCount(20);
    setCorruptionMode('none');
    setShapingMode('sparse');
    setShapingGain(0.5);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setStepCount(prev => prev + 1);
        setData(prevData => {
          const last = prevData[prevData.length - 1];
          const isCorrupted = corruptionMode !== 'none';
          
          let newKL = Math.max(0, last.ppoKL + (Math.random() - 0.5) * 0.01);
          
          // Shaping Impact on KL Stability
          if (shapingMode === 'potential') {
              // Potential-based shaping theoretically reduces variance in advantage estimation
              newKL = Math.max(0.001, newKL - 0.002 * shapingGain); 
          } else if (shapingMode === 'dense' && isCorrupted) {
              // Dense shaping can sometimes lead to local optima or instability under noise
              newKL += 0.002 * shapingGain;
          }

          if (isCorrupted) {
             newKL = Math.min(0.5, newKL + 0.02); 
          }
          
          let newProb = last.corruptionProb;
          if (isCorrupted) {
            newProb = Math.min(1.0, last.corruptionProb + 0.05);
          } else {
             if (newKL > 0.1) {
                newProb = Math.max(0, last.corruptionProb - 0.05); 
             } else if (last.robustnessDrop < 0.2) {
                newProb = Math.min(1.0, last.corruptionProb + 0.02); 
             }
          }

          const trainingEffect = 0.01 * (newProb > 0.3 ? 1.5 : 0.5); 
          
          // Shaping Impact on Learning Speed (Robustness)
          let shapingBonus = 0;
          if (shapingMode === 'dense') shapingBonus = 0.008 * shapingGain; // Faster learning
          if (shapingMode === 'potential') shapingBonus = 0.004 * shapingGain; // Moderate learning
          
          const noise = (Math.random() - 0.5) * 0.02;
          let newDrop = last.robustnessDrop;
          
          if (isCorrupted) {
              newDrop = Math.min(0.6, last.robustnessDrop + 0.03); 
          } else {
              // Apply shaping bonus to accelerate robustness improvement
              newDrop = Math.max(0.05, last.robustnessDrop - (trainingEffect + shapingBonus) + noise + (newProb - last.corruptionProb)*0.5);
          }

          const baseActivation = isCorrupted ? 0.95 : newDrop * 2;
          const newGate = Math.min(1, Math.max(0, baseActivation + noise));

          const ratioNoise = (Math.random() - 0.5) * 0.05;
          const newRatio = 1.0 + ratioNoise + (newKL * 0.2); 

          const newStep: CurriculumStep = {
            step: last.step + 1,
            corruptionProb: newProb,
            ppoKL: newKL,
            robustnessDrop: newDrop,
            gateActivation: newGate,
            ppoRatio: newRatio
          };

          const newData = [...prevData, newStep];
          if (newData.length > 50) newData.shift(); 
          return newData;
        });
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, corruptionMode, shapingMode, shapingGain]);

  const interpolateColor = (val: number) => {
    const start = val < 0.5 ? [16, 185, 129] : [245, 158, 11];
    const end = val < 0.5 ? [245, 158, 11] : [225, 29, 72];
    const t = val < 0.5 ? val * 2 : (val - 0.5) * 2;
    
    const r = Math.round(start[0] + (end[0] - start[0]) * t);
    const g = Math.round(start[1] + (end[1] - start[1]) * t);
    const b = Math.round(start[2] + (end[2] - start[2]) * t);
    return [r, g, b];
  };

  const renderGateVisual = () => {
    const lastStep = data[data.length - 1];
    const isCorrupted = corruptionMode !== 'none';
    const rawValue = isPlaying ? lastStep.gateActivation : (isCorrupted ? 0.88 : 0.12);
    
    const percentage = `${(rawValue * 100).toFixed(0)}%`;
    const baseColor = interpolateColor(rawValue);
    const colorString = `rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`;
    const glowString = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.8)`;
    
    let statusText = "Idle";
    let statusColorClass = "text-muted";
    
    if (rawValue < 0.3) {
      statusText = "Pass-Through";
      statusColorClass = "text-emerald-400";
    } else if (rawValue < 0.7) {
      statusText = "Filtering";
      statusColorClass = "text-amber-400";
    } else {
      statusText = "Suppression Active";
      statusColorClass = "text-rose-500";
    }

    const isHighIntensity = rawValue > 0.6;
    const pulseSpeed = `${Math.max(0.4, 1.8 - rawValue * 1.6)}s`;
    const flowSpeed = `${Math.max(0.15, 1.1 - rawValue)}s`;

    return (
      <div className={`bg-surface p-6 rounded-lg border h-full flex flex-col items-center justify-center space-y-6 relative overflow-hidden transition-all duration-700 ${isCorrupted ? 'border-rose-500/30 shadow-[inset_0_0_30px_rgba(244,63,94,0.05)]' : 'border-white/10'}`}>
        <style>
            {`
            @keyframes flowUp {
                0% { background-position: 0 0; }
                100% { background-position: 0 -40px; }
            }
            .gate-flow {
                animation: flowUp ${flowSpeed} linear infinite;
            }
            @keyframes spin-slow {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .spin-ring {
                animation: spin-slow 10s linear infinite;
            }
            @keyframes heartbeat {
                0% { transform: scale(1); filter: brightness(1); }
                15% { transform: scale(1.1); filter: brightness(1.5); }
                30% { transform: scale(1); filter: brightness(1); }
            }
            .pulse-intense {
                animation: heartbeat ${pulseSpeed} ease-in-out infinite;
            }
            @keyframes aura-expansion {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
                100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
            }
            .aura-ring {
                animation: aura-expansion ${pulseSpeed} ease-out infinite;
            }
            @keyframes noise-jitter {
              0% { transform: translate(0,0); }
              25% { transform: translate(-1px, 1.5px); }
              50% { transform: translate(1.5px, -1px); }
              75% { transform: translate(-1.5px, -1.5px); }
              100% { transform: translate(1px, 1px); }
            }
            .jitter {
              animation: noise-jitter 0.08s linear infinite;
            }
            @keyframes particleFlow {
              0% { transform: translateY(0) scale(1); opacity: 0; }
              10% { opacity: 1; }
              ${(1 - rawValue) * 100}% { transform: translateY(-100px) scale(1); opacity: 1; }
              ${((1 - rawValue) * 100) + 10}% { transform: translateY(-110px) scale(0.5); opacity: 0; }
              100% { transform: translateY(-110px); opacity: 0; }
            }
            @keyframes static-grain {
              0%, 100% { transform: translate(0,0); }
              10% { transform: translate(-1%, -1%); }
              20% { transform: translate(1%, 1%); }
              30% { transform: translate(-2%, 0); }
              40% { transform: translate(2%, -1%); }
              50% { transform: translate(-1%, 2%); }
              60% { transform: translate(1%, -2%); }
              70% { transform: translate(-2%, 2%); }
              80% { transform: translate(2%, 1%); }
              90% { transform: translate(-1%, -2%); }
            }
            .static-overlay {
              background-image: url("https://www.transparenttextures.com/patterns/p6.png");
              animation: static-grain 0.2s steps(10) infinite;
            }
            `}
        </style>
        
        {/* Suppression Aura Background */}
        <div 
            className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
            style={{
                background: `radial-gradient(circle at center, rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${0.1 + rawValue * 0.45}) 0%, transparent 75%)`
            }}
        />

        {/* Global Noise Overlay */}
        {isCorrupted && (
          <div className="absolute inset-0 opacity-10 pointer-events-none z-50 static-overlay overflow-hidden"></div>
        )}

        <div className="z-10 flex flex-col items-center">
             <div className="relative mb-4">
                 {/* Reactive Aura Rings */}
                 <div 
                    className="absolute top-1/2 left-1/2 rounded-full border border-current aura-ring pointer-events-none"
                    style={{ color: colorString, width: '100px', height: '100px', borderWidth: `${1 + rawValue * 5}px` }}
                 />
                 
                 <div 
                    className={`p-6 rounded-full border-2 transition-all duration-300 bg-surface/80 backdrop-blur-sm z-10 relative ${isHighIntensity ? "pulse-intense shadow-[0_0_80px_rgba("+baseColor.join(",")+",0.5)]" : ""}`}
                    style={{ borderColor: colorString }}
                 >
                    <ShieldCheck size={40} style={{ color: colorString }} />
                 </div>
                 
                 {/* Decorative Spin Ring */}
                 <svg className={`absolute top-1/2 left-1/2 w-40 h-40 pointer-events-none opacity-40 spin-ring transition-all duration-500 ${isHighIntensity ? "scale-125 opacity-70" : "scale-100"}`} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="none" stroke={colorString} strokeWidth={isHighIntensity ? "3" : "1.5"} strokeDasharray="12 10" />
                 </svg>
             </div>
             
             <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                Causal Suppression Gate
                {isCorrupted && <Radiation size={18} className="text-rose-400 animate-spin" />}
             </h3>
        </div>
        
        <div className="w-full space-y-4 z-10">
          <div className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-500 overflow-hidden relative ${isCorrupted ? "bg-rose-500/10 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)]" : "bg-black/40 border-white/5"}`}>
            
            <div className="flex justify-between items-center z-20">
              <span className={isCorrupted ? "text-white font-black uppercase text-xs tracking-widest" : "text-muted font-medium"}>Backstage State X</span>
              
              <div className="text-[10px] font-mono text-muted uppercase">Latency: {isCorrupted ? '8.4ms' : '2.1ms'}</div>
            </div>

            <div className={`flex justify-between items-center transition-all ${isCorrupted ? 'jitter opacity-100' : 'opacity-80'}`}>
                <span className={`font-mono font-bold flex items-center gap-2 px-3 py-1 rounded-full text-xs ${isCorrupted ? "bg-rose-500 text-white shadow-[0_0_10px_#f43f5e]" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"}`}>
                {isCorrupted && <Zap size={12} className="animate-bounce" />}
                {isCorrupted ? "ADVERSARIAL" : "NOMINAL"}
                </span>
                
                <div className="flex items-center gap-2">
                   {isCorrupted && <AlertTriangle size={14} className="text-rose-400 animate-pulse" />}
                   <span className="text-[10px] text-muted font-mono">{isCorrupted ? "JITTER DETECTED" : "SIGNAL CLEAN"}</span>
                </div>
            </div>

            {/* Background Data Flow visualization */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
               {[...Array(8)].map((_, i) => (
                  <Particle 
                    key={i} 
                    x={10 + i * 12} 
                    y={100} 
                    delay={i * 0.4} 
                    speed={1 + Math.random()} 
                    active={isCorrupted} 
                  />
               ))}
            </div>
          </div>
          
          <div className="relative h-64 w-full bg-black/60 rounded-2xl flex items-center justify-center border border-white/10 p-6 overflow-hidden shadow-inner">
             {/* Dynamic Scan Line */}
             <div className="absolute left-0 w-full h-[3px] bg-primary/40 opacity-40 scan-line pointer-events-none shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ animationDuration: '2s' }}></div>

             {/* Interference Overlay */}
             {isCorrupted && (
                <div className="absolute inset-0 bg-rose-900/10 z-0 static-overlay opacity-30"></div>
             )}

             <div className="flex items-end gap-10 w-full h-full z-10">
                {/* Suppression Plasma Bar - The "Heat Map" of action */}
                <div className="w-24 h-full bg-black/80 rounded-2xl relative border border-white/20 overflow-hidden shadow-[inset_0_0_15px_black] flex flex-col justify-end">
                    {/* Layered Plasma Effect */}
                    <div 
                      className="w-full transition-all duration-300 ease-out relative"
                      style={{ 
                          height: percentage,
                          background: `linear-gradient(to top, rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]}, 0.5), ${colorString}, rgba(255,255,255,0.9))`,
                          boxShadow: `0 0 ${50 * rawValue}px ${glowString}, inset 0 0 20px rgba(255,255,255,0.4)`
                      }}
                    >
                        {/* Internal Heat Core */}
                        <div className="absolute inset-x-2 bottom-0 bg-white/20 blur-xl h-full rounded-full"></div>

                        {/* Plasma Flow Effect */}
                        <div className="absolute inset-0 gate-flow opacity-70"
                             style={{
                                 backgroundImage: `linear-gradient(0deg, transparent 0%, rgba(255,255,255,${0.3 + rawValue * 0.5}) 50%, transparent 100%)`,
                                 backgroundSize: '100% 30px',
                             }}
                        ></div>
                        
                        {/* High Intensity Noise/Distortion */}
                        {isHighIntensity && (
                           <div className="absolute inset-0 mix-blend-overlay opacity-50 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] animate-pulse"></div>
                        )}
                        
                        {/* Energy Cap */}
                        <div className="absolute top-0 w-full h-1.5 bg-white shadow-[0_0_20px_white] z-20"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/40 blur-md rounded-full -translate-y-1/2"></div>
                    </div>

                    {/* Scale Indicators */}
                    <div className="absolute inset-0 flex flex-col justify-between py-4 px-2 text-[10px] font-mono text-white/30 pointer-events-none select-none">
                         <span>1.0</span><span>0.8</span><span>0.6</span><span>0.4</span><span>0.2</span><span>0.0</span>
                    </div>
                </div>

                <div className="flex flex-col justify-end h-full py-2 space-y-4 flex-1">
                    <div className="bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-xl shadow-lg">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-1 font-black flex items-center justify-between">
                             Bottleneck β
                             {isHighIntensity && <Activity size={14} className="text-rose-500 animate-pulse" />}
                        </div>
                        <div className="text-4xl font-mono font-black tracking-tighter transition-colors duration-300" style={{ color: colorString }}>
                            {(rawValue * 100).toFixed(1)}%
                        </div>
                        <div className="mt-1 h-1 w-full bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-current transition-all duration-300" style={{ width: percentage, color: colorString }}></div>
                        </div>
                    </div>
                    
                    <div className="bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden group">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-1 font-black">Control Mode</div>
                        <div className={`text-base font-black transition-colors duration-300 flex items-center gap-3 ${statusColorClass}`}>
                            {statusText}
                            {rawValue > 0.7 && <Lock size={18} className="fill-current animate-bounce" />}
                            {rawValue < 0.3 && <Scan size={18} className="animate-pulse" />}
                        </div>
                        {/* Subtle background icon */}
                        <ShieldCheck className="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12 group-hover:opacity-10 transition-opacity" size={60} />
                    </div>
                </div>
             </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <button 
              onClick={() => setCorruptionMode(prev => prev === 'shuffle' ? 'none' : 'shuffle')}
              className={`w-full py-3 rounded-xl font-black text-xs tracking-widest transition-all border flex items-center justify-center gap-3 relative overflow-hidden ${
                isCorrupted 
                  ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-95' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-white active:scale-95'
              }`}
            >
              {isCorrupted && <div className="absolute inset-0 static-overlay opacity-20 pointer-events-none"></div>}
              <Radiation size={16} className={isCorrupted ? 'animate-spin' : ''} />
              {isCorrupted ? 'DISCONNECT NOISE' : 'MANUAL NOISE INJECTION'}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-muted font-mono bg-black/20 py-2 w-full rounded-lg border border-white/5 uppercase tracking-widest">
              <ArrowDown size={10} /> Output Workspace W_eff <ArrowDown size={10} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        
        <div className="bg-surface p-6 rounded-xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <RefreshCw size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Adaptive Curriculum Loop</h3>
                <p className="text-xs text-muted">Joint optimization of PPO KL and Robustness</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCorruptionMode(prev => prev === 'shuffle' ? 'none' : 'shuffle')}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all border shadow-lg ${
                  corruptionMode === 'shuffle' 
                    ? 'bg-rose-600 border-rose-400 text-white shadow-rose-500/20 scale-105 active:scale-95' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-rose-500/50 hover:bg-rose-500/10 active:scale-95'
                }`}
              >
                <Zap size={16} className={corruptionMode === 'shuffle' ? "fill-white animate-pulse" : ""} />
                {corruptionMode === 'shuffle' ? "INJECTION ACTIVE" : "INJECT NOISE"}
              </button>
              
              <div className="w-px h-8 bg-white/10"></div>

              <div className="flex items-center gap-2">
                <button onClick={togglePlay} className="p-3 bg-primary hover:bg-primary-600 rounded-xl text-white transition shadow-lg shadow-primary/20 active:scale-90">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={reset} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition active:scale-90">
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="step" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" domain={[0, 1]} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="corruptionProb" stroke="#6366f1" strokeWidth={4} dot={false} name="Corrupt Prob" />
                <Line type="monotone" dataKey="robustnessDrop" stroke="#f43f5e" strokeWidth={4} dot={false} name="Robustness Drop" />
                <Line type="monotone" dataKey="ppoKL" stroke="#10b981" strokeWidth={2} dot={false} name="PPO KL" />
                <ReferenceLine y={0.3} stroke="#94a3b8" strokeDasharray="5 5" label={{ value: 'Target 0.3', fill: '#94a3b8', fontSize: 10, position: 'insideRight' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-muted font-mono flex justify-between px-2 uppercase tracking-widest">
             <span className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded">Step: {stepCount}</span>
             <div className="flex gap-6">
                <span className="flex items-center gap-2"><div className="w-3 h-1 rounded-full bg-primary"></div> Difficulty (β)</span>
                <span className="flex items-center gap-2"><div className="w-3 h-1 rounded-full bg-accent"></div> Perf Gap (Δ)</span>
                <span className="flex items-center gap-2"><div className="w-3 h-1 rounded-full bg-secondary"></div> KL Stability</span>
             </div>
          </div>
        </div>

        {/* Reward Shaping Section */}
        <div className="bg-surface p-6 rounded-xl border border-white/10 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
              <div className="p-1.5 bg-accent/10 rounded">
                <Target size={18} className="text-accent" />
              </div>
              Auxiliary Reward Shaping
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted mb-2">
                        <MousePointerClick size={16} /> Select Shaping Strategy:
                    </div>
                    <div className="flex gap-2">
                        {['sparse', 'dense', 'potential'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setShapingMode(mode as any)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                                    shapingMode === mode 
                                    ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' 
                                    : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    
                    <div className="pt-4">
                        <div className="flex justify-between text-xs text-muted mb-2">
                            <span className="flex items-center gap-2"><Sliders size={14} /> Shaping Gain (λ)</span>
                            <span className="font-mono text-white">{shapingGain.toFixed(2)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={shapingGain}
                            onChange={(e) => setShapingGain(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                    </div>
                </div>

                <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col justify-center min-h-[120px]">
                    <div className="text-[10px] text-muted font-mono uppercase tracking-widest mb-2">Effective Reward Function</div>
                    <div className="text-center py-2">
                        {shapingMode === 'sparse' && (
                             <M block>{"R_t = R_{env} + 0"}</M>
                        )}
                        {shapingMode === 'dense' && (
                             <M block>{`R_t = R_{env} - ${shapingGain.toFixed(2)} \\cdot \\| s_{goal} - s_t \\|_2`}</M>
                        )}
                        {shapingMode === 'potential' && (
                             <M block>{`R_t = R_{env} + ${shapingGain.toFixed(2)} \\cdot (\\Phi(s_{t+1}) - \\Phi(s_t))`}</M>
                        )}
                    </div>
                    <div className="flex items-center gap-2 justify-center mt-2 text-[10px]">
                         <TrendingUp size={12} className={shapingMode !== 'sparse' ? "text-green-400" : "text-muted"} />
                         <span className={shapingMode !== 'sparse' ? "text-green-400" : "text-muted"}>
                             {shapingMode === 'sparse' ? "Baseline Convergence" : "Accelerated Learning"}
                         </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-white/10 shadow-lg">
           <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
              <div className="p-1.5 bg-green-400/10 rounded">
                <Activity size={18} className="text-green-400" />
              </div>
              PPO Stability (Importance Sampling Ratio)
            </h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="step" stroke="#94a3b8" tick={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" domain={[0.6, 1.4]} fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value: number) => [value.toFixed(4), "Ratio"]}
                    />
                    <ReferenceArea y1={0.8} y2={1.2} fill="#10b981" fillOpacity={0.03} />
                    <ReferenceLine y={1.0} stroke="#f8fafc" strokeDasharray="3 3" strokeOpacity={0.3} />
                    <ReferenceLine y={1.2} stroke="#f43f5e" strokeDasharray="2 2" strokeOpacity={0.5} label={{ value: 'Upper Clip', fill: '#f43f5e', fontSize: 8, position: 'top' }} />
                    <Line type="monotone" dataKey="ppoRatio" stroke="#4ade80" strokeWidth={3} dot={false} name="r_t(θ)" />
                 </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted font-mono mt-4 uppercase tracking-tighter opacity-60">
               Maintain Trust Region via Constraint: E[r_t(θ)Â_t] ≥ L_clip
            </p>
        </div>

      </div>

      <div className="lg:col-span-1">
        {renderGateVisual()}
      </div>
    </div>
  );
};