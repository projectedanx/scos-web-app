
import React, { useMemo } from 'react';
import { 
  Shield, 
  Activity, 
  Database, 
  Cpu, 
  Lock, 
  Zap, 
  GitBranch, 
  Clock, 
  AlertTriangle, 
  Terminal, 
  Search, 
  Plus, 
  Network, 
  HardDrive,
  Coins,
  FileLock
, Eye} from 'lucide-react';
import { SovereignAgentManifest, ProvenanceIndexEntry, ViewMode } from '../types';
import { CommanderKeyPair } from '../services/cryptoService';

interface DashboardViewProps {
  agents: SovereignAgentManifest[];
  provenanceHistory: ProvenanceIndexEntry[];
  commanderKeys: CommanderKeyPair | null;
  user: any;
  onNavigate: (mode: ViewMode) => void;
}

/**
 * The DashboardView function.
 * @param {
 *   agents,
 *   provenanceHistory,
 *   commanderKeys,
 *   user,
 *   onNavigate
 * } - The {
 *   agents,
 *   provenanceHistory,
 *   commanderKeys,
 *   user,
 *   onNavigate
 * } parameter.
 * @returns The resulting value.
 */
export const DashboardView: React.FC<DashboardViewProps> = ({ 
  agents, 
  provenanceHistory, 
  commanderKeys, 
  user,
  onNavigate 
}) => {

  // --- Telemetry Calculations ---
  const stats = useMemo(() => {
    const totalAgents = agents.length;
    
    // Risk Analysis
    const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    let totalTools = 0;
    
    agents.forEach(a => {
      a.tools.forEach(t => {
        totalTools++;
        if (riskCounts[t.riskLevel as keyof typeof riskCounts] !== undefined) {
           riskCounts[t.riskLevel as keyof typeof riskCounts]++;
        }
      });
    });

    const criticalRatio = totalTools > 0 ? (riskCounts.CRITICAL / totalTools) * 100 : 0;
    
    // Cognitive Capital (Weighted Value of Knowledge)
    const cognitiveCapital = provenanceHistory.reduce((acc, curr) => {
       const baseMass = curr.analysis?.wordCount || 100;
       let multiplier = 1;

       // Weighting Logic: Structured Knowledge > Raw Data
       switch (curr.sourceType) {
         case 'CONSTELLATION': 
            multiplier = 10; // High Value (Semantic Graph)
            break;
         case 'RESEARCH_TOPIC':
            multiplier = 5; // Medium Value (Synthesized Intelligence)
            break;
         case 'RAW_DOCUMENT':
         case 'URL':
         default:
            multiplier = 1; // Base Value (Raw Ore)
       }

       return acc + (baseMass * multiplier);
    }, 0);

    return {
      totalAgents,
      totalTools,
      riskCounts,
      criticalRatio,
      cognitiveCapital,
      lastActive: provenanceHistory.length > 0 ? provenanceHistory[provenanceHistory.length - 1].timestamp : Date.now()
    };
  }, [agents, provenanceHistory]);

  const recentActivity = [...provenanceHistory].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  const StatCard = ({ label, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon className="w-16 h-16" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center space-x-2 text-zinc-500 mb-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-widest">{label}</span>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        {subtext && <div className="text-xs text-zinc-600 font-mono">{subtext}</div>}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             <Activity className="w-8 h-8 text-sovereign" />
             Command Dashboard
          </h2>
          <div className="flex items-center gap-3 text-zinc-400 font-mono text-sm">
             <span>System Status: <span className="text-sovereign">OPERATIONAL</span></span>
             <span className="text-zinc-700">|</span>
             <div className="flex items-center gap-1.5" title="Cognitive Capital: Weighted value of processed knowledge">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-zinc-300">Cap:</span>
                <span className="text-white font-bold">{stats.cognitiveCapital.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-600">UNIT</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {/* Schema Lock Indicator */}
           <div className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded flex items-center gap-2" title="Identity Schema Frozen (v1.8)">
              <FileLock className="w-4 h-4 text-zinc-500" />
              <div className="flex flex-col">
                 <span className="text-[10px] text-zinc-500 uppercase font-bold">IDENTITY SCHEMA</span>
                 <span className="text-xs text-zinc-400 font-mono">LOCKED</span>
              </div>
           </div>

           {commanderKeys ? (
             <div className="px-4 py-2 bg-emerald-950/20 border border-emerald-900/50 rounded flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <div className="flex flex-col">
                   <span className="text-[10px] text-emerald-600 uppercase font-bold">Secure Enclave</span>
                   <span className="text-xs text-emerald-400 font-mono">KEYS ACTIVE</span>
                </div>
             </div>
           ) : (
             <div className="px-4 py-2 bg-red-950/20 border border-red-900/50 rounded flex items-center gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-red-400 font-mono font-bold">KEYS MISSING</span>
             </div>
           )}
           <div className={`px-4 py-2 rounded flex items-center gap-2 border ${user ? 'bg-blue-950/20 border-blue-900/50' : 'bg-zinc-900 border-zinc-800'}`}>
              <Network className={`w-4 h-4 ${user ? 'text-blue-400' : 'text-zinc-600'}`} />
              <div className="flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-zinc-500">Uplink</span>
                 <span className={`text-xs font-mono ${user ? 'text-blue-400' : 'text-zinc-500'}`}>{user ? 'CONNECTED' : 'OFFLINE'}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Sovereign Agents" 
          value={stats.totalAgents} 
          icon={Cpu} 
          color="text-sovereign"
          subtext={`${stats.totalTools} Total Capabilities`} 
        />
        <StatCard 
          label="Knowledge Vectors" 
          value={provenanceHistory.length} 
          icon={Database} 
          color="text-cognitive"
          subtext="Indexed Provenance" 
        />
        <StatCard 
          label="System Risk" 
          value={`${stats.criticalRatio.toFixed(1)}%`} 
          icon={Shield} 
          color={stats.criticalRatio > 10 ? 'text-immune' : 'text-emerald-500'}
          subtext={`${stats.riskCounts.CRITICAL} Critical Tools Detected`} 
        />
        <StatCard 
          label="Cognitive Capital" 
          value={stats.cognitiveCapital.toLocaleString()} 
          icon={Zap} 
          color="text-yellow-500"
          subtext="Weighted Knowledge Value" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Actions & Risk Map */}
        <div className="space-y-8">
           {/* Quick Actions */}
           <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                 <Terminal className="w-4 h-4 text-zinc-400" />
                 Tactical Operations
              </h3>
              <div className="space-y-3">
                 <button 
                   onClick={() => onNavigate(ViewMode.FORGE)}
                   className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-sovereign/50 rounded group transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-sovereign/10 rounded text-sovereign group-hover:scale-110 transition-transform">
                          <Plus className="w-4 h-4" />
                       </div>
                       <div className="text-left">
                          <div className="text-sm font-bold text-zinc-200 group-hover:text-white">Fabricate Agent</div>
                          <div className="text-[10px] text-zinc-500 font-mono">Initialize New Identity</div>
                       </div>
                    </div>
                    <Terminal className="w-4 h-4 text-zinc-600 group-hover:text-sovereign" />
                 </button>

                 <button 
                   onClick={() => onNavigate(ViewMode.WORD_MAPPER)}
                   className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-yellow-500/50 rounded group transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-yellow-500/10 rounded text-yellow-500 group-hover:scale-110 transition-transform">
                          <GitBranch className="w-4 h-4" />
                       </div>
                       <div className="text-left">
                          <div className="text-sm font-bold text-zinc-200 group-hover:text-white">Map Constellation</div>
                          <div className="text-[10px] text-zinc-500 font-mono">Semantic Triangulation</div>
                       </div>
                    </div>
                    <Search className="w-4 h-4 text-zinc-600 group-hover:text-yellow-500" />
                 </button>

                 <button 
                   onClick={() => onNavigate(ViewMode.CAPSULE_LAB)}
                   className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-blue-500/50 rounded group transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-500/10 rounded text-blue-500 group-hover:scale-110 transition-transform">
                          <Database className="w-4 h-4" />
                       </div>
                       <div className="text-left">
                          <div className="text-sm font-bold text-zinc-200 group-hover:text-white">Distill Capsule</div>
                          <div className="text-[10px] text-zinc-500 font-mono">Knowledge Artifact</div>
                       </div>
                    </div>
                    <HardDrive className="w-4 h-4 text-zinc-600 group-hover:text-blue-500" />
                 </button>
                               <button
                   onClick={() => onNavigate(ViewMode.WORLDVIEW)}
                   className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-indigo-500/50 rounded group transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-indigo-500/10 rounded text-indigo-500 group-hover:scale-110 transition-transform">
                          <Network className="w-4 h-4" />
                       </div>
                       <div className="text-left">
                          <div className="text-sm font-bold text-zinc-200 group-hover:text-white">Synthesize Worldview</div>
                          <div className="text-[10px] text-zinc-500 font-mono">Justified Uncertainty Report</div>
                       </div>
                    </div>
                    <Eye className="w-4 h-4 text-zinc-600 group-hover:text-indigo-500" />
                 </button>
              </div>
           </div>

           {/* Risk Distribution */}
           <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                 <Shield className="w-4 h-4 text-zinc-400" />
                 Immunological Profile
              </h3>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                       <span>Critical Risk</span>
                       <span className="text-immune font-mono">{stats.riskCounts.CRITICAL}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <div className="h-full bg-immune" style={{ width: `${(stats.riskCounts.CRITICAL / stats.totalTools) * 100}%` }}></div>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                       <span>High Risk</span>
                       <span className="text-orange-400 font-mono">{stats.riskCounts.HIGH}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <div className="h-full bg-orange-500" style={{ width: `${(stats.riskCounts.HIGH / stats.totalTools) * 100}%` }}></div>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                       <span>Standard Operations</span>
                       <span className="text-blue-400 font-mono">{stats.riskCounts.LOW + stats.riskCounts.MEDIUM}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: `${((stats.riskCounts.LOW + stats.riskCounts.MEDIUM) / stats.totalTools) * 100}%` }}></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Center/Right: The Feed */}
        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-col h-full">
           <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
               <Clock className="w-4 h-4 text-zinc-400" />
               Temporal Stream (Recent Activity)
           </h3>
           
           <div className="space-y-0 relative">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-zinc-800"></div>
              
              {recentActivity.length > 0 ? (
                recentActivity.map((entry, idx) => (
                   <div key={idx} className="relative pl-8 pb-8 group">
                      <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-zinc-950 z-10 ${
                         entry.sourceType === 'URL' ? 'border-blue-500 text-blue-500' : 
                         entry.sourceType === 'RAW_DOCUMENT' ? 'border-emerald-500 text-emerald-500' :
                         entry.sourceType === 'CONSTELLATION' ? 'border-yellow-500 text-yellow-500' :
                         'border-purple-500 text-purple-500'
                      }`}>
                         <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      </div>
                      
                      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg hover:bg-zinc-800/80 transition-colors">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-white">{entry.agentName}</span>
                            <span className="text-[10px] font-mono text-zinc-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                         </div>
                         <p className="text-xs text-zinc-400 mb-2 font-mono truncate">
                            {entry.hash}
                         </p>
                         <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded border ${
                               entry.sourceType === 'URL' ? 'bg-blue-900/20 border-blue-900/50 text-blue-400' : 
                               entry.sourceType === 'RAW_DOCUMENT' ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-400' :
                               entry.sourceType === 'CONSTELLATION' ? 'bg-yellow-900/20 border-yellow-900/50 text-yellow-400' :
                               'bg-purple-900/20 border-purple-900/50 text-purple-400'
                            }`}>
                               {entry.sourceType}
                            </span>
                            {entry.analysis?.topics && (
                               <span className="text-[10px] text-zinc-600 truncate max-w-[200px]">
                                  {entry.analysis.topics.slice(0, 2).join(', ')}
                               </span>
                            )}
                         </div>
                      </div>
                   </div>
                ))
              ) : (
                <div className="pl-8 text-zinc-500 text-sm italic">
                   No recent activity recorded in the temporal stream.
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
