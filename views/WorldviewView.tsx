import React, { useState, useEffect } from 'react';
import { SovereignVault } from '../types.js';
import { generateJur } from '../services/jurService.js';
import { Eye, ShieldAlert, Sparkles, Network } from 'lucide-react';

interface WorldviewViewProps {
  vault: SovereignVault;
}

export const WorldviewView: React.FC<WorldviewViewProps> = ({ vault }) => {
  const [jurContent, setJurContent] = useState<string>('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    const synthesize = async () => {
      setIsSynthesizing(true);
      try {
        const result = await generateJur(vault);
        setJurContent(result);
      } catch (err) {
        setJurContent("[⊘] Error triangulating Epistemic Matrix.");
      } finally {
        setIsSynthesizing(false);
      }
    };
    synthesize();
  }, [vault]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto px-6 py-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-indigo-500/10 rounded border border-indigo-500/20 text-indigo-400">
              <Network className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Sovereign Worldview</h2>
              <p className="text-xs text-zinc-500 font-mono">Justified Uncertainty Report (JUR)</p>
           </div>
        </div>
      </div>

      <div className="flex-1 bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden flex flex-col relative p-6">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="mb-4 text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
           <Eye className="w-4 h-4 text-indigo-400" />
           Epistemic Topology Map
        </div>

        {isSynthesizing ? (
          <div className="flex flex-col items-center justify-center h-full text-indigo-500/50">
             <Sparkles className="w-8 h-8 animate-spin mb-4" />
             <p className="font-mono text-xs">Computing Geometric Density Score (GDS)...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm text-zinc-300 leading-relaxed z-10">
            {jurContent.split('\n').map((line, idx) => {
              // Apply syntax highlighting for our epistemic markers
              if (line.includes('[OMISSION:')) {
                return <div key={idx} className="text-yellow-500 mb-2 pl-4 border-l-2 border-yellow-500/50 bg-yellow-500/5 py-1 flex items-start gap-2"><ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" /> {line}</div>;
              }
              if (line.includes('[Φ]')) {
                return <div key={idx} className="text-sovereign font-bold mb-2 pl-4 border-l-2 border-sovereign/50 bg-sovereign/5 py-1">{line}</div>;
              }
              if (line.includes('[∇]')) {
                return <div key={idx} className="text-indigo-400 mb-2 pl-4 border-l-2 border-indigo-400/50 py-1">{line}</div>;
              }
              if (line.includes('[⊘]')) {
                 return <div key={idx} className="text-red-500 mb-2 font-bold">{line}</div>;
              }
              if (line.startsWith('##')) {
                 return <h3 key={idx} className="text-white font-bold text-lg mt-6 mb-2">{line.replace('##', '').trim()}</h3>;
              }
              if (line.startsWith('#')) {
                 return <h2 key={idx} className="text-white font-bold text-xl mt-4 mb-4">{line.replace('#', '').trim()}</h2>;
              }
              return <div key={idx} className="mb-1">{line}</div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
};
