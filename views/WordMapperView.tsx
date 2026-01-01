
import React, { useState } from 'react';
import { GitGraph, Search, Zap, Clock, Globe, Heart, Eye, Layers, Hexagon, Plus, ArrowRight, Sparkles, Filter, BrainCircuit, Share2 } from 'lucide-react';

interface SemanticNode {
  id: string;
  concept: string;
  type: 'SEED' | 'EMERGENT' | 'BRIDGE' | 'PARADOX';
  dimension: 'TEMPORAL' | 'CULTURAL' | 'EMOTIONAL' | 'SENSORY' | 'METAPHORICAL' | 'PARADOX';
  definition?: string;
}

// Mock Data for UI Visualization
const MOCK_NODES: SemanticNode[] = [
  { id: '1', concept: 'Crystalline Innovation', type: 'EMERGENT', dimension: 'METAPHORICAL', definition: 'Structure that grows organically yet retains rigid perfection.' },
  { id: '2', concept: 'Digital Nostalgia', type: 'BRIDGE', dimension: 'EMOTIONAL', definition: 'A longing for a future that never happened, rendered in 8-bit.' },
  { id: '3', concept: 'Tactile Algorithms', type: 'EMERGENT', dimension: 'SENSORY', definition: 'Code that can be felt; haptic feedback loops in logic.' },
  { id: '4', concept: 'Ancient Future', type: 'PARADOX', dimension: 'TEMPORAL', definition: 'Technology so advanced it returns to primitive reliability.' },
  { id: '5', concept: 'Memetic Drift', type: 'BRIDGE', dimension: 'CULTURAL', definition: 'The gradual mutation of ideas as they cross linguistic borders.' },
];

export const WordMapperView: React.FC = () => {
  const [seeds, setSeeds] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isMapping, setIsMapping] = useState(false);
  const [results, setResults] = useState<SemanticNode[] | null>(null);
  
  // Dimensional Filters State
  const [activeDimensions, setActiveDimensions] = useState<Set<string>>(new Set(['TEMPORAL', 'CULTURAL', 'EMOTIONAL', 'SENSORY', 'METAPHORICAL', 'PARADOX']));

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

  const handleTriangulate = () => {
    setIsMapping(true);
    // Simulate API delay
    setTimeout(() => {
      setIsMapping(false);
      setResults(MOCK_NODES);
    }, 1500);
  };

  const removeSeed = (idx: number) => {
    setSeeds(seeds.filter((_, i) => i !== idx));
  };

  const getDimensionColor = (dim: string) => {
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

  const getDimensionIcon = (dim: string) => {
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

  return (
    <div className="flex h-screen bg-void text-zinc-100 overflow-hidden">
      
      {/* LEFT PANEL: Controls & Input */}
      <div className="w-80 border-r border-zinc-900 bg-zinc-950/50 flex flex-col z-10 backdrop-blur-sm">
        <div className="p-6 border-b border-zinc-900">
           <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
             <GitGraph className="w-6 h-6 text-sovereign" />
             Word Mapper
           </h2>
           <p className="text-xs text-zinc-500 font-mono">Semantic Triangulation System</p>
        </div>

        {/* Seed Input */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
           <div>
             <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 block">Semantic Seeds (Max 5)</label>
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
                    <span className="text-sm font-mono text-zinc-300">{seed}</span>
                    <button onClick={() => removeSeed(idx)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
                           ? getDimensionColor(dim) 
                           : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                       }`}
                     >
                       {getDimensionIcon(dim)}
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
             <span>{isMapping ? 'TRIANGULATING...' : 'MAP CONSTELLATION'}</span>
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
                 Input seed concepts to triangulate hidden connections, metaphors, and paradoxes within the linguistic lattice.
               </p>
            </div>
         )}

         {/* Results Grid (Mock Graph) */}
         {results && (
           <div className="flex-1 p-8 z-10 animate-fade-in-up">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                    Emergent Constellation
                 </h2>
                 <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded hover:border-sovereign/50 transition-colors text-xs font-mono text-zinc-300">
                       <Zap className="w-4 h-4 text-sovereign" />
                       <span>FORGE AGENT</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded hover:border-sovereign/50 transition-colors text-xs font-mono text-zinc-300">
                       <Share2 className="w-4 h-4 text-purple-400" />
                       <span>EXPORT CAPSULE</span>
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {results.filter(n => activeDimensions.has(n.dimension)).map((node) => (
                    <div key={node.id} className="group relative bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-900/80 transition-all hover:-translate-y-1 hover:shadow-2xl">
                       <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${getDimensionColor(node.dimension).split(' ')[0].replace('text', 'bg')}`}></div>
                       
                       <div className="flex justify-between items-start mb-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getDimensionColor(node.dimension)} flex items-center gap-1`}>
                             {getDimensionIcon(node.dimension)}
                             {node.dimension}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono uppercase">{node.type}</span>
                       </div>

                       <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sovereign transition-colors">
                          {node.concept}
                       </h3>
                       <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                          {node.definition}
                       </p>

                       <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                          <span className="text-xs text-zinc-600 font-mono">Confidence: 94%</span>
                          <button className="text-zinc-500 hover:text-white transition-colors">
                             <ArrowRight className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
