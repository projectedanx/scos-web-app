
import React from 'react';
import { SovereignAgentManifest } from '../types';
import { Shield, Zap, Anchor, Box, Bot, FileJson } from 'lucide-react';

interface AgentLibraryViewProps {
  agents: SovereignAgentManifest[];
  onSelectAgent: (agent: SovereignAgentManifest) => void;
}

export const AgentLibraryView: React.FC<AgentLibraryViewProps> = ({ agents, onSelectAgent }) => {
  
  const handleViewJson = (e: React.MouseEvent, agent: SovereignAgentManifest) => {
    e.stopPropagation();
    const blob = new Blob([JSON.stringify(agent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
       <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
               <Bot className="w-8 h-8 text-sovereign" />
               Agent Library
            </h2>
            <p className="text-zinc-400">
               Authorized Sovereign Identities currently residing in the Vault.
            </p>
          </div>
          <div className="text-right hidden md:block">
             <p className="text-[10px] text-zinc-500 font-mono uppercase">Total Assets</p>
             <p className="text-2xl font-bold text-white font-mono">{agents.length}</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.length > 0 ? (
            agents.map((agent, idx) => (
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

                     <button 
                        onClick={(e) => handleViewJson(e, agent)}
                        className="flex items-center space-x-1.5 hover:text-sovereign transition-colors pl-2 group/btn"
                     >
                        <FileJson className="w-3 h-3 text-zinc-500 group-hover/btn:text-sovereign" />
                        <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover/btn:text-white hidden sm:inline">JSON</span>
                     </button>
                  </div>
               </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
               <Bot className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
               <p className="text-zinc-500 font-medium">The Vault is currently empty.</p>
               <p className="text-xs text-zinc-600 font-mono mt-2 max-w-md mx-auto">
                 Initialize the Agent Forge to construct and manifest new Sovereign Identities.
               </p>
            </div>
          )}
       </div>
    </div>
  );
};
