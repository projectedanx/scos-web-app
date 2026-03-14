
import React, { useState, useRef, useEffect } from 'react';
import { User, Shield, HardDrive, Key, ChevronLeft, Trash2, Download, Upload, Cloud, LogOut, Wifi, WifiOff, FolderInput, FileUp, Loader2 } from 'lucide-react';
import { generateCommanderKeys, CommanderKeyPair } from './services/cryptoService';
import { SovereignAgentManifest, SovereignVault, ProvenanceIndexEntry, ViewMode, ScarEntry, SovereignPrompt, ContextCapsule, CognitiveContract } from './types';
import { Sidebar } from './components/Layout/Sidebar';
import { AgentForgeView } from './views/AgentForgeView';
import { CapsuleLabView } from './views/CapsuleLabView';
import { RegistryView } from './views/RegistryView';
import { AgentLibraryView } from './views/AgentLibraryView';
import { WordMapperView, WordMapperState } from './views/WordMapperView';
import { DashboardView } from './views/DashboardView';
import { PromptForgeView } from './views/PromptForgeView';
import { PromptLibraryView } from './views/PromptLibraryView'; 
import { CollaboratorView } from './views/CollaboratorView';
import { ContractBuilderView } from './views/ContractBuilderView';
import { PublicGatewayView } from './views/PublicGatewayView'; 
import { useAuth } from './contexts/AuthContext';
import { useToast } from './contexts/ToastContext';
import { useDialog } from './contexts/DialogContext';
import { MapStrategy } from './services/wordMapperService';
import { 
  syncAgents, 
  syncCapsules, 
  syncPrompts, 
  syncContracts, 
  syncProvenance,
  saveAgentToCloud,
  saveCapsuleToCloud,
  savePromptToCloud,
  saveContractToCloud,
  saveProvenanceToCloud,
  deleteAgentFromCloud,
  deleteCapsuleFromCloud,
  deletePromptFromCloud,
  deleteContractFromCloud
} from './services/firestoreService';

// --- Legacy Migration Utility (Preserved) ---
const migrateLegacyAgent = (data: any, filename: string): SovereignAgentManifest => {
  const identity = data.identity || {
      name: data.name || filename.replace('.json', ''),
      designation: data.designation || "Legacy Entity",
      primeDirective: data.primeDirective || "Directive undefined during import.",
      corePhilosophy: data.corePhilosophy || "Philosophy undefined during import."
  };
  const protocol = data.protocol || {
      standard: "DRP-MULTI-AGENT-PROTOCOL-2025",
      role: "SPECIALIST",
      communicationScheme: "AGENT_PACKET_V1"
  };
  const epistemicPolicy = data.epistemicPolicy || {
      readScopes: ["legacy_read"],
      writeScopes: [],
      contextKeys: []
  };
  const budget = data.budget || {
      tokenBudget: 0,
      driftAllowance: 0.1 
  };
  const tools = Array.isArray(data.tools) ? data.tools : [];
  const internalTools = Array.isArray(data.internalTools) ? data.internalTools : [];
  const workflows = Array.isArray(data.workflows) ? data.workflows : [];
  const abilities = Array.isArray(data.abilities) ? data.abilities : [];
  const anchors = Array.isArray(data.anchors) ? data.anchors : [];
  const constraints = Array.isArray(data.constraints) ? data.constraints : [];
  const provenance = data.provenance || undefined;
  const epistemicMatrix = data.epistemicMatrix || {
    goals: {
        primary: identity.primeDirective || "Undefined Goal",
        secondary: [],
        antiGoals: []
    },
    output: {
        format: "TEXT",
        schema: "NONE",
        constraints: []
    },
    communication: {
        tone: "NEUTRAL",
        epistemicMarkers: "NONE",
        verbosity: "ADAPTIVE"
    },
    cognitive: {
        thinkingBudget: 0,
        thinkingInstruction: "Legacy processing loop.",
        synthesisInstruction: "Legacy synthesis.",
        executionInstruction: "Legacy execution."
    }
  };

  if (data.key || (provenance && provenance.signature)) {
     if (!data.architecturalNotes) {
         data.architecturalNotes = "";
     }
     data.architecturalNotes += "\n[SYSTEM]: Imported from legacy state. Review required.";
  }

  return {
      identity,
      epistemicMatrix,
      protocol,
      epistemicPolicy,
      tools,
      internalTools,
      budget,
      workflows,
      abilities,
      anchors,
      constraints,
      architecturalNotes: data.architecturalNotes || "Imported via Batch Loader.",
      provenance
  };
};

