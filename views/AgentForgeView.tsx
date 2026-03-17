
import React, { useState, useEffect, useRef } from 'react';
import { Database, Loader2, AlertTriangle, Search, FileText, MessageSquare, History, ChevronLeft, ChevronRight, Clock, RotateCcw, Trash2, Sparkles, GitCommit, Archive, Save, Globe, Check, ShieldCheck, Cpu, Network, Upload, Bot, Zap, Users, Shield, Terminal, BookOpen, Crown, Palette, Download, RefreshCw, Plus, ShieldAlert, Feather } from 'lucide-react';
import { fabricateAgent, analyzeDocument, researchTopic, councilDiscovery, councilSynthesis, councilCritique, councilFinalize } from '../services/geminiService';
import { hashContent, signData, CommanderKeyPair } from '../services/cryptoService';
import { ManifestDisplay } from '../components/ManifestDisplay';
import { ChatInterface } from '../components/ChatInterface';
import { FabricationStatus, SovereignAgentManifest, ScarEntry, ManifestVersion, ProvenanceIndexEntry, TokenUsage, FabricationMode, CouncilMemberType, CouncilFeedback, CouncilSessionLog } from '../types';
import { useDialog } from '../contexts/DialogContext';
import { useToast } from '../contexts/ToastContext';

interface AgentForgeViewProps {
  commanderKeys: CommanderKeyPair | null;
  onAddToVault: (manifest: SovereignAgentManifest, indexEntry?: ProvenanceIndexEntry) => void;
  restoredAgent: SovereignAgentManifest | null;
  onAgentRestored: () => void;
}

const STORAGE_KEY = 'sovereign_forge_history';

/**
 * The AgentForgeView function.
 * @param {
 *   commanderKeys,
 *   onAddToVault,
 *   restoredAgent,
 *   onAgentRestored
 * } - The {
 *   commanderKeys,
 *   onAddToVault,
 *   restoredAgent,
 *   onAgentRestored
 * } parameter.
 * @returns The resulting value.
 */
