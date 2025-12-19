import React, { useState } from 'react';
import { Database, Server, ArrowRight, Code, Clock, Table, CheckCircle, RefreshCw, Search, History, Play } from 'lucide-react';

// Helper for consistency
const M: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-mono bg-white/5 px-1 rounded text-primary-200 text-sm mx-1">{children}</span>
);

interface FeatureDef {
  name: string;
  type: string;
  entity: string;
  description: string;
  online: boolean;
  lastUpdated: string;
}

interface BatchJob {
  id: string;
  date: string;
  records: number;
  status: 'Running' | 'Completed' | 'Failed';
}

const FEATURE_CATALOG: FeatureDef[] = [
  { name: 'backstage_x_tensor', type: 'Tensor<Float32>[256]', entity: 'agent_id', description: 'Sensory encodings + LSTM memory state', online: true, lastUpdated: '2m ago' },
  { name: 'workspace_w_vector', type: 'Vector<Float32>[16]', entity: 'agent_id', description: 'Bottlenecked broadcast variable (Latent)', online: true, lastUpdated: '2m ago' },
  { name: 'reward_history_1h', type: 'Array<Float>', entity: 'agent_id', description: 'Rolling average reward for baseline', online: false, lastUpdated: '1h ago' },
  { name: 'gate_threshold_static', type: 'Float', entity: 'global_config', description: 'Deployment-specific gate sensitivity', online: true, lastUpdated: '1d ago' },
  { name: 'action_distribution_prior', type: 'Vector<Float32>[8]', entity: 'agent_id', description: 'Prior distribution for KL regularization', online: true, lastUpdated: '4h ago' },
  { name: 'episodic_memory_embedding', type: 'Tensor<Float32>[512]', entity: 'agent_id', description: 'Retrieved context from long-term memory', online: false, lastUpdated: '12h ago' },
];

