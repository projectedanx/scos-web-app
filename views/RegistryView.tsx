import React, { useState, useMemo } from 'react';
import { ProvenanceIndexEntry } from '../types';
import { Network, Search, RefreshCw, FileText, Link, Globe, Hash, Calendar, Activity, Database, AlertCircle } from 'lucide-react';

interface RegistryViewProps {
  index: ProvenanceIndexEntry[];
}

export const RegistryView: React.FC<RegistryViewProps> = ({ index }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RAW_DOCUMENT' | 'URL' | 'RESEARCH_TOPIC'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number>(Date.now());

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(Date.now());
    }, 2000);
  };

  const filteredData = useMemo(() => {
    return index.filter(entry => {
      const matchesType = typeFilter === 'ALL' || entry.sourceType === typeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        entry.agentName.toLowerCase().includes(q) ||
        entry.hash.toLowerCase().includes(q) ||
        (entry.snippet?.toLowerCase().includes(q) ?? false) ||
        (entry.analysis?.topics?.some(t => t.toLowerCase().includes(q)) ?? false);
      
      return matchesType && matchesSearch;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [index, searchQuery, typeFilter]);

  const stats = useMemo(() => {
    const totalBytes = index.reduce((acc, curr) => acc + (curr.snippet?.length || 0) * 10, 0); // Rough estimate
    const uniqueAgents = new Set(index.map(i => i.agentName)).size;
    
    return { totalBytes, uniqueAgents };
  }, [index]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             <Network className="w-8 h-8 text-cognitive" />
             Global Provenance Registry
          </h2>
          <p className="text-zinc-400">
            Immutable index of all ingested knowledge vectors and their resulting agent manifestations.
          </p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="text-right hidden md:block">
              <p className="text-[10px] text-zinc-500 font-mono uppercase">Node Status</p>
              <p className="text-xs font-bold text-emerald-400">SYNCED_LOCAL</p>
           </div>
           <button 
             onClick={handleSync}
             disabled={isSyncing}
             className="p-2 bg-zinc-900 border border-zinc-800 rounded hover:border-cognitive/50 hover:text-cognitive transition-all disabled:opacity-50"
           >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
            <div className="text-zinc-500 text-[10px] font-mono uppercase mb-1">Total Vectors</div>
            <div className="text-2xl font-bold text-white">{index.length}</div>
         </div>
         <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
            <div className="text-zinc-500 text-[10px] font-mono uppercase mb-1">Unique Agents</div>
            <div className="text-2xl font-bold text-white">{stats.uniqueAgents}</div>
         </div>
         <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
            <div className="text-zinc-500 text-[10px] font-mono uppercase mb-1">Est. Knowledge Mass</div>
            <div className="text-2xl font-bold text-white">{(stats.totalBytes / 1024).toFixed(2)} KB</div>
         </div>
         <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
            <div className="text-zinc-500 text-[10px] font-mono uppercase mb-1">Last Sync</div>
            <div className="text-lg font-mono text-zinc-300">{new Date(lastSync).toLocaleTimeString()}</div>
         </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
               type="text" 
               placeholder="Search by hash, agent name, or topic..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:border-cognitive outline-none transition-colors"
            />
         </div>
         <div className="flex items-center space-x-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-1">
            <button 
               onClick={() => setTypeFilter('ALL')}
               className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${typeFilter === 'ALL' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
               ALL
            </button>
            <button 
               onClick={() => setTypeFilter('RAW_DOCUMENT')}
               className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${typeFilter === 'RAW_DOCUMENT' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
               DOCS
            </button>
            <button 
               onClick={() => setTypeFilter('URL')}
               className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${typeFilter === 'URL' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
               URLS
            </button>
            <button 
               onClick={() => setTypeFilter('RESEARCH_TOPIC')}
               className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${typeFilter === 'RESEARCH_TOPIC' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
               TOPICS
            </button>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-void-light border border-zinc-800 rounded-lg overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-zinc-900/80 border-b border-zinc-800">
                     <th className="p-4 text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider w-12">Type</th>
                     <th className="p-4 text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Vector Hash / Source</th>
                     <th className="p-4 text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Agent Manifest</th>
                     <th className="p-4 text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Semantic Analysis</th>
                     <th className="p-4 text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider text-right">Timestamp</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-800/50">
                  {filteredData.length > 0 ? (
                     filteredData.map((entry, idx) => (
                        <tr key={idx} className="group hover:bg-zinc-900/40 transition-colors">
                           <td className="p-4">
                              {entry.sourceType === 'URL' && <Link className="w-4 h-4 text-blue-400" />}
                              {entry.sourceType === 'RAW_DOCUMENT' && <FileText className="w-4 h-4 text-emerald-400" />}
                              {entry.sourceType === 'RESEARCH_TOPIC' && <Globe className="w-4 h-4 text-purple-400" />}
                           </td>
                           <td className="p-4">
                              <div className="flex flex-col">
                                 <div className="flex items-center space-x-2 font-mono text-xs text-zinc-300">
                                    <Hash className="w-3 h-3 text-zinc-600" />
                                    <span className="truncate max-w-[150px]" title={entry.hash}>{entry.hash}</span>
                                 </div>
                                 {entry.snippet && (
                                    <span className="text-[10px] text-zinc-500 truncate max-w-[200px] mt-1 italic">
                                       "{entry.snippet}"
                                    </span>
                                 )}
                              </div>
                           </td>
                           <td className="p-4">
                              <div className="flex items-center space-x-2">
                                 <Database className="w-3 h-3 text-zinc-600" />
                                 <span className="text-sm font-bold text-white group-hover:text-cognitive transition-colors">
                                    {entry.agentName}
                                 </span>
                              </div>
                           </td>
                           <td className="p-4">
                              <div className="space-y-2">
                                 {entry.analysis && (
                                    <>
                                       <div className="flex items-center space-x-2">
                                          <Activity className="w-3 h-3 text-zinc-600" />
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                             entry.analysis.sentiment === 'POSITIVE' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' :
                                             entry.analysis.sentiment === 'NEGATIVE' ? 'bg-red-900/20 text-red-400 border-red-900/50' :
                                             entry.analysis.sentiment === 'COMPLEX' ? 'bg-purple-900/20 text-purple-400 border-purple-900/50' :
                                             'bg-zinc-800 text-zinc-400 border-zinc-700'
                                          }`}>
                                             {entry.analysis.sentiment}
                                          </span>
                                       </div>
                                       <div className="flex flex-wrap gap-1">
                                          {(entry.analysis.topics || []).slice(0, 3).map((topic, tIdx) => (
                                             <span key={tIdx} className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 rounded border border-zinc-800">
                                                #{topic}
                                             </span>
                                          ))}
                                       </div>
                                    </>
                                 )}
                                 {!entry.analysis && <span className="text-[10px] text-zinc-600 italic">No deep analysis</span>}
                              </div>
                           </td>
                           <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-2 text-xs text-zinc-500 font-mono">
                                 <Calendar className="w-3 h-3" />
                                 <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                              </div>
                              <div className="text-[10px] text-zinc-600 font-mono mt-1">
                                 {new Date(entry.timestamp).toLocaleTimeString()}
                              </div>
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan={5} className="p-12 text-center text-zinc-500 italic">
                           <div className="flex flex-col items-center gap-2">
                              <AlertCircle className="w-8 h-8 opacity-20" />
                              <p>No registry entries found matching filters.</p>
                           </div>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};