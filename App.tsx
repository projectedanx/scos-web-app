
import React, { useState, useRef, useEffect } from 'react';
import { User, Shield, HardDrive, Key, ChevronLeft, Trash2, Download, Upload, LogIn, LogOut, CloudUpload } from 'lucide-react';
import { generateCommanderKeys, CommanderKeyPair } from './services/cryptoService';
import { SovereignAgentManifest, SovereignVault, ProvenanceIndexEntry, ViewMode, ScarEntry } from './types';
import { Sidebar } from './components/Layout/Sidebar';
import { AgentForgeView } from './views/AgentForgeView';
import { CapsuleLabView } from './views/CapsuleLabView';
import { RegistryView } from './views/RegistryView';
import { AgentLibraryView } from './views/AgentLibraryView';
import { WordMapperView } from './views/WordMapperView';
import { useAuth } from './components/Auth/AuthProvider';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './services/firebase';
import { migrateVaultToFirestore } from './services/migration';

function App() {
  // Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.FORGE);
  
  // Vault & Keys State
  const [vault, setVault] = useState<SovereignAgentManifest[]>([]);
  const [provenanceIndex, setProvenanceIndex] = useState<ProvenanceIndexEntry[]>([]);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [commanderName, setCommanderName] = useState("Architect");
  const [commanderKeys, setCommanderKeys] = useState<CommanderKeyPair | null>(null);
  
  // Inter-View State
  // When an agent is selected in the Vault, it is passed to the active View to be "restored" or "utilized"
  const [restoredAgent, setRestoredAgent] = useState<SovereignAgentManifest | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scars, setScars] = useState<ScarEntry[]>([]);

  const { user, signInWithGoogle, logout } = useAuth();

  // --- Initialization ---
  useEffect(() => {
    const initKeys = async () => {
      const stored = localStorage.getItem('sovereign_cmdr_keys');
      if (stored) {
        setCommanderKeys(JSON.parse(stored));
      } else {
        const keys = await generateCommanderKeys();
        localStorage.setItem('sovereign_cmdr_keys', JSON.stringify(keys));
        setCommanderKeys(keys);
      }
    };
    initKeys();
  }, []);

  // --- Profile Sync ---
  useEffect(() => {
      const syncProfile = async () => {
          if (user && commanderKeys) {
              try {
                  await setDoc(doc(db, 'users', user.uid), {
                      commanderPublicKey: commanderKeys.publicKey,
                      lastLogin: Date.now()
                  }, { merge: true });
                  console.log("Commander keys synced to Firestore.");
              } catch (e) {
                  console.error("Failed to sync commander keys", e);
              }
          }
      };
      syncProfile();
  }, [user, commanderKeys]);

  // --- Vault Logic ---

  const handleAddToVault = (manifest: SovereignAgentManifest, indexEntry?: ProvenanceIndexEntry) => {
    setVault(prev => [...prev, manifest]);
    if (indexEntry) {
      setProvenanceIndex(prev => [...prev, indexEntry]);
    }
  };

  const handleExportVault = () => {
    const vaultData: SovereignVault = {
      metadata: {
        commanderName: commanderName,
        designation: "Sovereign-Class Operator",
        lastSync: Date.now(),
        version: "1.1.0",
        commanderPublicKey: JSON.stringify(commanderKeys?.publicKey)
      },
      agents: vault,
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
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (!data.metadata || !Array.isArray(data.agents)) {
          throw new Error("Invalid Vault Structure");
        }

        setCommanderName(data.metadata.commanderName || "Architect");
        setVault(data.agents);
        setProvenanceIndex(data.provenanceIndex || []);
        
      } catch (err) {
        setScars(prev => [{
          timestamp: Date.now(),
          code: 'ERR_VAULT_CORRUPTION',
          message: 'The provided vault file is corrupted or incompatible.',
          context: 'IMPORT'
        }, ...prev]);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectAgent = (agent: SovereignAgentManifest) => {
    // If in Forge or Library, we load it into Forge as a workspace
    if (viewMode === ViewMode.FORGE || viewMode === ViewMode.AGENTS) {
      if (viewMode === ViewMode.AGENTS) setViewMode(ViewMode.FORGE);
      setRestoredAgent(agent);
    } 
    // If in Capsule Lab, we set it as the source (Future logic)
    setIsVaultOpen(false);
  };

  const deleteFromVault = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Permanently decommission this agent from the vault?")) {
      setVault(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleRegenerateKeys = async () => {
    if (confirm("WARNING: Regenerating keys will invalidate the signatures of previous agents. Proceed?")) {
      const keys = await generateCommanderKeys();
      localStorage.setItem('sovereign_cmdr_keys', JSON.stringify(keys));
      setCommanderKeys(keys);
    }
  };

  const handleMigrate = async () => {
      if (!user || vault.length === 0) return;
      if (confirm(`Migrate ${vault.length} agents to your cloud vault?`)) {
          const success = await migrateVaultToFirestore(user.uid, vault);
          if (success) {
              alert("Migration complete.");
          } else {
              alert("Migration failed. Check console for details.");
          }
      }
  };

  return (
    <div className="min-h-screen bg-void text-zinc-100 font-sans selection:bg-sovereign/30 selection:text-sovereign-light overflow-x-hidden relative flex">
      
      {/* 1. Main Navigation Sidebar */}
      <Sidebar 
        currentMode={viewMode} 
        onSwitch={setViewMode} 
        onToggleVault={() => setIsVaultOpen(true)} 
      />

      {/* 2. Global Vault Drawer (Overlay) */}
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
                 {user?.photoURL ? (
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
           
            {/* Auth Button */}
            <div className="mb-4 space-y-2">
               {user ? (
                   <>
                       <button onClick={logout} className="w-full flex items-center justify-center space-x-2 bg-zinc-800/50 hover:bg-zinc-800 text-xs py-1.5 rounded border border-zinc-700/50 transition-colors text-zinc-400">
                           <LogOut className="w-3 h-3" />
                           <span>LOGOUT</span>
                       </button>
                       {vault.length > 0 && (
                           <button onClick={handleMigrate} className="w-full flex items-center justify-center space-x-2 bg-purple-900/30 hover:bg-purple-800/50 text-purple-300 text-xs py-1.5 rounded border border-purple-700/50 transition-colors">
                               <CloudUpload className="w-3 h-3" />
                               <span>MIGRATE TO CLOUD</span>
                           </button>
                       )}
                   </>
               ) : (
                   <button onClick={signInWithGoogle} className="w-full flex items-center justify-center space-x-2 bg-sovereign/10 hover:bg-sovereign/20 text-sovereign text-xs py-1.5 rounded border border-sovereign/30 transition-colors">
                       <LogIn className="w-3 h-3" />
                       <span>LOGIN (SYNC)</span>
                   </button>
               )}
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
                      onClick={(e) => deleteFromVault(idx, e)}
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
              <Upload className="w-3 h-3" />
              <span>IMPORT VAULT</span>
           </button>
           <input type="file" ref={fileInputRef} onChange={handleImportVault} accept=".json" className="hidden" />
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="flex-1 ml-64 p-0 bg-void transition-all duration-300">
         {/* Top Status Bar */}
         <div className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur sticky top-0 z-30">
            <div className="flex items-center space-x-2">
               <span className="text-xs font-mono text-zinc-500 uppercase">Current Mode:</span>
               <span className="text-sm font-bold text-white tracking-tight">{viewMode}</span>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono text-zinc-600">
              {user && (
                  <span className="text-[10px] text-zinc-500 mr-2">LOGGED IN AS: {user.email}</span>
              )}
              {commanderKeys && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-zinc-900 rounded border border-zinc-800 text-sovereign/60">
                  <Key className="w-3 h-3" />
                  <span>SIG_ACTIVE</span>
                </div>
              )}
            </div>
         </div>

         {/* View Router */}
         {viewMode === ViewMode.FORGE && (
            <AgentForgeView 
               commanderKeys={commanderKeys}
               onAddToVault={handleAddToVault}
               restoredAgent={restoredAgent}
               onAgentRestored={() => setRestoredAgent(null)}
            />
         )}
         
         {viewMode === ViewMode.CAPSULE_LAB && (
            <CapsuleLabView />
         )}

         {viewMode === ViewMode.WORD_MAPPER && (
            <WordMapperView />
         )}

         {viewMode === ViewMode.DASHBOARD && (
            <div className="flex items-center justify-center h-[80vh] text-zinc-600 font-mono animate-fade-in-up">
              <div className="text-center">
                 <h2 className="text-2xl font-bold text-zinc-500 mb-2">Command Dashboard</h2>
                 <p>System status visualization initializing...</p>
              </div>
            </div>
         )}

         {viewMode === ViewMode.REGISTRY && (
            <RegistryView index={provenanceIndex} />
         )}

         {viewMode === ViewMode.AGENTS && (
            <AgentLibraryView 
               agents={vault} 
               onSelectAgent={handleSelectAgent} 
            />
         )}
      </div>
    </div>
  );
}

export default App;
