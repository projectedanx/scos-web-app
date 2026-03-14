
import React, { useState, useEffect } from 'react';
import { GitGraph, Search, Zap, Clock, Globe, Heart, Eye, Layers, Hexagon, Plus, ArrowRight, Sparkles, Filter, BrainCircuit, Share2, BookOpen, Loader2, ShieldAlert, Crosshair, Network, FileCode, AlertTriangle, CheckCircle2, Circle, Download } from 'lucide-react';
import { triangulateConcepts, fetchWikipediaDefinition, MapStrategy } from '../services/wordMapperService';
import { ProvenanceIndexEntry, TokenUsage } from '../types';
import { useToast } from '../contexts/ToastContext';

export interface SemanticNode {
  id: string;
  concept: string;
  type: 'SEED' | 'EMERGENT' | 'BRIDGE' | 'PARADOX' | 'INVARIANT' | 'RISK' | 'SAFE_TOKEN' | 'LAYER';
  dimension: 'TEMPORAL' | 'CULTURAL' | 'EMOTIONAL' | 'SENSORY' | 'METAPHORICAL' | 'PARADOX';
  definition?: string;
  tags?: string[];
}

export interface WordMapperState {
  seeds: string[];
  strategy: MapStrategy;
}

interface WordMapperViewProps {
  onRegisterConstellation?: (entry: ProvenanceIndexEntry) => void;
  initialState?: WordMapperState | null;
  onStateConsumed?: () => void;
}

