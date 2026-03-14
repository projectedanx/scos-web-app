
import React, { useState, useEffect } from 'react';
import { X, Code, FileJson, Copy, Check, Download, Layers, AlertTriangle } from 'lucide-react';
import { SovereignAgentManifest } from '../types';
import { transformToConductor, generatePythonStubs, generateSkillReadme, validateConductorSchema } from '../services/conductorService';

interface ConductorExportModalProps {
  agent: SovereignAgentManifest;
  onClose: () => void;
}

type Tab = 'MANIFEST' | 'PYTHON' | 'README';

export const ConductorExportModal: React.FC<ConductorExportModalProps> = ({ agent, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('MANIFEST');
  const [copied, setCopied] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });

  useEffect(() => {
    setValidation(validateConductorSchema(agent));
  }, [agent]);

  const artifacts = React.useMemo(() => ({
    MANIFEST: {
      filename: 'manifest.json',
      content: JSON.stringify(transformToConductor(agent), null, 2),
      lang: 'json'
    },
    PYTHON: {
      filename: 'agent_node.py',
      content: generatePythonStubs(agent),
      lang: 'python'
    },
    README: {
      filename: 'README.md',
      content: generateSkillReadme(agent),
      lang: 'markdown'
    }
  }), [agent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(artifacts[activeTab].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const { content, filename, lang } = artifacts[activeTab];
    const blob = new Blob([content], { type: lang === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.identity.name.toLowerCase().replace(/\s+/g, '_')}_${filename}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20 text-blue-400">
                <Layers className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-sm font-bold text-white">Conductor / Swarm Export</h3>
                <p className="text-xs text-zinc-500 font-mono">Generate Execution Artifacts</p>
             </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
             <X className="w-5 h-5" />
          </button>
        </div>

        {!validation.valid && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-500 mb-1">Schema Validation Warnings</h4>
                <ul className="text-xs text-amber-400/80 list-disc pl-4 space-y-1">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-black/20 px-4">
           {(['MANIFEST', 'PYTHON', 'README'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition-colors ${
                   activeTab === tab 
                     ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                     : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                 {tab === 'MANIFEST' && <span className="flex items-center gap-2"><FileJson className="w-3 h-3" /> MANIFEST.JSON</span>}
                 {tab === 'PYTHON' && <span className="flex items-center gap-2"><Code className="w-3 h-3" /> AGENT_NODE.PY</span>}
                 {tab === 'README' && <span className="flex items-center gap-2"><FileJson className="w-3 h-3" /> README.MD</span>}
              </button>
           ))}
        </div>

        {/* Code View */}
        <div className="flex-1 overflow-hidden bg-zinc-950 relative group">
           <pre className="h-full overflow-auto p-6 text-xs font-mono text-zinc-300 custom-scrollbar">
              {artifacts[activeTab].content}
           </pre>
           
           <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                 onClick={handleCopy}
                 className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded border border-zinc-700 transition-colors shadow-lg"
              >
                 {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                 <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
           <div className="text-xs text-zinc-500 font-mono">
              Target: <span className="text-zinc-300">scos-core</span> / <span className="text-zinc-300">Gemini Conductor</span>
           </div>
           <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded shadow-lg shadow-blue-900/20 transition-all"
           >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD {artifacts[activeTab].filename.toUpperCase()}</span>
           </button>
        </div>
      </div>
    </div>
  );
};