export const FeatureStorePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'ingestion' | 'serving'>('catalog');
  const [ingestProgress, setIngestProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  
  // API Simulation State
  const [entityId, setEntityId] = useState('agent_01');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['workspace_w_vector', 'gate_threshold_static']);

  const [batchHistory, setBatchHistory] = useState<BatchJob[]>([
    { id: 'job_1023', date: '2023-10-24 02:00', records: 2400000, status: 'Completed' },
    { id: 'job_1022', date: '2023-10-23 02:00', records: 2350000, status: 'Completed' },
  ]);

  const [apiResponse, setApiResponse] = useState<string>(JSON.stringify({
    "workspace_w_vector": [-0.21, 0.55, 0.03, -0.88, 0.12, 0.45, -0.33, 0.11],
    "gate_threshold_static": 0.85,
    "_metadata": {
        "served_at": new Date().toISOString(),
        "store_version": "v2.1.4",
        "latency_ms": 4
    }
  }, null, 2));

  const simulateIngest = () => {
    setIngestProgress(0);
    const newJob: BatchJob = { id: `job_${1024 + batchHistory.length}`, date: new Date().toLocaleString(), records: 0, status: 'Running' };
    setBatchHistory(prev => [newJob, ...prev]);

    const interval = setInterval(() => {
      setIngestProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBatchHistory(prevH => prevH.map(j => j.id === newJob.id ? { ...j, status: 'Completed', records: 2450000 + Math.floor(Math.random()*50000) } : j));
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setLastSync(new Date());
      setIsSyncing(false);
    }, 1500);
  };

  const toggleFeature = (name: string) => {
    setSelectedFeatures(prev => 
      prev.includes(name) 
        ? prev.filter(f => f !== name) 
        : [...prev, name]
    );
  };

  const refreshApi = () => {
    const response: Record<string, any> = {};
    
    selectedFeatures.forEach(feat => {
        if (feat.includes('vector') || feat.includes('tensor')) {
             response[feat] = Array.from({length: 8}, () => Number((Math.random() * 2 - 1).toFixed(2)));
        } else if (feat.includes('threshold') || feat.includes('prior')) {
             response[feat] = Number(Math.random().toFixed(4));
        } else {
             response[feat] = "mock_value";
        }
    });
    
    response["_metadata"] = {
        "served_at": new Date().toISOString(),
        "store_version": "v2.1.4",
        "latency_ms": Math.floor(Math.random() * 10) + 2
    };

    setApiResponse(JSON.stringify(response, null, 2));
  };

  const filteredFeatures = FEATURE_CATALOG.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-surface border border-white/10 rounded-lg overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="text-primary" size={24} />
              GWT-IB Feature Store
            </h2>
            <p className="text-muted text-sm mt-1">Centralized management for Model Features (X, W) and Training Data.</p>
          </div>
          <div className="flex bg-black/20 p-1 rounded-lg">
            {(['catalog', 'ingestion', 'serving'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded text-sm capitalize transition ${activeTab === tab ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {activeTab === 'catalog' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-center gap-2 bg-black/20 p-2 rounded border border-white/5 w-full max-w-md">
                <Search size={16} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Search features (e.g., 'workspace', 'tensor')..." 
                  className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto border border-white/5 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted uppercase bg-black/40">
                    <tr>
                      <th className="px-4 py-3">Feature Name</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Entity</th>
                      <th className="px-4 py-3">Serving</th>
                      <th className="px-4 py-3">Last Updated</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-black/10">
                    {filteredFeatures.map((f) => (
                      <tr key={f.name} className="hover:bg-white/5 transition group">
                        <td className="px-4 py-3 font-mono text-primary-200 font-medium">{f.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{f.type}</td>
                        <td className="px-4 py-3 text-slate-300">{f.entity}</td>
                        <td className="px-4 py-3">
                          {f.online ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                              <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></div> Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-white/5">
                               <div className="w-1 h-1 rounded-full bg-slate-400"></div> Batch
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 font-mono">{f.lastUpdated}</td>
                        <td className="px-4 py-3 text-muted max-w-xs truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:bg-surface/90 transition-all">
                          {f.description}
                        </td>
                      </tr>
                    ))}
                    {filteredFeatures.length === 0 && (
                       <tr>
                         <td colSpan={6} className="px-4 py-8 text-center text-muted">
                           No features found matching "{searchTerm}"
                         </td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ingestion' && (
            <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-black/20 p-6 rounded-lg border border-white/5">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Table size={18} /> Batch Ingestion Pipeline
                    </h3>
                    <p className="text-muted text-sm mb-6">
                      Ingest offline trajectories (State X, Action A, Reward R) into the offline store for PPO training and Drift baseline calculation.
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={simulateIngest}
                        disabled={ingestProgress > 0 && ingestProgress < 100}
                        className="bg-primary hover:bg-primary-600 disabled:opacity-50 text-white px-4 py-2 rounded flex items-center gap-2 transition"
                      >
                        <ArrowRight size={16} />
                        {ingestProgress > 0 && ingestProgress < 100 ? 'Ingesting...' : 'Run Daily Batch'}
                      </button>
                      
                      <div className="flex-1 bg-surface h-2 rounded-full overflow-hidden border border-white/10 relative">
                         {ingestProgress > 0 && ingestProgress < 100 && (
                            <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                         )}
                        <div 
                          className="h-full bg-secondary transition-all duration-300"
                          style={{ width: `${ingestProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-white w-10 text-right">{ingestProgress}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-surface rounded border border-white/5">
                      <div className="text-xl md:text-2xl font-bold text-white mb-1">{(2.4 + batchHistory.length * 0.05).toFixed(2)}M</div>
                      <div className="text-[10px] md:text-xs text-muted uppercase tracking-wider">Total Records</div>
                    </div>
                    <div className="p-4 bg-surface rounded border border-white/5">
                      <div className="text-xl md:text-2xl font-bold text-accent mb-1">12ms</div>
                      <div className="text-[10px] md:text-xs text-muted uppercase tracking-wider">Avg Write Latency</div>
                    </div>
                    <div className="p-4 bg-surface rounded border border-white/5">
                      <div className="text-xl md:text-2xl font-bold text-green-400 mb-1">99.9%</div>
                      <div className="text-[10px] md:text-xs text-muted uppercase tracking-wider">Success Rate</div>
                    </div>
                  </div>
                </div>

                {/* Job History */}
                <div className="bg-surface rounded-lg border border-white/5 p-4 flex flex-col h-full min-h-[300px]">
                   <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                     <History size={16} /> Job History
                   </h4>
                   <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                     {batchHistory.map(job => (
                       <div key={job.id} className="p-3 bg-black/20 rounded border border-white/5 text-xs hover:border-white/10 transition">
                          <div className="flex justify-between mb-1">
                            <span className="font-mono text-primary-200">{job.id}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              job.status === 'Completed' ? 'bg-green-500/10 text-green-400' : 
                              job.status === 'Running' ? 'bg-blue-500/10 text-blue-400 animate-pulse' : 
                              'bg-red-500/10 text-red-400'
                            }`}>{job.status}</span>
                          </div>
                          <div className="flex justify-between text-muted">
                            <span>{job.date.split(',')[0]}</span>
                            <span>{job.records > 0 ? `${(job.records/1000000).toFixed(2)}M recs` : '-'}</span>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'serving' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Server size={18} /> Online Serving API
                  </h3>
                  <p className="text-muted text-sm mb-4">
                    Low-latency feature retrieval for the Agent Policy <M>π(a|w)</M>.
                  </p>

                  {/* Request Builder */}
                  <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="text-sm font-semibold text-white">Simulation Request</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Status:</span>
                            <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                            <CheckCircle size={10} /> Online
                            </span>
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs text-muted block mb-1">Entity ID (Agent Key)</label>
                        <input 
                            type="text" 
                            value={entityId}
                            onChange={(e) => setEntityId(e.target.value)}
                            className="w-full bg-surface border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                            placeholder="e.g. agent_01"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted block mb-2">Requested Features</label>
                        <div className="space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {FEATURE_CATALOG.filter(f => f.online).map(f => (
                                <label key={f.name} className={`flex items-center gap-2 text-xs p-2 rounded cursor-pointer transition ${selectedFeatures.includes(f.name) ? 'bg-primary/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedFeatures.includes(f.name)}
                                        onChange={() => toggleFeature(f.name)}
                                        className="accent-primary w-4 h-4 rounded border-white/20 bg-black/40"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-mono font-medium">{f.name}</span>
                                        <span className="text-[10px] text-muted opacity-75">{f.type}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <button 
                       onClick={refreshApi}
                       className="w-full py-2 bg-primary hover:bg-primary-600 text-sm text-white font-medium rounded shadow shadow-primary/20 flex items-center justify-center gap-2 transition"
                    >
                       <Play size={14} fill="currentColor" /> Send Request
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                 <div className="grid grid-cols-2 gap-3">
                   <div className="flex flex-col p-3 bg-surface rounded border border-white/5">
                      <span className="text-xs text-slate-300">P99 Latency</span>
                      <span className="font-mono text-green-400 text-lg">4.2ms</span>
                   </div>
                   <div className="flex flex-col p-3 bg-surface rounded border border-white/5">
                      <span className="text-xs text-slate-300">Cache Hit Rate</span>
                      <span className="font-mono text-primary-200 text-lg">98.5%</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col h-full min-h-[400px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted font-mono flex items-center gap-2">
                     <Code size={14} /> Request Preview & Response
                  </div>
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="text-xs flex items-center gap-1 px-2 py-1 bg-white/5 text-slate-300 border border-white/10 rounded hover:bg-white/10 transition disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Syncing..." : "Sync Store"}
                  </button>
                </div>
                
                <div className="bg-[#0d1117] p-4 rounded-lg border border-white/10 font-mono text-xs overflow-x-auto flex-1 relative group shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                     <span className="text-muted">agent_controller.py</span>
                     <span className="text-[10px] text-slate-600">Python 3.9</span>
                  </div>
                  <div className="text-slate-500 mb-2"># Constructing request object...</div>
                  <pre className="text-slate-300">
{`features = store.get_online_features(
    entity_rows=[{"agent_id": "${entityId}"}],
    features=[
${selectedFeatures.map(f => `        "${f}"`).join(',\n')}
    ]
)`}
                  </pre>
                  <div className="text-slate-500 my-2"># API Response (Live Simulation):</div>
                  <pre className="text-green-400">
{apiResponse}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};