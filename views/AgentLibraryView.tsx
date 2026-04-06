
import React, { useState, useMemo } from 'react';
import { SovereignAgentManifest } from '../types';
import { Shield, Zap, Anchor, Box, Bot, FileJson, Globe, Copy, Search, Filter, ArrowUpDown, AlertTriangle, LayoutGrid, List } from 'lucide-react';

interface AgentLibraryViewProps {
  agents: SovereignAgentManifest[];
  onSelectAgent: (agent: SovereignAgentManifest) => void;
  onMapAgent: (agent: SovereignAgentManifest) => void;
}

type SortMode = 'DATE_NEW' | 'DATE_OLD' | 'NAME_AZ' | 'NAME_ZA';
type RiskFilter = 'ALL' | 'SAFE' | 'CRITICAL';

/**
 * The AgentLibraryView function.
 * @param { agents, onSelectAgent, onMapAgent } - The { agents, onSelectAgent, onMapAgent } parameter.
 * @returns The resulting value.
 */
export const AgentLibraryView: React.FC<AgentLibraryViewProps> = ({ agents, onSelectAgent, onMapAgent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('DATE_NEW');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');

  // --- Filtering & Sorting Logic ---
  const filteredAgents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return agents.filter(agent => {
      // 1. Search Filter
      const matchSearch = 
        !q ||
        agent.identity.name.toLowerCase().includes(q) ||
        agent.identity.designation.toLowerCase().includes(q) ||
        agent.identity.corePhilosophy.toLowerCase().includes(q);
      
      if (!matchSearch) return false;

      // 2. Risk Filter
      if (riskFilter === 'CRITICAL') {
         const hasCritical = agent.tools.some(t => t.riskLevel === 'CRITICAL' || t.riskLevel === 'HIGH');
         if (!hasCritical) return false;
      }
      if (riskFilter === 'SAFE') {
         const isSafe = agent.tools.every(t => t.riskLevel === 'LOW' || t.riskLevel === 'MEDIUM');
         if (!isSafe) return false;
      }

      return true;
    }).sort((a, b) => {
      // 3. Sorting
      const dateA = a.provenance?.details.ingestedAt || 0;
      const dateB = b.provenance?.details.ingestedAt || 0;

      switch (sortMode) {
        case 'DATE_NEW': return dateB - dateA;
        case 'DATE_OLD': return dateA - dateB;
        case 'NAME_AZ': return a.identity.name.localeCompare(b.identity.name);
        case 'NAME_ZA': return b.identity.name.localeCompare(a.identity.name);
        default: return 0;
      }
    });
  }, [agents, searchQuery, sortMode, riskFilter]);

  // --- Stats ---
  const stats = useMemo(() => {
     const total = agents.length;
     const critical = agents.filter(a => a.tools.some(t => t.riskLevel === 'CRITICAL')).length;
     const tools = agents.reduce((acc, a) => acc + a.tools.length, 0);
     return { total, critical, tools };
  }, [agents]);
  
  const handleViewJson = (e: React.MouseEvent, agent: SovereignAgentManifest) => {
    e.stopPropagation();
    
    // Clean Manifest Logic (Strip Council Log)
    let cleanAgent = { ...agent };
    if (cleanAgent.provenance?.councilLog) {
        const { councilLog, ...cleanProvenance } = cleanAgent.provenance;
        cleanAgent = { ...cleanAgent, provenance: cleanProvenance };
    }

    const blob = new Blob([JSON.stringify(cleanAgent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleMapClick = (e: React.MouseEvent, agent: SovereignAgentManifest) => {
    e.stopPropagation();
    onMapAgent(agent);
  };

  const handleCloneClick = (e: React.MouseEvent, agent: SovereignAgentManifest) => {
    e.stopPropagation();
    onSelectAgent(agent);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
       {/* Header & Stats */}
       <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
               <Bot className="w-8 h-8 text-sovereign" />
               Agent Library
            </h2>
            <p className="text-zinc-400">
               Authorized Sovereign Identities residing in the Vault.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
             <div className="px-4 border-r border-zinc-800">
                <p className="text-[10px] text-zinc-500 font-mono uppercase">Total Assets</p>
                <p className="text-xl font-bold text-white font-mono">{stats.total}</p>
             </div>
             <div className="px-4 border-r border-zinc-800">
                <p className="text-[10px] text-zinc-500 font-mono uppercase">Total Capabilities</p>
                <p className="text-xl font-bold text-cognitive font-mono">{stats.tools}</p>
             </div>
             <div className="px-4">
                <p className="text-[10px] text-zinc-500 font-mono uppercase">Critical Risk</p>
                <p className="text-xl font-bold text-immune font-mono">{stats.critical}</p>
             </div>
          </div>
       </div>

       {/* Toolbar */}
       <div className="sticky top-16 z-20 bg-void/80 backdrop-blur-md border border-zinc-800 p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4 justify-between items-center shadow-2xl">
          <div className="relative w-full md:max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
             <input 
               type="text" 
               placeholder="Search by name, designation, or philosophy..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:border-sovereign outline-none transition-colors"
             />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
             {/* Risk Filter */}
             <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-1">
                <button 
                  onClick={() => setRiskFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${riskFilter === 'ALL' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  ALL
                </button>
                <button 
                  onClick={() => setRiskFilter('SAFE')}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-colors flex items-center gap-1 ${riskFilter === 'SAFE' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Shield className="w-3 h-3" />
                  SAFE
                </button>
                <button 
                  onClick={() => setRiskFilter('CRITICAL')}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-colors flex items-center gap-1 ${riskFilter === 'CRITICAL' ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  CRITICAL
                </button>
             </div>

             {/* Sort */}
             <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-1">
                 <button 
                    onClick={() => setSortMode(prev => prev.includes('DATE') ? 'NAME_AZ' : 'DATE_NEW')}
                    className="p-1.5 text-zinc-400 hover:text-white"
                    title="Toggle Sort Mode"
                 >
                    {sortMode.includes('DATE') ? <ArrowUpDown className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                 </button>
                 <span className="text-xs font-mono px-2 text-zinc-500 border-l border-zinc-800">
                    {sortMode === 'DATE_NEW' && 'NEWEST'}
                    {sortMode === 'DATE_OLD' && 'OLDEST'}
                    {sortMode === 'NAME_AZ' && 'A-Z'}
                    {sortMode === 'NAME_ZA' && 'Z-A'}
                 </span>
             </div>
          </div>
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent, idx) => (
               <div 
                 key={idx} 
                 onClick={() => onSelectAgent(agent)} 
                 className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 hover:border-sovereign/50 hover:bg-zinc-900/60 cursor-pointer transition-all group flex flex-col h-full relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Shield className="w-24 h-24 text-sovereign -mr-8 -mt-8" />
                  </div>

                  {/* Header */}
                  <div className="flex items-start space-x-4 mb-4 relative z-10">
                     <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sovereign group-hover:scale-105 transition-transform shadow-lg">
                        <Bot className="w-6 h-6" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg leading-tight truncate">{agent.identity.name}</h3>
                        <p className="text-xs text-zinc-500 font-mono mt-1 truncate">{agent.identity.designation}</p>
                     </div>
                  </div>

                  {/* Philosophy */}
                  <div className="mb-6 flex-grow relative z-10">
                     <div className="text-[10px] font-mono text-zinc-600 uppercase mb-2 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-sovereign"></span>
                        Core Philosophy
                     </div>
                     <p className="text-sm text-zinc-300 italic line-clamp-4 leading-relaxed bg-black/20 p-3 rounded border border-zinc-800/50">
                        "{agent.identity.corePhilosophy}"
                     </p>
                  </div>

                  {/* Stats Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 text-xs text-zinc-500 font-mono relative z-10">
                     <div className="flex gap-2">
                        <div className="flex items-center space-x-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800" title="Tools">
                           <Box className="w-3 h-3 text-cognitive" />
                           <span>{agent.tools.length}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800" title="Abilities">
                           <Zap className="w-3 h-3 text-yellow-500" />
                           <span>{agent.abilities.length}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800" title="Anchors">
                           <Anchor className="w-3 h-3 text-purple-500" />
                           <span>{agent.anchors.length}</span>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        {/* Clone Action */}
                        <button 
                           onClick={(e) => handleCloneClick(e, agent)}
                           className="flex items-center space-x-1.5 hover:text-sovereign transition-colors group/clone"
                           title="Clone to Forge for Refinement"
                        >
                           <Copy className="w-3 h-3 text-zinc-500 group-hover/clone:text-sovereign" />
                           <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover/clone:text-white hidden sm:inline">CLONE</span>
                        </button>
                        <div className="w-px h-3 bg-zinc-800 self-center"></div>

                        {/* Ontology Action */}
                        <button 
                           onClick={(e) => handleMapClick(e, agent)}
                           className="flex items-center space-x-1.5 hover:text-purple-400 transition-colors group/map"
                           title="Generate Worldview Ontology"
                        >
                           <Globe className="w-3 h-3 text-zinc-500 group-hover/map:text-purple-400" />
                           <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover/map:text-white hidden sm:inline">ONTOLOGY</span>
                        </button>
                        <div className="w-px h-3 bg-zinc-800 self-center"></div>

                        {/* JSON Export */}
                        <button 
                           onClick={(e) => handleViewJson(e, agent)}
                           className="flex items-center space-x-1.5 hover:text-blue-400 transition-colors group/btn"
                        >
                           <FileJson className="w-3 h-3 text-zinc-500 group-hover/btn:text-blue-400" />
                           <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover/btn:text-white hidden sm:inline">JSON</span>
                        </button>
                     </div>
                  </div>
               </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
               <Bot className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
               <p className="text-zinc-500 font-medium">
                  {agents.length > 0 ? "No agents match your current filters." : "The Vault is currently empty."}
               </p>
               {agents.length === 0 && (
                  <p className="text-xs text-zinc-600 font-mono mt-2 max-w-md mx-auto">
                    Initialize the Agent Forge to construct and manifest new Sovereign Identities.
                  </p>
               )}
            </div>
          )}
       </div>
    </div>
  );
};