export const AgentForgeView: React.FC<AgentForgeViewProps> = ({ 
  commanderKeys, 
  onAddToVault, 
  restoredAgent, 
  onAgentRestored 
}) => {
  // 1. Initialize History (Moved to top to allow derived status initialization)
  const [versions, setVersions] = useState<ManifestVersion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load forge history", e);
      return [];
    }
  });

  // Initialize index based on versions state
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(() => {
    return versions.length > 0 ? versions.length - 1 : -1;
  });

  // 2. Initialize Status based on whether we have history
  const [status, setStatus] = useState<FabricationStatus>(() => {
    return versions.length > 0 ? FabricationStatus.MANIFESTED : FabricationStatus.IDLE;
  });

  const [mode, setMode] = useState<FabricationMode>(FabricationMode.STANDARD);
  
  const [inputValue, setInputValue] = useState('');
  const [agentName, setAgentName] = useState('');
  const [inputType, setInputType] = useState<'URL' | 'TEXT' | 'SEARCH'>('TEXT');
  const [isSigning, setIsSigning] = useState(false);
  
  // Council State
  const [councilLog, setCouncilLog] = useState<CouncilSessionLog | null>(null);
  const [councilStep, setCouncilStep] = useState<'IDLE' | 'DISCOVERY' | 'SYNTHESIS' | 'CRITIQUE' | 'FINALIZATION'>('IDLE');
  
  const { confirm } = useDialog();
  const { addToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const councilConsoleRef = useRef<HTMLDivElement>(null);
  
  const [scars, setScars] = useState<ScarEntry[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  // Persist history changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
  }, [versions]);

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
      setAgentName(restoredAgent.identity.name);
      onAgentRestored(); // Clear the prop in parent
    }
  }, [restoredAgent, onAgentRestored]);

  // Auto-scroll console
  useEffect(() => {
    if (councilConsoleRef.current) {
        councilConsoleRef.current.scrollTop = councilConsoleRef.current.scrollHeight;
    }
  }, [councilLog, councilStep]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputValue(text);
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFabricate = async () => {
    if (!inputValue.trim()) return;

    // --- Input Validation Layer ---
    if (inputType === 'URL') {
      try {
        new URL(inputValue);
      } catch (e) {
        setScars(prev => [{ timestamp: Date.now(), code: 'ERR_MALFORMED_VECTOR', message: 'Invalid URL.', context: inputValue }, ...prev]);
        return;
      }
    }

    if (mode === FabricationMode.COUNCIL) {
       await runCouncilProcess();
    } else {
       await runStandardProcess();
    }
  };

  const runStandardProcess = async () => {
    setStatus(FabricationStatus.INGESTING);
    setIsSigning(false);
    
    let localScars: ScarEntry[] = [];
    const handleScar = (scar: ScarEntry) => {
      localScars.push(scar);
      setScars(prev => [scar, ...prev]);
    };

    try {
      let sourceId = inputType === 'URL' ? inputValue : inputType === 'SEARCH' ? `SEARCH_TOPIC:${inputValue}` : `SHA-256:${await hashContent(inputValue)}`;
      let fabricationContext = inputValue;
      let useSearchInFabrication = inputType === 'URL';
      let accumulatedUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      if (inputType === 'SEARCH') {
         setStatus(FabricationStatus.RESEARCHING);
         const researchResult = await researchTopic(inputValue);
         fabricationContext = researchResult.data;
         accumulatedUsage = researchResult.usage;
         useSearchInFabrication = false; 
      }

      setStatus(FabricationStatus.DISTILLING);

      const analysisPromise = inputType === 'TEXT' ? analyzeDocument(inputValue) : Promise.resolve({ data: null, usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }});
      const manifestPromise = fabricateAgent(fabricationContext, useSearchInFabrication, agentName, handleScar);

      const [analysisResult, manifestResult] = await Promise.all([analysisPromise, manifestPromise]);
      const baseManifest = manifestResult.data;
      
      // Sum usage
      accumulatedUsage.promptTokens += (analysisResult.usage.promptTokens + manifestResult.usage.promptTokens);
      accumulatedUsage.completionTokens += (analysisResult.usage.completionTokens + manifestResult.usage.completionTokens);
      accumulatedUsage.totalTokens += (analysisResult.usage.totalTokens + manifestResult.usage.totalTokens);
      
      await finalizeAndStore(baseManifest, sourceId, fabricationContext, accumulatedUsage, analysisResult.data, undefined, localScars);

    } catch (error: any) {
      handleError(error);
    }
  };

  const runCouncilProcess = async () => {
    setStatus(FabricationStatus.COUNCIL_DELIBERATING);
    let accumulatedUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    
    let localScars: ScarEntry[] = [];
    const handleScar = (scar: ScarEntry) => {
      localScars.push(scar);
      setScars(prev => [scar, ...prev]);
    };

    let sourceId = inputType === 'URL' ? inputValue : inputType === 'SEARCH' ? `SEARCH_TOPIC:${inputValue}` : `SHA-256:${await hashContent(inputValue)}`;
    
    // Initialize Local Session Log (Critical for ensuring data passes to finalizeAndStore)
    let currentSessionLog: CouncilSessionLog = {
      sessionId: crypto.randomUUID(),
      startedAt: Date.now(),
      discovery: [],
      critiques: []
    };
    
    // Sync UI State
    setCouncilLog(currentSessionLog);
    setCouncilStep('IDLE');

    try {
      // 1. DISCOVERY PHASE
      setCouncilStep('DISCOVERY');
      const members: CouncilMemberType[] = ['STRATEGIST', 'IMMUNOLOGIST', 'LINGUIST', 'ENGINEER', 'HISTORIAN'];
      
      const discoveryPromises = members.map(m => councilDiscovery(inputValue, m));
      const discoveryResults = await Promise.all(discoveryPromises);
      
      const discoveries = discoveryResults.map(r => r.data);
      discoveryResults.forEach(r => accumulatedUsage = sumUsage(accumulatedUsage, r.usage));
      
      // Update Log
      currentSessionLog.discovery = discoveries;
      setCouncilLog({ ...currentSessionLog });

      // 2. SYNTHESIS PHASE
      setCouncilStep('SYNTHESIS');
      const synthesisResult = await councilSynthesis(inputValue, discoveries, agentName, handleScar);
      accumulatedUsage = sumUsage(accumulatedUsage, synthesisResult.usage);
      const draftManifest = synthesisResult.data;
      
      // Update Log
      currentSessionLog.synthesis = JSON.stringify(draftManifest);
      setCouncilLog({ ...currentSessionLog });

      // 3. CRITIQUE PHASE
      setCouncilStep('CRITIQUE');
      const critiquePromises = members.map(m => councilCritique(draftManifest, m));
      const critiqueResults = await Promise.all(critiquePromises);
      
      const critiques = critiqueResults.map(r => r.data);
      critiqueResults.forEach(r => accumulatedUsage = sumUsage(accumulatedUsage, r.usage));
      
      // Update Log
      currentSessionLog.critiques = critiques;
      setCouncilLog({ ...currentSessionLog });

      // 4. FINALIZATION PHASE
      setCouncilStep('FINALIZATION');
      const finalResult = await councilFinalize(draftManifest, critiques, handleScar);
      accumulatedUsage = sumUsage(accumulatedUsage, finalResult.usage);
      const finalManifest = finalResult.data;

      // Analysis for Indexing
      const analysisResult = await analyzeDocument(inputValue);
      accumulatedUsage = sumUsage(accumulatedUsage, analysisResult.usage);

      // Pass the fully constructed local log to storage
      await finalizeAndStore(finalManifest, sourceId, inputValue, accumulatedUsage, analysisResult.data, currentSessionLog, localScars);

    } catch (error: any) {
      handleError(error);
    }
  };

  // Helper to sum usage locally
  const sumUsage = (u1: TokenUsage, u2: TokenUsage): TokenUsage => ({
    promptTokens: u1.promptTokens + u2.promptTokens,
    completionTokens: u1.completionTokens + u2.completionTokens,
    totalTokens: u1.totalTokens + u2.totalTokens
  });

  // Helper to determine member status text
  const getMemberStatus = (member: CouncilMemberType, step: string) => {
    if (member === 'STRATEGIST') {
        if (step === 'SYNTHESIS') return 'SYNTHESIZING';
        if (step === 'FINALIZATION') return 'FINALIZING';
        return 'CHAIRING';
    }
    // For specialists
    if (step === 'DISCOVERY') return 'DISCOVERING';
    if (step === 'CRITIQUE') return 'CRITIQUING';
    return 'OBSERVING';
  };

  const finalizeAndStore = async (
    baseManifest: Omit<SovereignAgentManifest, 'provenance'>, 
    sourceId: string, 
    fabricationContext: string, 
    usage: TokenUsage,
    analysisData: any,
    councilSession?: CouncilSessionLog,
    localScars: ScarEntry[] = []
  ) => {
      const timestamp = Date.now();
      
      // 1. Prepare Canonical Manifest (Clean Payload)
      // We purposefully EXCLUDE the councilLog from the object to be signed.
      // This ensures the signature represents the Identity, not the Fabrication History.
      const manifestPayload: SovereignAgentManifest = {
        ...baseManifest,
        symbolicScarRegistry: localScars.length > 0 ? localScars : undefined,
        provenance: {
          details: {
            origin: inputType === 'URL' ? 'URL' : inputType === 'SEARCH' ? 'RESEARCH_TOPIC' : 'RAW_DOCUMENT',
            source: sourceId,
            ingestedAt: timestamp,
            inputSize: fabricationContext.length
          }
          // Note: councilLog is NOT included here
        }
      };

      setIsSigning(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // Visual delay

      if (commanderKeys) {
         // Sign the CLEAN payload
         const signatureHex = await signData(manifestPayload as unknown as Record<string, unknown>, commanderKeys.privateKey);
         
         if (manifestPayload.provenance) {
             manifestPayload.provenance.signature = {
               signature: signatureHex,
               signerPublicKey: JSON.stringify(commanderKeys.publicKey),
               algorithm: "ECDSA-P256-SHA256",
               signedAt: Date.now()
             };
         }
      }

      // 2. Attach Council Log for Local Storage
      // We re-attach the log here so it can be viewed in the dashboard/forge,
      // but it is not part of the cryptographic envelope of the identity.
      const manifestForStorage: SovereignAgentManifest = {
          ...manifestPayload,
          provenance: {
              ...manifestPayload.provenance!,
              councilLog: councilSession
          }
      };

      // Indexing
      let indexEntry: ProvenanceIndexEntry | undefined;
      if (inputType !== 'SEARCH' && analysisData) {
        indexEntry = {
          hash: sourceId.replace('SHA-256:', ''),
          agentName: baseManifest.identity.name,
          timestamp: timestamp,
          sourceType: inputType === 'URL' ? 'URL' : 'RAW_DOCUMENT',
          snippet: inputValue.substring(0, 100),
          analysis: {
            wordCount: inputValue.trim().split(/\s+/).length,
            sentiment: analysisData.sentiment,
            topics: analysisData.topics
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

      const isRefinement = versions.length > 0;
      const newVersion: ManifestVersion = {
        id: crypto.randomUUID(),
        manifest: manifestForStorage,
        timestamp: Date.now(),
        inputContext: inputValue,
        label: `v${versions.length + 1}`,
        sourceType: isRefinement ? 'REFINED' : 'FABRICATED',
        usage: usage
      };

      setVersions(prev => {
        const next = [...prev, newVersion];
        setCurrentVersionIndex(next.length - 1);
        return next;
      });
      
      setStatus(FabricationStatus.MANIFESTED);
      setIsSigning(false);
      onAddToVault(manifestForStorage, indexEntry);
  };

  const handleError = (error: any) => {
      console.error(error);
      const rawMessage = error instanceof Error ? error.message : String(error);
      setScars(prev => [{
        timestamp: Date.now(),
        code: 'ERR_FABRICATION_ABORTED',
        message: rawMessage,
        context: `${inputType} :: ${inputValue.slice(0, 60)}...`
      }, ...prev]);
      setStatus(FabricationStatus.FAILED);
      setIsSigning(false);
  };

  const handleClearHistory = () => {
    confirm('Purge active workspace? This will reset the Forge to input mode.', async () => {
      setVersions([]);
      setCurrentVersionIndex(-1);
      setStatus(FabricationStatus.IDLE);
      setInputValue('');
      setAgentName('');
      setCouncilLog(null);
      localStorage.removeItem(STORAGE_KEY);
    });
  };

  // Safe reset for corrupted state
  const handleEmergencyReset = () => {
    setVersions([]);
    setCurrentVersionIndex(-1);
    setStatus(FabricationStatus.IDLE);
    setInputValue('');
    setCouncilLog(null);
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const handleDownloadCouncilLog = () => {
    const log = currentManifest?.provenance?.councilLog;
    if (!log) return;

    let md = `# Council Deliberation Log\n`;
    md += `> **Agent:** ${currentManifest.identity.name}\n`;
    md += `> **Session ID:** ${log.sessionId}\n`;
    md += `> **Date:** ${new Date(log.startedAt).toLocaleString()}\n\n`;
    md += `> **Input Context:**\n> ${currentVersion?.inputContext?.slice(0, 200).replace(/\n/g, ' ')}...\n\n`;

    md += `---\n\n`;

    md += `## 1. Discovery Phase\n`;
    md += `*Parallel analysis by independent specialists.*\n\n`;
    log.discovery.forEach(d => {
      md += `### 👤 ${d.member}\n${d.content}\n\n`;
    });

    md += `---\n\n`;

    if (log.synthesis) {
      md += `## 2. Synthesis (Draft Manifest)\n`;
      md += `*Planner aggregates discoveries into a cohesive identity.*\n\n`;
      md += `\`\`\`json\n${log.synthesis}\n\`\`\`\n\n`;
    }

    md += `---\n\n`;

    if (log.critiques && log.critiques.length > 0) {
      md += `## 3. Council Critique\n`;
      md += `*Specialists review the draft for drift, security risks, and alignment.*\n\n`;
      log.critiques.forEach(c => {
        md += `### 🛡️ ${c.member}\n${c.content}\n\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `council-log-${currentManifest.identity.name.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentManifest = versions[currentVersionIndex]?.manifest;
  const currentVersion = versions[currentVersionIndex];
  const isLoading = status !== FabricationStatus.IDLE && status !== FabricationStatus.MANIFESTED && status !== FabricationStatus.FAILED;

  // --- Council Visualization ---
  const CouncilMemberIcon = ({ type, isActive, status }: { type: CouncilMemberType, isActive: boolean, status: string }) => {
     let Icon = Users;
     let color = "text-zinc-500";
     
     switch(type) {
       case 'STRATEGIST': Icon = Network; color = isActive ? "text-blue-400" : "text-zinc-600"; break;
       case 'IMMUNOLOGIST': Icon = ShieldAlert; color = isActive ? "text-red-400" : "text-zinc-600"; break;
       case 'LINGUIST': Icon = Feather; color = isActive ? "text-emerald-400" : "text-zinc-600"; break;
       case 'ENGINEER': Icon = Cpu; color = isActive ? "text-amber-400" : "text-zinc-600"; break;
       case 'HISTORIAN': Icon = History; color = isActive ? "text-purple-400" : "text-zinc-600"; break;
     }

     return (
       <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-50'}`}>
          <div className={`p-3 rounded-full border bg-zinc-950 ${isActive ? `border-${color.split('-')[1]}-500/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]` : 'border-zinc-800'}`}>
             <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <span className={`text-[10px] font-mono font-bold uppercase ${isActive ? 'text-white' : 'text-zinc-600'}`}>{type}</span>
          <span className="text-[9px] text-zinc-500 font-mono">{status}</span>
       </div>
     );
  };

  // Check for corrupted state (Manifested but no manifest data)
  if (status === FabricationStatus.MANIFESTED && !currentManifest) {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
           <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
           <h2 className="text-2xl font-bold text-white mb-2">Manifest Render Failure</h2>
           <p className="text-zinc-400 max-w-md mb-8">
              The Forge encountered a corrupted state in the local workspace. 
              This typically happens when a Council session is interrupted or saves incomplete data.
           </p>
           <button 
             onClick={handleEmergencyReset}
             className="px-6 py-3 bg-red-900/50 hover:bg-red-800 border border-red-500/50 rounded-lg text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
           >
              <RefreshCw className="w-5 h-5" />
              RESET WORKSPACE
           </button>
        </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
        {(!currentManifest && !isChatting) && (
          <div className="max-w-3xl mx-auto mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4 text-white">Initialize Cognitive Construction</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Ingest documentation to construct a unique Sovereign Identity.
                Select your fabrication protocol below.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex justify-center mb-8">
               <div className="bg-zinc-900 p-1 rounded-lg border border-zinc-800 flex gap-1">
                  <button 
                    onClick={() => setMode(FabricationMode.STANDARD)}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${mode === FabricationMode.STANDARD ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                     Standard Forge
                  </button>
                  <button 
                    onClick={() => setMode(FabricationMode.COUNCIL)}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${mode === FabricationMode.COUNCIL ? 'bg-indigo-900/30 text-indigo-300 shadow border border-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                     <Users className="w-4 h-4" />
                     The Council
                  </button>
               </div>
            </div>

            <div className="relative group">
              <div className={`absolute -inset-0.5 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 ${mode === FabricationMode.COUNCIL ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : 'bg-gradient-to-r from-sovereign to-cognitive'}`}></div>
              <div className="relative bg-void-light rounded-xl border border-zinc-800 p-2">
                
                {/* Input Type Selectors */}
                <div className="flex gap-2 mb-2 px-2 pt-2">
                   {['TEXT', 'URL', 'SEARCH'].map(t => (
                      <button
                        key={t}
                        onClick={() => setInputType(t as any)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded transition-colors ${inputType === t ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                         {t === 'TEXT' ? 'RAW TEXT' : t === 'URL' ? 'URL VECTOR' : 'RESEARCH TOPIC'}
                      </button>
                   ))}
                </div>

                <div className="mb-2 relative group/name px-2">
                   <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg flex items-center px-3 py-2 focus-within:border-sovereign/50 transition-colors">
                      <Bot className="w-5 h-5 text-zinc-500 mr-3 shrink-0" />
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="Agent Designation (Optional)"
                        className="bg-transparent border-none outline-none text-white w-full font-mono text-sm placeholder:text-zinc-600"
                      />
                   </div>
                </div>

                {inputType === 'TEXT' ? (
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Paste context here..."
                    className="w-full bg-transparent text-sm font-mono text-zinc-300 p-4 min-h-[200px] outline-none resize-y placeholder:text-zinc-700"
                  />
                ) : (
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={inputType === 'URL' ? "https://..." : "e.g. 'Quantum Error Correction'"}
                    className="w-full bg-transparent text-sm font-mono text-zinc-300 p-4 outline-none placeholder:text-zinc-700"
                  />
                )}
                
                <div className="flex justify-between items-center px-4 py-3 border-t border-zinc-800 bg-black/20">
                  <div className="flex items-center space-x-4">
                     {inputType === 'TEXT' && (
                       <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 text-xs text-zinc-400 hover:text-white transition-colors">
                           <Upload className="w-3 h-3" />
                           <span>UPLOAD</span>
                       </button>
                     )}
                     <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      disabled={isLoading || !inputValue}
                      onClick={handleFabricate}
                      className={`flex items-center space-x-2 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${
                         mode === FabricationMode.COUNCIL 
                           ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20' 
                           : 'bg-zinc-100 hover:bg-white text-black shadow-white/5'
                      }`}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                      <span>{isLoading ? 'FABRICATING...' : mode === FabricationMode.COUNCIL ? 'CONVENE COUNCIL' : 'FABRICATE'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Visualization Area */}
            {isLoading && mode === FabricationMode.COUNCIL && (
               <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex justify-center gap-8 mb-8">
                     <CouncilMemberIcon type="STRATEGIST" isActive={true} status={getMemberStatus('STRATEGIST', councilStep)} />
                     <CouncilMemberIcon type="IMMUNOLOGIST" isActive={councilStep === 'DISCOVERY' || councilStep === 'CRITIQUE'} status={getMemberStatus('IMMUNOLOGIST', councilStep)} />
                     <CouncilMemberIcon type="LINGUIST" isActive={councilStep === 'DISCOVERY' || councilStep === 'CRITIQUE'} status={getMemberStatus('LINGUIST', councilStep)} />
                     <CouncilMemberIcon type="ENGINEER" isActive={councilStep === 'DISCOVERY' || councilStep === 'CRITIQUE'} status={getMemberStatus('ENGINEER', councilStep)} />
                     <CouncilMemberIcon type="HISTORIAN" isActive={councilStep === 'DISCOVERY' || councilStep === 'CRITIQUE'} status={getMemberStatus('HISTORIAN', councilStep)} />
                  </div>
                  
                  {/* Console Output */}
                  <div ref={councilConsoleRef} className="bg-black/50 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-400 h-64 overflow-y-auto custom-scrollbar space-y-2">
                     <div className="text-zinc-600 italic mb-4">&gt;&gt;&gt; COUNCIL SESSION {councilLog?.sessionId.substring(0,8)} INITIATED</div>
                     
                     {councilLog?.discovery?.map((d, i) => (
                        <div key={`d-${i}`} className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 mb-2">
                           <div className="flex items-center gap-2">
                              <span className="text-blue-400 font-bold">[{d.member}]:</span>
                              <span className="text-zinc-500 text-[10px]">DISCOVERY FILED</span>
                           </div>
                           <p className="text-zinc-300 pl-4 border-l border-blue-500/30">{d.content.substring(0, 120)}...</p>
                        </div>
                     ))}

                     {councilStep === 'DISCOVERY' && (councilLog?.discovery || []).length < 5 && (
                        <div className="text-blue-500/50 animate-pulse">&gt;&gt;&gt; GATHERING INTELLIGENCE VECTORS...</div>
                     )}

                     {/* Synthesis */}
                     {councilLog?.synthesis && (
                        <div className="flex flex-col gap-1 text-yellow-400 animate-in fade-in slide-in-from-left-2 my-4 pt-4 border-t border-zinc-900/50">
                           <div className="flex gap-2">
                              <span className="font-bold">[CHAIR]:</span>
                              <span>Draft Manifest Synthesized.</span>
                           </div>
                           <div className="pl-4 text-zinc-500 italic">Distributing for Council Critique...</div>
                        </div>
                     )}

                     {councilStep === 'SYNTHESIS' && !councilLog?.synthesis && (
                        <div className="text-yellow-500/50 animate-pulse mt-4">&gt;&gt;&gt; STRATEGIST IS SYNTHESIZING DRAFT...</div>
                     )}

                     {/* Critiques */}
                     {councilLog?.critiques?.map((c, i) => (
                        <div key={`c-${i}`} className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 mb-2">
                           <div className="flex items-center gap-2">
                              <span className="text-red-400 font-bold">[{c.member}]:</span>
                              <span className="text-zinc-500 text-[10px]">CRITIQUE FILED</span>
                           </div>
                           <p className="text-zinc-300 pl-4 border-l border-red-500/30">{c.content}</p>
                        </div>
                     ))}

                     {councilStep === 'CRITIQUE' && (councilLog?.critiques || []).length < 5 && councilLog?.synthesis && (
                        <div className="text-red-500/50 animate-pulse">&gt;&gt;&gt; DELIBERATING DRAFT MANIFEST...</div>
                     )}

                     {councilStep === 'FINALIZATION' && (
                        <div className="text-sovereign/50 animate-pulse mt-4 pt-4 border-t border-zinc-900/50">&gt;&gt;&gt; FINALIZING IDENTITY MATRIX...</div>
                     )}
                     
                     <div className="animate-pulse text-zinc-600">_</div>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* Existing Chat Interface & Manifest Display Logic (Preserved) */}
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
                        <button onClick={() => setCurrentVersionIndex(prev => Math.max(0, prev - 1))} disabled={currentVersionIndex === 0} className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 text-zinc-300">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-xs font-mono font-bold text-sovereign">{currentVersion.label}</span>
                        <button onClick={() => setCurrentVersionIndex(prev => Math.min(versions.length - 1, prev + 1))} disabled={currentVersionIndex === versions.length - 1} className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 text-zinc-300">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                   )}
                </div>

                <div className="flex items-center space-x-4">
                   {/* Explicit NEW IDENTITY Button */}
                   <button 
                     onClick={handleClearHistory}
                     className="flex items-center space-x-2 bg-zinc-100 hover:bg-white text-black px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-lg hover:scale-105"
                   >
                      <Plus className="w-4 h-4" />
                      <span>NEW IDENTITY</span>
                   </button>

                   {currentVersion?.usage && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-zinc-900/50 rounded-full border border-zinc-800 text-xs font-mono text-zinc-400 hidden sm:flex" title="Token Telemetry">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span>{currentVersion.usage.totalTokens.toLocaleString()} TKN</span>
                      </div>
                   )}
                   <button onClick={handleClearHistory} className="p-2 text-zinc-600 hover:text-red-400 transition-colors rounded hover:bg-zinc-900">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>
             
             {/* Council Log Summary if available */}
             {currentManifest.provenance?.councilLog && (
                <div className="bg-indigo-950/20 border border-indigo-900/50 p-4 rounded-lg mb-6 relative">
                   <div className="flex justify-between items-start mb-4">
                       <h3 className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Council Deliberation Record
                       </h3>
                       <button 
                         onClick={handleDownloadCouncilLog}
                         className="flex items-center gap-1 text-[10px] font-bold bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 transition-colors"
                         title="Export Deliberation Log to Markdown"
                       >
                          <Download className="w-3 h-3" />
                          SAVE LOG
                       </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-400 font-mono">
                      <div className="bg-black/20 p-2 rounded">
                         <p className="text-indigo-300 mb-1">Discovery Phase</p>
                         <ul className="list-disc pl-4 space-y-1">
                            {(currentManifest.provenance.councilLog.discovery || []).length > 0 ? (
                               currentManifest.provenance.councilLog.discovery.map((d, i) => (
                                  <li key={i}>{d.member}: Analysis Logged</li>
                               ))
                            ) : (
                               <li className="text-zinc-600 italic">No records found.</li>
                            )}
                         </ul>
                      </div>
                      <div className="bg-black/20 p-2 rounded">
                         <p className="text-red-300 mb-1">Critique & Refinement</p>
                         <ul className="list-disc pl-4 space-y-1">
                            {(currentManifest.provenance.councilLog.critiques || []).length > 0 ? (
                               currentManifest.provenance.councilLog.critiques.map((c, i) => (
                                  <li key={i} title={c.content}>{c.member}: {c.content.substring(0, 40)}...</li>
                               ))
                            ) : (
                               <li className="text-zinc-600 italic">No records found.</li>
                            )}
                         </ul>
                      </div>
                   </div>
                </div>
             )}

             <ManifestDisplay manifest={currentManifest} />
          </div>
        )}
    </div>
  );
};