function App() {
  const { addToast } = useToast();
  const { confirm, prompt } = useDialog();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD); 
  
  // State
  const [vault, setVault] = useState<SovereignAgentManifest[]>([]);
  const [capsules, setCapsules] = useState<ContextCapsule[]>([]);
  const [prompts, setPrompts] = useState<SovereignPrompt[]>([]);
  const [contracts, setContracts] = useState<CognitiveContract[]>([]);
  const [provenanceIndex, setProvenanceIndex] = useState<ProvenanceIndexEntry[]>([]);
  
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [commanderName, setCommanderName] = useState("Architect");
  const [commanderKeys, setCommanderKeys] = useState<CommanderKeyPair | null>(null);
  
  // Auth Integration
  const { user, loading, signInWithGoogle, signOut, syncSovereignProfile, isConfigured } = useAuth();
  
  // Inter-View State
  const [restoredAgent, setRestoredAgent] = useState<SovereignAgentManifest | null>(null);
  const [wordMapperContext, setWordMapperContext] = useState<WordMapperState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [scars, setScars] = useState<ScarEntry[]>([]);

  // --- Key Initialization ---
  useEffect(() => {
    const initKeys = async () => {
      const stored = localStorage.getItem('sovereign_cmdr_keys');
      if (stored) {
        const parsedKeys = JSON.parse(stored);
        setCommanderKeys(parsedKeys);
        if (user) syncSovereignProfile(parsedKeys);
      } else {
        const keys = await generateCommanderKeys();
        localStorage.setItem('sovereign_cmdr_keys', JSON.stringify(keys));
        setCommanderKeys(keys);
        if (user) syncSovereignProfile(keys);
      }
    };
    initKeys();
  }, [user]);

  // --- Firestore Synchronization ---
  useEffect(() => {
    if (!user) {
      // Fallback to LocalStorage if offline/logged out
      try {
        setVault(JSON.parse(localStorage.getItem('sovereign_vault_agents') || '[]'));
        setCapsules(JSON.parse(localStorage.getItem('sovereign_capsules_db') || '[]'));
        setPrompts(JSON.parse(localStorage.getItem('sovereign_prompts_db') || '[]'));
        setContracts(JSON.parse(localStorage.getItem('sovereign_contracts_db') || '[]'));
        // We don't typically persist provenance index in LS for offline mode due to size, but could if needed.
      } catch (e) {
        console.warn("Failed to load local storage fallback", e);
      }
      return;
    }

    // Real-time Sync from Firestore
    const unsubAgents = syncAgents(user.uid, setVault);
    const unsubCapsules = syncCapsules(user.uid, setCapsules);
    const unsubPrompts = syncPrompts(user.uid, setPrompts);
    const unsubContracts = syncContracts(user.uid, setContracts);
    const unsubProvenance = syncProvenance(user.uid, setProvenanceIndex);

    return () => {
      unsubAgents();
      unsubCapsules();
      unsubPrompts();
      unsubContracts();
      unsubProvenance();
    };
  }, [user]);

  // --- Handlers (Cloud Aware) ---

  const handleAddToVault = async (manifest: SovereignAgentManifest, indexEntry?: ProvenanceIndexEntry) => {
    if (user) {
      await saveAgentToCloud(user.uid, manifest);
      if (indexEntry) await saveProvenanceToCloud(user.uid, indexEntry);
    } else {
      // Local Fallback
      setVault(prev => {
        const next = [...prev, manifest];
        localStorage.setItem('sovereign_vault_agents', JSON.stringify(next));
        return next;
      });
    }
  };

  const handleRegisterProvenance = async (entry: ProvenanceIndexEntry) => {
    if (user) {
      await saveProvenanceToCloud(user.uid, entry);
    } else {
      setProvenanceIndex(prev => [...prev, entry]);
    }
  };

  const handleSaveCapsule = async (capsule: ContextCapsule) => {
    if (user) {
      await saveCapsuleToCloud(user.uid, capsule);
    } else {
      setCapsules(prev => {
        const exists = prev.findIndex(c => c.meta.id === capsule.meta.id);
        const updated = exists >= 0 ? prev.map(c => c.meta.id === capsule.meta.id ? capsule : c) : [capsule, ...prev];
        localStorage.setItem('sovereign_capsules_db', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleDeleteCapsule = async (id: string) => {
    confirm("Destroy capsule?", async () => {
      if (user) {
        await deleteCapsuleFromCloud(user.uid, id);
      } else {
        setCapsules(prev => prev.filter(c => c.meta.id !== id));
      }
    });
  };

  const handleSavePrompt = async (prompt: SovereignPrompt) => {
    if (user) {
      await savePromptToCloud(user.uid, prompt);
    } else {
      setPrompts(prev => {
        const exists = prev.findIndex(p => p.id === prompt.id);
        const updated = exists >= 0 ? prev.map(p => p.id === prompt.id ? prompt : p) : [prompt, ...prev];
        localStorage.setItem('sovereign_prompts_db', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleDeletePrompt = async (id: string) => {
    confirm("Delete prompt?", async () => {
      if (user) {
        await deletePromptFromCloud(user.uid, id);
      } else {
        setPrompts(prev => prev.filter(p => p.id !== id));
      }
    });
  };

  const handleSaveContract = async (contract: CognitiveContract) => {
    if (user) {
      await saveContractToCloud(user.uid, contract);
    } else {
      setContracts(prev => {
        const exists = prev.findIndex(c => c.id === contract.id);
        const updated = exists >= 0 ? prev.map(c => c.id === contract.id ? contract : c) : [contract, ...prev];
        localStorage.setItem('sovereign_contracts_db', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (user) {
      await deleteContractFromCloud(user.uid, id);
    } else {
      setContracts(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleDeleteAgent = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    confirm("Decommission agent?", async () => {
      const agent = vault[index];
      if (user) {
        await deleteAgentFromCloud(user.uid, agent);
      } else {
        setVault(prev => prev.filter((_, i) => i !== index));
      }
    });
  };

  const handleFolderImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = e.target.files;
     if (!files || files.length === 0) return;

     const newAgents: SovereignAgentManifest[] = [];
     let errorCount = 0;

     for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.name.endsWith('.json')) continue;

        try {
           const text = await file.text();
           const json = JSON.parse(text);
           
           if (json.identity || json.name || json.tools) {
               const migrated = migrateLegacyAgent(json, file.name);
               newAgents.push(migrated);
           }
        } catch (e) {
           console.warn(`Failed to parse ${file.name}`, e);
           errorCount++;
        }
     }

     if (newAgents.length > 0) {
        // Update Local State
        setVault(prevVault => {
          const existingNames = new Set(prevVault.map(a => a.identity.name));
          const uniqueNewAgents = newAgents.filter(a => !existingNames.has(a.identity.name));
          // Push to cloud if logged in
          if (user) {
             uniqueNewAgents.forEach(a => saveAgentToCloud(user.uid, a));
          } else {
             // Local persist
             localStorage.setItem('sovereign_vault_agents', JSON.stringify([...prevVault, ...uniqueNewAgents]));
          }
          return [...prevVault, ...uniqueNewAgents];
        });
        
        setScars(prev => [{
           timestamp: Date.now(),
           code: 'BATCH_IMPORT_COMPLETE',
           message: `Successfully imported ${newAgents.length} agents from folder.`,
           context: `Errors: ${errorCount}`
        }, ...prev]);
     }

     if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // --- Export/Import (JSON) ---
  const handleExportVault = () => {
    const vaultData: SovereignVault = {
      metadata: {
        commanderName: commanderName,
        designation: "Sovereign-Class Operator",
        lastSync: Date.now(),
        version: "1.2.0",
        commanderPublicKey: JSON.stringify(commanderKeys?.publicKey)
      },
      agents: vault,
      capsules: capsules,
      contracts: contracts,
      provenanceIndex: provenanceIndex
    };
    const blob = new Blob([JSON.stringify(vaultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovereign-vault-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportVault = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.metadata || !Array.isArray(data.agents)) throw new Error("Invalid Vault");
        
        // 1. Agents
        const newAgents = (data.agents as SovereignAgentManifest[]).filter(
            a => !vault.some(p => p.identity.name === a.identity.name)
        );
        setVault(prev => [...prev, ...newAgents]);
        if(user) newAgents.forEach(a => saveAgentToCloud(user.uid, a));

        // 2. Capsules
        const newCapsules = (data.capsules as ContextCapsule[] || []).filter(
            c => !capsules.some(p => p.meta.id === c.meta.id)
        );
        setCapsules(prev => [...prev, ...newCapsules]);
        if(user) newCapsules.forEach(c => saveCapsuleToCloud(user.uid, c));

        // 3. Prompts
        const newPrompts = (data.prompts as SovereignPrompt[] || []).filter(
            p => !prompts.some(prev => prev.id === p.id)
        );
        setPrompts(prev => [...prev, ...newPrompts]);
        if(user) newPrompts.forEach(p => savePromptToCloud(user.uid, p));

        // 4. Contracts
        const newContracts = (data.contracts as CognitiveContract[] || []).filter(
            c => !contracts.some(prev => prev.id === c.id)
        );
        setContracts(prev => [...prev, ...newContracts]);
        if(user) newContracts.forEach(c => saveContractToCloud(user.uid, c));

        // 5. Provenance Index
        const newProvenance = (data.provenanceIndex as ProvenanceIndexEntry[] || []).filter(
            entry => !provenanceIndex.some(prev => prev.hash === entry.hash)
        );
        setProvenanceIndex(prev => [...prev, ...newProvenance]);
        if(user) newProvenance.forEach(entry => saveProvenanceToCloud(user.uid, entry));

        addToast(`Vault Imported Successfully.\nAgents: ${newAgents.length}\nCapsules: ${newCapsules.length}\nProvenance: ${newProvenance.length}`, 'success');

      } catch (err) {
        addToast("Import failed: " + err, 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Inter-View Handlers ---
  const handleSelectAgent = (agent: SovereignAgentManifest) => {
    if (viewMode === ViewMode.FORGE || viewMode === ViewMode.AGENTS) {
      if (viewMode === ViewMode.AGENTS) setViewMode(ViewMode.FORGE);
      setRestoredAgent(agent);
    } 
    setIsVaultOpen(false);
  };

  const handleMapAgent = (agent: SovereignAgentManifest) => {
    const seeds = [agent.identity.name];
    if (agent.identity.corePhilosophy) {
      const cleanPhilosophy = agent.identity.corePhilosophy.replace(/\n/g, ' ').substring(0, 150);
      seeds.push(cleanPhilosophy);
    }
    setWordMapperContext({ seeds, strategy: MapStrategy.WORLDVIEW });
    setViewMode(ViewMode.WORD_MAPPER);
    setIsVaultOpen(false);
  };

  const handleRegenerateKeys = async () => {
    confirm("WARNING: Regenerating keys will invalidate previous signatures. Proceed?", async () => {
      const keys = await generateCommanderKeys();
      localStorage.setItem('sovereign_cmdr_keys', JSON.stringify(keys));
      setCommanderKeys(keys);
      if (user) syncSovereignProfile(keys);
    });
  };

  // --- Render ---
  
  if (loading) {
    return (
      <div className="h-screen w-full bg-void flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-mono text-sm">Initializing Sovereign Interface...</p>
      </div>
    );
  }

  if (!user && isConfigured) {
    return <PublicGatewayView capsules={capsules} onLogin={signInWithGoogle} />;
  }

  return (
    <div className="min-h-screen bg-void text-zinc-100 font-sans selection:bg-sovereign/30 selection:text-sovereign-light overflow-x-hidden relative flex">
      <Sidebar 
        currentMode={viewMode} 
        onSwitch={setViewMode} 
        onToggleVault={() => setIsVaultOpen(true)} 
      />

      <div 
        className={`fixed inset-y-0 right-0 w-80 bg-zinc-950 border-l border-zinc-800 transform transition-transform duration-300 ease-in-out z-[60] shadow-2xl flex flex-col ${
          isVaultOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-zinc-800 bg-void-light flex items-center justify-between">
           <div className="flex items-center space-x-2 text-sovereign">
              <HardDrive className="w-5 h-5" />
              <span className="font-bold font-mono tracking-tight">Sovereign Vault</span>
           </div>
           <button onClick={() => setIsVaultOpen(false)} className="text-zinc-500 hover:text-white">
              <ChevronLeft className="w-5 h-5 rotate-180" />
           </button>
        </div>

        <div className="p-4 border-b border-zinc-800 bg-black/20">
           <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-zinc-800 rounded-full">
                 {user && user.photoURL ? (
                   <img src={user.photoURL} alt="User" className="w-4 h-4 rounded-full" />
                 ) : (
                   <User className="w-4 h-4 text-zinc-400" />
                 )}
              </div>
              <div className="overflow-hidden">
                 <p className="text-xs text-zinc-500 font-mono uppercase">Commander</p>
                 <input 
                    className="bg-transparent text-sm font-bold text-white outline-none w-full"
                    value={commanderName}
                    onChange={(e) => setCommanderName(e.target.value)}
                 />
              </div>
           </div>
           <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-2">
              <span>AGENTS: {vault.length}</span>
              <button onClick={handleRegenerateKeys} className="flex items-center space-x-1 hover:text-red-400">
                <Key className="w-3 h-3" />
                <span>REKEY</span>
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
           {vault.length === 0 ? (
             <div className="text-center p-8 text-zinc-600 text-xs italic">
               Vault is empty.<br/>Fabricated agents are auto-archived here.
             </div>
           ) : (
             vault.map((agent, idx) => (
               <div 
                key={idx} 
                onClick={() => handleSelectAgent(agent)}
                className="group p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/50 rounded cursor-pointer transition-all relative"
               >
                 <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs text-zinc-200 group-hover:text-sovereign truncate pr-4">{agent.identity.name}</span>
                    <button 
                      onClick={(e) => handleDeleteAgent(idx, e)}
                      className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                 </div>
                 <div className="flex justify-between items-center">
                   <p className="text-[10px] text-zinc-500 truncate">{agent.identity.designation}</p>
                   {agent.provenance?.signature && <Shield className="w-3 h-3 text-sovereign opacity-50" />}
                 </div>
               </div>
             ))
           )}
        </div>
        
        {provenanceIndex.length > 0 && (
          <div className="p-0 border-t border-zinc-800 max-h-64 overflow-y-auto bg-black/30">
             <h4 className="text-[10px] font-mono text-zinc-500 my-2 px-3 sticky top-0 bg-zinc-950/80 backdrop-blur pb-1">PROVENANCE INDEX</h4>
             <div className="space-y-0.5">
             {provenanceIndex.map((entry, idx) => (
               <div key={idx} className="px-3 py-2 border-l-2 border-zinc-800 hover:border-sovereign hover:bg-white/5 transition-colors">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[120px]" title={entry.hash}>
                        {entry.hash.substring(0,8)}...
                    </span>
                    <span className="text-[10px] text-zinc-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                 </div>
                 <div className="text-xs text-zinc-200 font-bold mb-1 truncate">{entry.agentName}</div>
               </div>
             ))}
             </div>
          </div>
        )}

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/20 space-y-2">
           <button 
             onClick={handleExportVault}
             disabled={vault.length === 0}
             className="w-full flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs py-2 rounded border border-zinc-700 transition-colors disabled:opacity-50"
           >
              <Download className="w-3 h-3" />
              <span>EXPORT VAULT (.JSON)</span>
           </button>
           
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="w-full flex items-center justify-center space-x-2 bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs py-2 rounded border border-dashed border-zinc-700 transition-colors"
           >
              <FileUp className="w-3 h-3" />
              <span>IMPORT VAULT</span>
           </button>
           <input type="file" ref={fileInputRef} onChange={handleImportVault} accept=".json" className="hidden" />

           <button 
             onClick={() => folderInputRef.current?.click()}
             className="w-full flex items-center justify-center space-x-2 bg-transparent hover:bg-zinc-800 text-zinc-500 hover:text-indigo-400 text-xs py-2 rounded border border-dashed border-zinc-800 hover:border-indigo-500/50 transition-colors"
           >
              <FolderInput className="w-3 h-3" />
              <span>IMPORT FOLDER</span>
           </button>
           <input 
             type="file" 
             ref={folderInputRef} 
             onChange={handleFolderImport} 
             className="hidden" 
             multiple 
             {...{ webkitdirectory: "", directory: "" } as any} 
           />
        </div>
      </div>

      <div className="flex-1 ml-64 p-0 bg-void transition-all duration-300">
         <div className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur sticky top-0 z-30">
            <div className="flex items-center space-x-2">
               <span className="text-xs font-mono text-zinc-500 uppercase">Current Mode:</span>
               <span className="text-sm font-bold text-white tracking-tight">{viewMode}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isConfigured ? (
                 user ? (
                   <div className="flex items-center space-x-3 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
                      <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 rounded-full bg-sovereign shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                         <span className="text-xs font-bold text-zinc-300">CLOUD_LINKED</span>
                      </div>
                      <div className="h-3 w-px bg-zinc-700"></div>
                      <button onClick={signOut} className="text-zinc-500 hover:text-red-400 transition-colors" title="Disconnect Cloud">
                         <LogOut className="w-4 h-4" />
                      </button>
                   </div>
                 ) : (
                   <button 
                     onClick={signInWithGoogle}
                     className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors text-xs font-bold"
                   >
                     <Cloud className="w-4 h-4" />
                     <span>CONNECT IDENTITY</span>
                   </button>
                 )
              ) : (
                 <div className="flex items-center space-x-2 opacity-50 text-zinc-600 px-3 py-1.5" title="Configure Firebase to enable cloud features">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-xs font-mono">OFFLINE_MODE</span>
                 </div>
              )}

              {commanderKeys && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900 rounded border border-zinc-800 text-sovereign/60">
                  <Key className="w-3 h-3" />
                  <span className="text-xs font-mono">SIG_ACTIVE</span>
                </div>
              )}
            </div>
         </div>

         {viewMode === ViewMode.FORGE && (
            <AgentForgeView 
               commanderKeys={commanderKeys}
               onAddToVault={handleAddToVault}
               restoredAgent={restoredAgent}
               onAgentRestored={() => setRestoredAgent(null)}
            />
         )}
         
         {viewMode === ViewMode.CAPSULE_LAB && (
            <CapsuleLabView 
               capsules={capsules}
               onSaveCapsule={handleSaveCapsule}
               onDeleteCapsule={handleDeleteCapsule}
               onRegisterProvenance={handleRegisterProvenance}
            />
         )}

         {viewMode === ViewMode.WORD_MAPPER && (
            <WordMapperView 
              onRegisterConstellation={handleRegisterProvenance} 
              initialState={wordMapperContext}
              onStateConsumed={() => setWordMapperContext(null)}
            />
         )}

         {viewMode === ViewMode.PROMPT_FORGE && (
            <PromptForgeView 
               onSavePrompt={handleSavePrompt} 
               onRegisterProvenance={handleRegisterProvenance} 
            />
         )}

         {viewMode === ViewMode.PROMPT_LIBRARY && (
            <PromptLibraryView 
               prompts={prompts}
               agents={vault}
               onSavePrompt={handleSavePrompt}
               onDeletePrompt={handleDeletePrompt}
               onRegisterProvenance={handleRegisterProvenance}
            />
         )}

         {viewMode === ViewMode.COLLABORATOR && (
            <CollaboratorView 
               agents={vault}
               capsules={capsules}
               prompts={prompts}
            />
         )}
         
         {viewMode === ViewMode.CONTRACTS && (
            <ContractBuilderView 
               contracts={contracts}
               agents={vault}
               onSaveContract={handleSaveContract}
               onDeleteContract={handleDeleteContract}
               onRegisterProvenance={handleRegisterProvenance}
            />
         )}

         {viewMode === ViewMode.DASHBOARD && (
            <DashboardView 
              agents={vault}
              provenanceHistory={provenanceIndex}
              commanderKeys={commanderKeys}
              user={user}
              onNavigate={setViewMode}
            />
         )}

         {viewMode === ViewMode.REGISTRY && (
            <RegistryView index={provenanceIndex} />
         )}

         {viewMode === ViewMode.AGENTS && (
            <AgentLibraryView 
               agents={vault} 
               onSelectAgent={handleSelectAgent} 
               onMapAgent={handleMapAgent}
            />
         )}
      </div>
    </div>
  );
}

export default App;
