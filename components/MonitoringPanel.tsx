import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, AlertTriangle, Zap, Bell, Layers } from 'lucide-react';

interface MetricPoint {
  time: string;
  accuracy: number;
  loss: number;
  latency: number;
  driftScore: number;
}

const GENERATE_METRICS = (count: number): MetricPoint[] => {
  return Array.from({ length: count }, (_, i) => ({
    time: `${10 + i}:00`,
    accuracy: 0.85 + Math.random() * 0.1,
    loss: 0.2 + Math.random() * 0.1,
    latency: 15 + Math.random() * 5,
    driftScore: 0.05 + (i > count - 5 ? i * 0.05 : 0) // Simulate drift spike at end
  }));
};

const DISTRIBUTION_DATA = [
  { bin: '-2', ref: 5, curr: 6 },
  { bin: '-1', ref: 20, curr: 18 },
  { bin: '0', ref: 50, curr: 45 },
  { bin: '1', ref: 20, curr: 15 },
  { bin: '2', ref: 5, curr: 16 }, // Shifted distribution
];

export const MonitoringPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricPoint[]>(GENERATE_METRICS(20));
  const [alerts, setAlerts] = useState<string[]>([]);
  
  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const last = prev[prev.length - 1];
        const newPoint = {
          time: last.time, // Simplification for demo
          accuracy: 0.85 + Math.random() * 0.1,
          loss: 0.2 + Math.random() * 0.1,
          latency: 15 + Math.random() * 5,
          driftScore: 0.05 + Math.random() * 0.3 // High volatility
        };
        
        // Alert Logic
        const newAlerts = [];
        if (newPoint.driftScore > 0.2) newAlerts.push(`Drift Detected: KL(P||Q) = ${newPoint.driftScore.toFixed(3)}`);
        if (newPoint.latency > 19) newAlerts.push(`Latency Spike: ${newPoint.latency.toFixed(1)}ms`);
        
        if (newAlerts.length > 0) {
            setAlerts(prevA => [...newAlerts, ...prevA].slice(0, 5));
        }

        return [...prev.slice(1), newPoint];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Left Column: Metrics */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Performance Card */}
        <div className="bg-surface p-4 rounded-lg border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} className="text-secondary" />
            Model Performance
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" tick={false} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={false} name="Reward Mean" />
                <Line type="monotone" dataKey="loss" stroke="#f43f5e" strokeWidth={2} dot={false} name="Value Loss" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Drift Card */}
        <div className="bg-surface p-4 rounded-lg border border-white/10">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-white font-semibold flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              Workspace (W) Drift Analysis
            </h3>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 animate-pulse">
              Significant Shift Detected
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DISTRIBUTION_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="bin" stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                    <Bar dataKey="ref" name="Training Baseline" fill="#6366f1" fillOpacity={0.5} />
                    <Bar dataKey="curr" name="Live Window" fill="#f43f5e" fillOpacity={0.5} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
             <div className="flex flex-col justify-center space-y-4 text-sm">
                <div className="bg-black/20 p-3 rounded border border-white/5">
                   <p className="text-muted">KL Divergence</p>
                   <p className="text-xl font-mono text-accent">0.421</p>
                </div>
                <div className="bg-black/20 p-3 rounded border border-white/5">
                   <p className="text-muted">Feature Importance Shift</p>
                   <p className="text-white">High in dim[4], dim[7]</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Column: System & Alerts */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* System Health */}
        <div className="bg-surface p-4 rounded-lg border border-white/10">
           <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" />
            System Health
          </h3>
          <div className="space-y-4">
             <div>
                <div className="flex justify-between text-sm mb-1">
                   <span className="text-muted">Encoder Latency (P95)</span>
                   <span className="text-white">18.2ms</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                   <div className="bg-green-500 h-full w-[60%]"></div>
                </div>
             </div>
             <div>
                <div className="flex justify-between text-sm mb-1">
                   <span className="text-muted">Throughput</span>
                   <span className="text-white">1.2k req/s</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                   <div className="bg-primary h-full w-[85%]"></div>
                </div>
             </div>
             <div>
                <div className="flex justify-between text-sm mb-1">
                   <span className="text-muted">Error Rate</span>
                   <span className="text-accent">0.8%</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                   <div className="bg-accent h-full w-[5%]"></div>
                </div>
             </div>
          </div>
        </div>

        {/* Alert Feed */}
        <div className="bg-surface p-4 rounded-lg border border-white/10 flex-1 min-h-[300px]">
           <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Bell size={18} className="text-white" />
            Live Alerts
          </h3>
          <div className="space-y-2">
             {alerts.length === 0 && <p className="text-muted text-sm text-center py-4">System Nominal</p>}
             {alerts.map((alert, i) => (
                <div key={i} className="bg-red-500/10 border-l-2 border-red-500 p-3 rounded flex items-start gap-3 animate-fade-in">
                   <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                   <div>
                      <p className="text-xs text-red-200 font-mono">{new Date().toLocaleTimeString()}</p>
                      <p className="text-sm text-white">{alert}</p>
                   </div>
                </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};