export const WordMapperView: React.FC<WordMapperViewProps> = ({ onRegisterConstellation, initialState, onStateConsumed }) => {
  const [seeds, setSeeds] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isMapping, setIsMapping] = useState(false);
  const [results, setResults] = useState<SemanticNode[] | null>(null);
  const [strategy, setStrategy] = useState<MapStrategy>(MapStrategy.GENERAL);
  const [lastUsage, setLastUsage] = useState<TokenUsage | null>(null);
  
  // Selection State
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());

  // Dimensional Filters State
  const [activeDimensions, setActiveDimensions] = useState<Set<string>>(new Set(['TEMPORAL', 'CULTURAL', 'EMOTIONAL', 'SENSORY', 'METAPHORICAL', 'PARADOX']));

  // Detail View State
  const [selectedNode, setSelectedNode] = useState<SemanticNode | null>(null);
  const [wikiDefinition, setWikiDefinition] = useState<string | null>(null);
  const [loadingWiki, setLoadingWiki] = useState(false);

  const { addToast } = useToast();

  // Handle Initial State from Props (Navigation from Agent Library)
  useEffect(() => {
    if (initialState) {
      setSeeds(initialState.seeds);
      setStrategy(initialState.strategy);
      setResults(null); // Reset results when loading new context
      setLastUsage(null);
      if (onStateConsumed) {
        onStateConsumed();
      }
    }
  }, [initialState, onStateConsumed]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedNodeIds(new Set());
  }, [results]);

  const toggleDimension = (dim: string) => {
    setActiveDimensions(prev => {
      const next = new Set(prev);
      if (next.has(dim)) next.delete(dim);
      else next.add(dim);
      return next;
    });
  };

  const handleAddSeed = () => {
    if (currentInput.trim() && seeds.length < 5) {
      setSeeds([...seeds, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const handleTriangulate = async () => {
    if (seeds.length === 0) return;
    setIsMapping(true);
    setResults(null);
    setSelectedNode(null);
    setLastUsage(null);

    try {
      const result = await triangulateConcepts(seeds, strategy);
      setResults(result.nodes);
      setLastUsage(result.usage);
    } catch (e) {
      console.error(e);
      addToast("Mapping failed. Check console.", 'error');
    } finally {
      setIsMapping(false);
    }
  };

  const removeSeed = (idx: number) => {
    setSeeds(seeds.filter((_, i) => i !== idx));
  };

  const handleViewDetails = async (node: SemanticNode) => {
    setSelectedNode(node);
    setWikiDefinition(null);
    setLoadingWiki(true);
    
    // Attempt to fetch real wikipedia definition
    const def = await fetchWikipediaDefinition(node.concept);
    setWikiDefinition(def || node.definition || "No further definition available.");
    setLoadingWiki(false);
  };

  // --- Selection Logic ---

  const toggleNodeSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!results) return;
    const visibleNodes = results.filter(n => activeDimensions.has(n.dimension));
    
    // If all visible are selected, deselect all. Otherwise, select all visible.
    const allVisibleSelected = visibleNodes.every(n => selectedNodeIds.has(n.id));

    if (allVisibleSelected) {
       setSelectedNodeIds(new Set());
    } else {
       const newSet = new Set(selectedNodeIds);
       visibleNodes.forEach(n => newSet.add(n.id));
       setSelectedNodeIds(newSet);
    }
  };

  const handleExportJSON = () => {
    if (!results) return;
    const nodesToExport = results.filter(n => selectedNodeIds.has(n.id));
    const constellationId = crypto.randomUUID();
    const timestamp = Date.now();

    const exportData = {
      meta: {
        id: constellationId,
        timestamp: timestamp,
        strategy: strategy,
        seeds: seeds,
        count: nodesToExport.length,
        usage: lastUsage
      },
      nodes: nodesToExport
    };

    // Register in Provenance Registry
    if (onRegisterConstellation) {
      onRegisterConstellation({
        hash: `constellation-${constellationId.substring(0, 8)}`,
        agentName: `Map Strategy: ${strategy}`,
        timestamp: timestamp,
        sourceType: 'CONSTELLATION',
        snippet: seeds.join(', '),
        analysis: {
          wordCount: nodesToExport.length,
          sentiment: 'NEUTRAL',
          topics: nodesToExport.slice(0, 3).map(n => n.concept)
        }
      });
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `constellation-${strategy.toLowerCase()}-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Styles ---

  const getDimensionColor = (dim: string, type: string) => {
    // Override colors based on specific node types from strategies
    if (type === 'RISK') return 'text-red-400 border-red-500/30 bg-red-950/20';
    if (type === 'SAFE_TOKEN') return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (type === 'INVARIANT') return 'text-blue-400 border-blue-500/30 bg-blue-950/20';
    
    switch (dim) {
      case 'TEMPORAL': return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';
      case 'CULTURAL': return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      case 'EMOTIONAL': return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
      case 'SENSORY': return 'text-purple-400 border-purple-500/30 bg-purple-950/20';
      case 'METAPHORICAL': return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
      case 'PARADOX': return 'text-yellow-300 border-yellow-400/30 bg-yellow-900/20';
      default: return 'text-zinc-400 border-zinc-500/30 bg-zinc-900/20';
    }
  };

  const getDimensionIcon = (dim: string, type: string) => {
    if (type === 'RISK') return <AlertTriangle className="w-3 h-3" />;
    if (type === 'SAFE_TOKEN') return <ShieldAlert className="w-3 h-3" />;
    if (type === 'INVARIANT') return <Crosshair className="w-3 h-3" />;

    switch (dim) {
      case 'TEMPORAL': return <Clock className="w-3 h-3" />;
      case 'CULTURAL': return <Globe className="w-3 h-3" />;
      case 'EMOTIONAL': return <Heart className="w-3 h-3" />;
      case 'SENSORY': return <Eye className="w-3 h-3" />;
      case 'METAPHORICAL': return <Layers className="w-3 h-3" />;
      case 'PARADOX': return <Zap className="w-3 h-3" />;
      default: return <Hexagon className="w-3 h-3" />;
    }
  };

  const STRATEGY_OPTS = [
    { id: MapStrategy.GENERAL, label: 'General Exploration', icon: Search, color: 'text-zinc-400' },
    { id: MapStrategy.WORLDVIEW, label: 'Worldview Capsule', icon: Globe, color: 'text-purple-400' },
    { id: MapStrategy.TRACER, label: 'Semantic Tracers', icon: Crosshair, color: 'text-cyan-400' },
    { id: MapStrategy.ANTI_PATTERN, label: 'Anti-Pattern Radar', icon: ShieldAlert, color: 'text-red-400' },
    { id: MapStrategy.SCAFFOLDING, label: 'Cognitive Scaffolding', icon: Network, color: 'text-amber-400' },
    { id: MapStrategy.POLYSEMY, label: 'Polysemy Defense', icon: FileCode, color: 'text-emerald-400' },
  ];

  return (
    <div className="flex h-screen bg-void text-zinc-100 overflow-hidden">
      
      {/* LEFT PANEL: Controls & Input */}
      <div className="w-80 border-r border-zinc-900 bg-zinc-950/50 flex flex-col z-10 backdrop-blur-sm shrink-0">
        <div className="p-6 border-b border-zinc-900">
           <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
             <GitGraph className="w-6 h-6 text-sovereign" />
             Word Mapper
           </h2>
           <p className="text-xs text-zinc-500 font-mono">Tactical Semantic Engine</p>
        </div>

        {/* Scrollable Input Area */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
           
           {/* Strategy Selector */}
           <div className="mb-6">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 block">Tactical Operation</label>
              <div className="space-y-1">
                 {STRATEGY_OPTS.map((opt) => {
                    const isActive = strategy === opt.id;
                    const Icon = opt.icon;
                    return (
                       <button
                          key={opt.id}
                          onClick={() => setStrategy(opt.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-mono transition-all border ${
                             isActive 
                               ? `bg-zinc-900 border-zinc-700 ${opt.color.replace('text', 'border')} shadow-lg` 
                               : 'border-transparent text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
                          }`}
                       >
                          <Icon className={`w-4 h-4 ${isActive ? opt.color : 'text-zinc-600'}`} />
                          <span className={isActive ? 'text-white font-bold' : ''}>{opt.label}</span>
                       </button>
                    )
                 })}
              </div>
           </div>

           <div>
             <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 block">Seed Concepts (Max 5)</label>
             <div className="flex gap-2 mb-2">
               <input 
                 type="text" 
                 value={currentInput}
                 onChange={(e) => setCurrentInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAddSeed()}
                 placeholder="Enter concept..."
                 className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-sovereign outline-none"
               />
               <button onClick={handleAddSeed} disabled={!currentInput || seeds.length >= 5} className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded border border-zinc-700 disabled:opacity-50">
                 <Plus className="w-4 h-4" />
               </button>
             </div>
             
             <div className="space-y-2">
               {seeds.map((seed, idx) => (
                 <div key={idx} className="flex items-center justify-between bg-zinc-900/50 px-3 py-2 rounded border border-zinc-800/50 group">
                    <span className="text-sm font-mono text-zinc-300 line-clamp-1" title={seed}>{seed}</span>
                    <button onClick={() => removeSeed(idx)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                 </div>
               ))}
               {seeds.length === 0 && (
                 <div className="text-center py-4 text-xs text-zinc-600 italic border-2 border-dashed border-zinc-900 rounded">
                   No seeds planted.
                 </div>
               )}
             </div>
           </div>

           {/* Dimension Filters */}
           <div className="pt-4 border-t border-zinc-900">
              <div className="flex items-center justify-between mb-3">
                 <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-2">
                   <Filter className="w-3 h-3" />
                   Dimensional Lenses
                 </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 {['TEMPORAL', 'CULTURAL', 'EMOTIONAL', 'SENSORY', 'METAPHORICAL', 'PARADOX'].map(dim => {
                   const isActive = activeDimensions.has(dim);
                   return (
                     <button
                       key={dim}
                       onClick={() => toggleDimension(dim)}
                       className={`text-[10px] flex items-center gap-2 px-2 py-1.5 rounded border transition-all ${
                         isActive 
                           ? getDimensionColor(dim, '') 
                           : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                       }`}
                     >
                       {getDimensionIcon(dim, '')}
                       <span>{dim}</span>
                     </button>
                   );
                 })}
              </div>
           </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950">
           <button 
             onClick={handleTriangulate}
             disabled={seeds.length === 0 || isMapping}
             className="w-full bg-sovereign hover:bg-sovereign/90 text-zinc-950 font-bold py-3 rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale"
           >
             {isMapping ? <BrainCircuit className="w-5 h-5 animate-pulse" /> : <Search className="w-5 h-5" />}
             <span>{isMapping ? 'EXECUTING...' : 'MAP CONSTELLATION'}</span>
           </button>
        </div>
      </div>

      {/* MAIN CANVAS: Visualization */}
      <div className="flex-1 bg-void relative overflow-y-auto custom-scrollbar flex flex-col">
         {/* Background Grid */}
         <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
         </div>

         {!results && !isMapping && (
            <div className="flex-1 flex flex-col items-center justify-center z-10 opacity-50">
               <GitGraph className="w-24 h-24 text-zinc-800 mb-6" />
               <h3 className="text-xl font-bold text-zinc-700">Semantic Void</h3>
               <p className="text-zinc-600 max-w-md text-center mt-2">
                 Input seeds and select a tactical operation to triangulate hidden connections using Datamuse, ConceptNet, and Gemini.
               </p>
            </div>
         )}
         
         {isMapping && (
            <div className="flex-1 flex flex-col items-center justify-center z-10">
               <Loader2 className="w-16 h-16 text-sovereign animate-spin mb-4" />
               <p className="text-zinc-400 font-mono text-sm animate-pulse">Scanning Semantic Vectors...</p>
               <p className="text-zinc-600 font-mono text-xs mt-2">Applying {strategy} Logic...</p>
            </div>
         )}

         {/* Results Grid */}
         {results && !isMapping && (
           <div className="flex-1 p-8 z-10 animate-fade-in-up">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                    Emergent Constellation
                 </h2>
                 <div className="flex gap-3 items-center">
                    
                    {lastUsage && (
                       <div className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900/50 rounded-full border border-zinc-800 text-xs font-mono text-zinc-400 mr-2" title="Token Telemetry">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span>{lastUsage.totalTokens.toLocaleString()} TKN</span>
                      </div>
                    )}

                    {/* Select All Button */}
                    <button 
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-600 transition-colors text-xs font-mono text-zinc-400 hover:text-white"
                      title="Select All Visible"
                    >
                      {results.filter(n => activeDimensions.has(n.dimension)).every(n => selectedNodeIds.has(n.id)) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-sovereign" />
                          <span>ALL ({results.length})</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" />
                          <span>SELECT ALL</span>
                        </>
                      )}
                    </button>

                    {/* Export JSON Button */}
                    <button 
                      onClick={handleExportJSON}
                      disabled={selectedNodeIds.size === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded hover:border-sovereign/50 transition-colors text-xs font-mono text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                       <Download className="w-4 h-4 text-sovereign" />
                       <span>EXPORT JSON ({selectedNodeIds.size})</span>
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {results.filter(n => activeDimensions.has(n.dimension)).map((node) => {
                    const isSelected = selectedNodeIds.has(node.id);
                    return (
                      <div 
                        key={node.id} 
                        className={`group relative bg-zinc-900/40 border p-6 rounded-xl transition-all hover:-translate-y-1 hover:shadow-2xl ${
                          isSelected 
                            ? 'border-sovereign/50 bg-sovereign/5' 
                            : 'border-zinc-800 hover:bg-zinc-900/80'
                        }`}
                      >
                         <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${getDimensionColor(node.dimension, node.type).split(' ')[0].replace('text', 'bg')}`}></div>
                         
                         {/* Selection Checkbox (Top Right) */}
                         <div 
                           className="absolute top-4 right-4 cursor-pointer z-20"
                           onClick={(e) => toggleNodeSelection(e, node.id)}
                         >
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-sovereign drop-shadow-lg" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-700 hover:text-zinc-500" />
                            )}
                         </div>

                         <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getDimensionColor(node.dimension, node.type)} flex items-center gap-1`}>
                               {getDimensionIcon(node.dimension, node.type)}
                               {node.dimension}
                            </span>
                            <span className="text-[10px] text-zinc-600 font-mono uppercase mr-8">{node.type}</span>
                         </div>

                         <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sovereign transition-colors pr-6">
                            {node.concept}
                         </h3>
                         <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                            {node.definition}
                         </p>

                         {/* Strategy Tags */}
                         {node.tags && node.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                               {node.tags.map((tag, i) => (
                                  <span key={i} className="text-[10px] bg-black/40 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">
                                     {tag}
                                  </span>
                               ))}
                            </div>
                         )}

                         <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                            <button 
                               onClick={() => handleViewDetails(node)}
                               className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                            >
                               <BookOpen className="w-3 h-3" />
                               <span>Wiki / Details</span>
                            </button>
                         </div>
                      </div>
                   );
                 })}
              </div>
           </div>
         )}
      </div>

      {/* Details Modal */}
      {selectedNode && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedNode(null)}>
           <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
               <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${getDimensionColor(selectedNode.dimension, selectedNode.type).split(' ')[0].replace('text', 'bg')}`}></div>
               <h2 className="text-2xl font-bold text-white mb-1">{selectedNode.concept}</h2>
               <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${getDimensionColor(selectedNode.dimension, selectedNode.type)}`}>{selectedNode.dimension}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{selectedNode.type}</span>
               </div>
               
               <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2">Synthetic Definition</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">{selectedNode.definition}</p>
                  
                  {selectedNode.tags && (
                     <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-wrap gap-2">
                        {selectedNode.tags.map((tag, i) => (
                           <span key={i} className="text-[10px] px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-400 font-mono">
                              {tag}
                           </span>
                        ))}
                     </div>
                  )}
               </div>

               <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 mb-4 min-h-[100px]">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2">
                     <Globe className="w-3 h-3" />
                     Wikipedia Context
                  </h3>
                  {loadingWiki ? (
                     <div className="flex items-center gap-2 text-zinc-500 text-xs">
                        <Loader2 className="w-3 h-3 animate-spin" /> Fetching knowledge...
                     </div>
                  ) : (
                     <p className="text-zinc-300 text-sm leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                        {wikiDefinition}
                     </p>
                  )}
               </div>

               <div className="flex justify-end">
                  <button onClick={() => setSelectedNode(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded transition-colors">Close</button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};
