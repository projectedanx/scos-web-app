
import React, { useState, useEffect, useMemo } from 'react';
import { ContextCapsule } from '../types';
import { compileCapsuleHtml } from '../services/capsuleCompiler';
import { Cloud, Search, LayoutGrid, Shuffle, ArrowRight, BoxSelect } from 'lucide-react';

interface PublicGatewayViewProps {
  capsules: ContextCapsule[];
  onLogin: () => void;
}

/**
 * The PublicGatewayView function.
 * @param { capsules, onLogin } - The { capsules, onLogin } parameter.
 * @returns The resulting value.
 */
export const PublicGatewayView: React.FC<PublicGatewayViewProps> = ({ capsules, onLogin }) => {
  const [currentCapsule, setCurrentCapsule] = useState<ContextCapsule | null>(null);
  const [mode, setMode] = useState<'VIEWER' | 'INDEX'>('VIEWER');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Random Load
  useEffect(() => {
    if (capsules.length > 0 && !currentCapsule) {
      loadRandom();
    }
  }, [capsules]);

  const loadRandom = () => {
    if (capsules.length === 0) return;
    const random = capsules[Math.floor(Math.random() * capsules.length)];
    setCurrentCapsule(random);
    setMode('VIEWER');
  };

  const filteredCapsules = useMemo(() => {
    return capsules.filter(c => 
      c.meta.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.meta.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [capsules, searchQuery]);

  // Generate Blob URL for Iframe
  const srcDoc = useMemo(() => {
    if (!currentCapsule) return '';
    return compileCapsuleHtml(currentCapsule);
  }, [currentCapsule]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={loadRandom}
              className="text-lg font-semibold hover:text-emerald-400 transition-colors flex items-center gap-2"
            >
              <span>context.locker</span>
            </button>
            <span className="hidden md:inline-flex text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              public gateway
            </span>
          </div>

          <nav className="flex items-center gap-3">
            <button 
              onClick={loadRandom}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Random</span>
            </button>
            <button 
              onClick={() => setMode('INDEX')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${mode === 'INDEX' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">All Capsules</span>
            </button>
            
            <div className="h-4 w-px bg-slate-800 mx-2"></div>

            <button 
              onClick={onLogin}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all hover:scale-105"
            >
              <Cloud className="w-4 h-4" />
              <span>Connect Identity</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 flex flex-col">
        
        {capsules.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <BoxSelect className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-xl font-bold text-slate-400">Gateway Empty</h2>
              <p className="max-w-md text-center mt-2 mb-8">
                No Knowledge Capsules have been distilled yet. 
                Connect your Identity to enter the Forge and begin construction.
              </p>
              <button 
                onClick={onLogin}
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                Launch Sovereign Forge
              </button>
           </div>
        ) : (
          <>
            {mode === 'VIEWER' && currentCapsule && (
              <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-500">
                 <iframe 
                    title={currentCapsule.meta.title}
                    srcDoc={srcDoc}
                    className="w-full h-full min-h-[80vh] border-0"
                    sandbox="allow-scripts allow-same-origin" 
                 />
              </div>
            )}

            {mode === 'INDEX' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h1 className="text-2xl font-bold text-white">All Capsules</h1>
                       <p className="text-slate-400 text-sm mt-1">Public knowledge artifacts available in this node.</p>
                    </div>
                    <div className="relative w-full max-w-md">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                       <input 
                          type="text" 
                          placeholder="Search titles, tags, concepts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-emerald-500/50 outline-none transition-colors"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCapsules.map(c => (
                       <button 
                          key={c.meta.id}
                          onClick={() => { setCurrentCapsule(c); setMode('VIEWER'); }}
                          className="text-left bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all group flex flex-col h-full"
                       >
                          <div className="flex justify-between items-start w-full mb-3">
                             <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-emerald-400 transition-colors">{c.meta.title}</h3>
                             <span className="text-[10px] px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-slate-500 uppercase font-bold">
                                {c.meta.status}
                             </span>
                          </div>
                          <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-grow">
                             {c.meta.short_tagline}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-800/50">
                             {c.meta.tags.slice(0, 3).map(t => (
                                <span key={t} className="text-xs px-2 py-1 rounded-full bg-slate-950 text-slate-500 border border-slate-800">
                                   #{t}
                                </span>
                             ))}
                             {c.meta.tags.length > 3 && <span className="text-xs text-slate-600 px-1">+{c.meta.tags.length - 3}</span>}
                          </div>
                       </button>
                    ))}
                 </div>
                 
                 {filteredCapsules.length === 0 && (
                    <div className="text-center py-20 text-slate-600">
                       No capsules found matching "{searchQuery}".
                    </div>
                 )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-900 py-8 text-center">
         <p className="text-slate-500 text-xs font-mono">
            CONTEXT.LOCKER // PUBLIC GATEWAY // v2.0
         </p>
      </footer>
    </div>
  );
};
