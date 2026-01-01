import React, { useState, useEffect } from 'react';
import { Database, Loader2, AlertTriangle, Search, FileText, MessageSquare, History, ChevronLeft, ChevronRight, Clock, RotateCcw, Trash2, Sparkles, GitCommit, Archive, Save, Globe, Check, ShieldCheck, Cpu, Network } from 'lucide-react';
import { fabricateAgent, analyzeDocument, researchTopic } from '../services/geminiService';
import { hashContent, signData, CommanderKeyPair } from '../services/cryptoService';
import { ManifestDisplay } from '../components/ManifestDisplay';
import { ChatInterface } from '../components/ChatInterface';
import { FabricationStatus, SovereignAgentManifest, ScarEntry, ManifestVersion, ProvenanceIndexEntry } from '../types';

interface AgentForgeViewProps {
  commanderKeys: CommanderKeyPair | null;
  onAddToVault: (manifest: SovereignAgentManifest, indexEntry?: ProvenanceIndexEntry) => void;
  restoredAgent: SovereignAgentManifest | null;
  onAgentRestored: () => void;
}

const STORAGE_KEY = 'sovereign_forge_history';

export const AgentForgeView: React.FC<AgentForgeViewProps> = ({ 
  commanderKeys, 
  onAddToVault, 
  restoredAgent, 
  onAgentRestored 
}) => {
  const [status, setStatus] = useState<FabricationStatus>(FabricationStatus.IDLE);
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState<'URL' | 'TEXT' | 'SEARCH'>('TEXT');
  const [isSigning, setIsSigning] = useState(false);
  
  // Initialize versions from localStorage
  const [versions, setVersions] = useState<ManifestVersion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load forge history", e);
      return [];
    }
  });

  // Initialize index based on stored history
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? parsed.length - 1 : -1;
    } catch {
      return -1;
    }
  });
  
  const [scars, setScars] = useState<ScarEntry[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  // Persist history changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
  }, [versions]);

  // Keyboard Navigation for History
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === FabricationStatus.MANIFESTED && !isChatting) {
        if (e.key === 'ArrowLeft') {
          setCurrentVersionIndex(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight') {
          setCurrentVersionIndex(prev => Math.min(versions.length - 1, prev + 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, isChatting, versions.length]);

  // Handle agent restoration from Vault
  useEffect(() => {
    if (restoredAgent) {
      const restoredVersion: ManifestVersion = {
        id: crypto.randomUUID(),
        manifest: restoredAgent,
        timestamp: Date.now(),
        inputContext: "Restored from Vault",
        label: "RESTORED",
        sourceType: 'RESTORED'
      };
      
      setVersions(prev => [...prev, restoredVersion]);
      setCurrentVersionIndex(prev => prev + 1);
      setStatus(FabricationStatus.MANIFESTED);
      onAgentRestored(); // Clear the prop in parent
    }
  }, [restoredAgent, onAgentRestored]);

  const handleFabricate = async () => {
    if (!inputValue.trim()) return;

    // --- Input Validation Layer ---
    if (inputType === 'URL') {
      try {
        new URL(inputValue);
      } catch (e) {
        const newScar: ScarEntry = {
          timestamp: Date.now(),
          code: 'ERR_MALFORMED_VECTOR',
          message: 'Invalid URL. Protocol required.',
          context: inputType
        };
        setScars(prev => [newScar, ...prev]);
        setStatus(FabricationStatus.FAILED);
        return;
      }
    } else if (inputType === 'TEXT') {
      const MIN_LENGTH = 50;
      if (inputValue.trim().length < MIN_LENGTH) {
        const newScar: ScarEntry = {
          timestamp: Date.now(),
          code: 'ERR_INSUFFICIENT_MATTER',
          message: `Input too sparse (${inputValue.trim().length} chars).`,
          context: inputType
        };
        setScars(prev => [newScar, ...prev]);
        setStatus(FabricationStatus.FAILED);
        return;
      }
    }

    setStatus(FabricationStatus.INGESTING);
    setIsSigning(false);
    
    try {
      // 1. Provenance Pre-Processing
      let sourceId = '';
      if (inputType === 'URL') {
        sourceId = inputValue;
      } else if (inputType === 'SEARCH') {
        sourceId = `SEARCH_TOPIC:${inputValue}`;
      } else {
        sourceId = `SHA-256:${await hashContent(inputValue)}`;
      }

      // 2. Context Preparation (The Loop)
      let fabricationContext = inputValue;
      let useSearchInFabrication = inputType === 'URL';

      if (inputType === 'SEARCH') {
         setStatus(FabricationStatus.RESEARCHING);
         // Perform the Search RAG Loop
         fabricationContext = await researchTopic(inputValue);
         // We turn off search for the final fabrication because the context is already rich
         useSearchInFabrication = false; 
      }

      setStatus(FabricationStatus.DISTILLING);

      // 3. Fabrication
      const analysisPromise = inputType === 'TEXT' ? analyzeDocument(inputValue) : Promise.resolve(null);
      const manifestPromise = fabricateAgent(fabricationContext, useSearchInFabrication);

      const [analysisResult, baseManifest] = await Promise.all([analysisPromise, manifestPromise]);
      
      // 4. Construct Provenance
      const timestamp = Date.now();
      const manifestWithProvenance: SovereignAgentManifest = {
        ...baseManifest,
        provenance: {
          details: {
            origin: inputType === 'URL' ? 'URL' : inputType === 'SEARCH' ? 'RESEARCH_TOPIC' : 'RAW_DOCUMENT',
            source: sourceId,
            ingestedAt: timestamp,
            inputSize: fabricationContext.length
          }
        }
      };

      // 5. Signing
      setIsSigning(true);
      
      // Artificial delay for visual effect of the signing step
      await new Promise(resolve => setTimeout(resolve, 800));

      if (commanderKeys) {
         const signatureHex = await signData(manifestWithProvenance, commanderKeys.privateKey);
         manifestWithProvenance.provenance!.signature = {
           signature: signatureHex,
           signerPublicKey: JSON.stringify(commanderKeys.publicKey),
           algorithm: "ECDSA-P256-SHA256",
           signedAt: Date.now()
         };
      }

      // 6. Indexing (If Raw Document)
      let indexEntry: ProvenanceIndexEntry | undefined;
      if (inputType === 'TEXT' && analysisResult) {
        indexEntry = {
          hash: sourceId.replace('SHA-256:', ''),
          agentName: baseManifest.identity.name,
          timestamp: timestamp,
          sourceType: 'RAW_DOCUMENT',
          snippet: inputValue.substring(0, 100),
          analysis: {
            wordCount: inputValue.trim().split(/\s+/).length,
            sentiment: analysisResult.sentiment,
            topics: analysisResult.topics
          }
        };
      } else if (inputType === 'SEARCH') {
         indexEntry = {
          hash: `search-${Date.now()}`,
          agentName: baseManifest.identity.name,
          timestamp: timestamp,
          sourceType: 'RESEARCH_TOPIC',
          snippet: `Topic: ${inputValue}`,
        };
      }

      // Update Local View State
      const isRefinement = versions.length > 0;
      const newVersion: ManifestVersion = {
        id: crypto.randomUUID(),
        manifest: manifestWithProvenance,
        timestamp: Date.now(),
        inputContext: inputValue, // Keep original input (the topic or url)
        label: `v${versions.length + 1}`,
        sourceType: isRefinement ? 'REFINED' : 'FABRICATED'
      };

      setVersions(prev => {
        const next = [...prev, newVersion];
        setCurrentVersionIndex(next.length - 1);
        return next;
      });
      
      setStatus(FabricationStatus.MANIFESTED);
      setIsSigning(false);

      // Update Global App State
      onAddToVault(manifestWithProvenance, indexEntry);

    } catch (error: any) {
      console.error(error);
      const rawMessage = error instanceof Error ? error.message : String(error);
      const newScar: ScarEntry = {
        timestamp: Date.now(),
        code: 'ERR_FABRICATION_ABORTED',
        message: rawMessage,
        context: inputType
      };
      setScars(prev => [newScar, ...prev]);
      setStatus(FabricationStatus.FAILED);
      setIsSigning(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Purge active workspace?')) {
      setVersions([]);
      setCurrentVersionIndex(-1);
      setStatus(FabricationStatus.IDLE);
      setInputValue('');
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const currentManifest = versions[currentVersionIndex]?.manifest;
  const currentVersion = versions[currentVersionIndex];

  const isLoading = status === FabricationStatus.INGESTING || status === FabricationStatus.DISTILLING || status === FabricationStatus.RESEARCHING;

  // --- Checklist Render Logic ---
  const renderChecklistItem = (label: string, active: boolean, completed: boolean, icon: React.ElementType) => {
    const Icon = icon;
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-500 ${
        completed ? 'bg-sovereign/5 border-sovereign/20' : 
        active ? 'bg-zinc-800 border-zinc-700 shadow-lg' : 
        'bg-zinc-900/20 border-zinc-800/50 opacity-50'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-1.5 rounded-full ${
            completed ? 'bg-sovereign/20 text-sovereign' :
            active ? 'bg-zinc-700 text-white animate-pulse' :
            'bg-zinc-800 text-zinc-500'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className={`text-sm font-mono ${completed || active ? 'text-zinc-200' : 'text-zinc-500'}`}>
            {label}
          </span>
        </div>
        {completed ? (
          <Check className="w-4 h-4 text-sovereign" />
        ) : active ? (
          <Loader2 className="w-4 h-4 text-sovereign animate-spin" />
        ) : (
          <div className="w-4 h-4" />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
        {(status === FabricationStatus.IDLE || status === FabricationStatus.FAILED || isLoading) && !isChatting && (
          <div className="max-w-2xl mx-auto mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Initialize Cognitive Construction</h2>
              <p className="text-zinc-400">
                Ingest documentation to construct a unique Sovereign Identity.
                Provide raw context, a target vector (URL), or a research topic.
              </p>
            </div>

            <div className="flex justify-center mb-6 space-x-2">
              <button 
                onClick={() => setInputType('TEXT')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                  inputType === 'TEXT' 
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-lg shadow-black/50' 
                    : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-semibold">Raw Documentation</span>
              </button>
              <button 
                 onClick={() => setInputType('URL')}
                 className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                  inputType === 'URL' 
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-lg shadow-black/50' 
                    : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Search className="w-4 h-4" />
                <span className="text-sm font-semibold">URL / Library Name</span>
              </button>
              <button 
                 onClick={() => setInputType('SEARCH')}
                 className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                  inputType === 'SEARCH' 
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-lg shadow-black/50' 
                    : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-semibold">Topic Research</span>
              </button>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sovereign to-cognitive rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-void-light rounded-xl border border-zinc-800 p-2">
                {inputType === 'TEXT' ? (
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Paste documentation content, API reference, or markdown here..."
                    className="w-full bg-transparent text-sm font-mono text-zinc-300 p-4 min-h-[200px] outline-none resize-y placeholder:text-zinc-700"
                  />
                ) : (
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      inputType === 'URL' 
                        ? "e.g., https://api.example.com/docs or 'React Query Documentation'"
                        : "e.g., 'Rust Async Runtime' or 'Stripe Connect Patterns'"
                    }
                    className="w-full bg-transparent text-sm font-mono text-zinc-300 p-4 outline-none placeholder:text-zinc-700"
                  />
                )}
                
                <div className="flex justify-between items-center px-4 py-3 border-t border-zinc-800 bg-black/20">
                  <span className="text-xs text-zinc-600 font-mono uppercase">
                    {inputType === 'TEXT' ? `${inputValue.length} characters` : inputType === 'URL' ? 'Search vector active' : 'Research Agent Ready'}
                  </span>
                  
                  <div className="flex space-x-3">
                    <button
                      disabled={isLoading || !inputValue}
                      onClick={() => setIsChatting(true)}
                      className="flex items-center space-x-2 bg-transparent hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-lg font-bold text-sm transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>DISCUSS AGENT</span>
                    </button>

                    <button
                      disabled={isLoading || !inputValue}
                      onClick={handleFabricate}
                      className="flex items-center space-x-2 bg-zinc-100 hover:bg-white text-black px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-white/5"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>
                            {status === FabricationStatus.RESEARCHING ? 'RESEARCHING...' : 'DISTILLING...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          <span>FABRICATE AGENT</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Fabrication Checklist */}
            {isLoading && (
              <div className="mt-8 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 px-2">
                 {renderChecklistItem(
                   'Context Ingestion & Analysis', 
                   status === FabricationStatus.INGESTING, 
                   status === FabricationStatus.RESEARCHING || status === FabricationStatus.DISTILLING,
                   Network
                 )}
                 
                 {inputType === 'SEARCH' && renderChecklistItem(
                   'Deep Research Loop', 
                   status === FabricationStatus.RESEARCHING, 
                   status === FabricationStatus.DISTILLING,
                   Globe
                 )}

                 {renderChecklistItem(
                   'Cognitive Distillation (Identity/Tools)', 
                   status === FabricationStatus.DISTILLING && !isSigning, 
                   isSigning,
                   Cpu
                 )}

                 {renderChecklistItem(
                   'Cryptographic Attestation', 
                   isSigning, 
                   false,
                   ShieldCheck
                 )}
              </div>
            )}
            
            {status === FabricationStatus.FAILED && (
              <div className="mt-4 p-4 bg-red-900/10 border border-red-900/30 rounded text-red-400 text-sm flex items-start space-x-3 animate-pulse">
                 <AlertTriangle className="w-5 h-5 shrink-0" />
                 <div>
                   <p className="font-bold uppercase tracking-tight">{scars[0]?.code || 'FABRICATION_FAILURE'}</p>
                   <p className="opacity-80 mt-1">{scars[0]?.message}</p>
                 </div>
              </div>
            )}

            {versions.length > 0 && (status === FabricationStatus.IDLE || status === FabricationStatus.FAILED) && (
               <div className="flex justify-center mt-6 animate-in fade-in duration-500">
                  <button 
                    onClick={() => {
                       setStatus(FabricationStatus.MANIFESTED);
                       setInputValue(versions[versions.length-1].inputContext || '');
                    }}
                    className="flex items-center space-x-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-5 py-2 rounded-lg border border-zinc-800 hover:border-sovereign/30 transition-all shadow-lg shadow-black/50"
                  >
                    <History className="w-4 h-4" />
                    <span className="text-sm font-mono font-bold">RESTORE AUTOSAVED SESSION ({versions.length})</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-sovereign animate-pulse"></div>
                  </button>
               </div>
            )}
          </div>
        )}

        {isChatting && (
          <div className="animate-fade-in-up">
            <ChatInterface 
              context={inputValue} 
              useSearch={inputType === 'URL'} 
              onBack={() => setIsChatting(false)} 
            />
          </div>
        )}

        {status === FabricationStatus.MANIFESTED && currentManifest && !isChatting && (
          <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-center border-b border-zinc-800 pb-4 mb-4 gap-4">
                <div className="flex items-center space-x-4">
                   <h2 className="text-2xl font-bold text-white">Manifested Identity</h2>
                   {versions.length > 1 && (
                     <div className="flex items-center space-x-2 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
                        <button
                          onClick={() => setCurrentVersionIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentVersionIndex === 0}
                          className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 text-zinc-300"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <div className="px-3 min-w-[120px] text-center flex items-center justify-center space-x-2">
                           {currentVersion.sourceType === 'RESTORED' && <Archive className="w-3 h-3 text-purple-400" />}
                           {currentVersion.sourceType === 'FABRICATED' && <Sparkles className="w-3 h-3 text-sovereign" />}
                           {currentVersion.sourceType === 'REFINED' && <GitCommit className="w-3 h-3 text-cognitive" />}
                           
                           <span className={`text-xs font-mono font-bold ${
                             currentVersion.sourceType === 'RESTORED' ? 'text-purple-400' :
                             currentVersion.sourceType === 'REFINED' ? 'text-cognitive' : 'text-sovereign'
                           }`}>
                             {currentVersion.label}
                           </span>
                        </div>
                        
                        <button
                          onClick={() => setCurrentVersionIndex(prev => Math.min(versions.length - 1, prev + 1))}
                          disabled={currentVersionIndex === versions.length - 1}
                          className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 text-zinc-300"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                   )}
                </div>

                <div className="flex items-center space-x-4">
                   {currentVersion && (
                     <div className="flex items-center space-x-2 text-xs text-zinc-500 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(currentVersion.timestamp).toLocaleTimeString()}</span>
                     </div>
                   )}
                   <div className="h-4 w-px bg-zinc-800 mx-2 hidden md:block"></div>
                   <button 
                     onClick={() => {
                       setStatus(FabricationStatus.IDLE);
                       setInputValue(currentVersion?.inputContext || '');
                     }}
                     className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-sovereign transition-colors"
                   >
                     <RotateCcw className="w-4 h-4" />
                     <span className="font-mono text-xs uppercase">Refine Context</span>
                   </button>
                   <button 
                     onClick={handleClearHistory}
                     className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                     title="Purge Active Workspace & History"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>
             <ManifestDisplay manifest={currentManifest} />
          </div>
        )}

        {scars.length > 0 && !isChatting && (
          <div className="mt-24 border-t border-zinc-900 pt-8">
            <h3 className="text-xs font-mono text-zinc-600 uppercase mb-4 tracking-widest">Chronicle of System Fractures</h3>
            <div className="font-mono text-xs text-zinc-500 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {scars.map((scar, idx) => (
                <div key={idx} className="flex space-x-4 py-1 hover:bg-zinc-900/30 px-2 rounded">
                  <span className="text-zinc-800">{new Date(scar.timestamp).toLocaleTimeString()}</span>
                  <span className="text-immune font-bold min-w-[120px]">{scar.code}</span>
                  <span className="flex-1 italic">{scar.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};