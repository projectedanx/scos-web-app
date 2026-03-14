
import React, { useState, useMemo } from 'react';
import { 
  CognitiveContract, 
  SovereignAgentManifest, 
  ContractStatus, 
  ProjectAnchor, 
  AnchorType, 
  ProvenanceIndexEntry
} from '../types';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Target, 
  ShieldAlert, 
  Lock, 
  Users, 
  Calendar, 
  Save, 
  Edit3, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Bot,
  Search,
  ArrowRight
} from 'lucide-react';

import { useDialog } from '../contexts/DialogContext';

interface ContractBuilderViewProps {
  contracts: CognitiveContract[];
  agents: SovereignAgentManifest[];
  onSaveContract: (contract: CognitiveContract) => void;
  onDeleteContract: (id: string) => void;
  onRegisterProvenance: (entry: ProvenanceIndexEntry) => void;
}

export const ContractBuilderView: React.FC<ContractBuilderViewProps> = ({ 
  contracts, 
  agents, 
  onSaveContract, 
  onDeleteContract,
  onRegisterProvenance
}) => {
  const [selectedContract, setSelectedContract] = useState<CognitiveContract | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { confirm } = useDialog();
  
  // Search state for list view
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editForm, setEditForm] = useState<Partial<CognitiveContract>>({});
  const [newAnchorInput, setNewAnchorInput] = useState('');
  const [newAnchorType, setNewAnchorType] = useState<AnchorType>('GOAL');

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.missionStatement.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [contracts, searchQuery]);

  const handleCreateNew = () => {
    setEditForm({
      id: crypto.randomUUID(),
      title: 'New Cognitive Contract',
      missionStatement: '',
      status: ContractStatus.DRAFT,
      anchors: [],
      assignedAgentNames: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setIsEditing(true);
    setSelectedContract(null);
  };

  const handleEdit = (contract: CognitiveContract) => {
    setEditForm({ ...contract });
    setIsEditing(true);
    setSelectedContract(contract);
  };

  const handleSave = () => {
    if (!editForm.title || !editForm.id) return;

    const finalContract: CognitiveContract = {
      id: editForm.id,
      title: editForm.title,
      missionStatement: editForm.missionStatement || '',
      status: editForm.status || ContractStatus.DRAFT,
      anchors: editForm.anchors || [],
      assignedAgentNames: editForm.assignedAgentNames || [],
      createdAt: editForm.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    onSaveContract(finalContract);
    
    // Provenance
    onRegisterProvenance({
      hash: `contract-${finalContract.id}-${Date.now()}`,
      agentName: 'Contract Architect',
      timestamp: Date.now(),
      sourceType: 'CONTRACT',
      snippet: `Contract: ${finalContract.title} (${finalContract.status})`,
      analysis: {
        wordCount: finalContract.missionStatement.split(/\s+/).length,
        sentiment: 'NEUTRAL',
        topics: [finalContract.status, 'WORK_ORDER']
      }
    });

    setIsEditing(false);
    setSelectedContract(null);
  };

  const handleAddAnchor = () => {
    if (!newAnchorInput.trim()) return;
    setEditForm(prev => ({
      ...prev,
      anchors: [
        ...(prev.anchors || []),
        {
          id: crypto.randomUUID(),
          type: newAnchorType,
          description: newAnchorInput.trim()
        }
      ]
    }));
    setNewAnchorInput('');
  };

  const handleRemoveAnchor = (id: string) => {
    setEditForm(prev => ({
      ...prev,
      anchors: prev.anchors?.filter(a => a.id !== id)
    }));
  };

  const toggleAgentAssignment = (agentName: string) => {
    setEditForm(prev => {
      const current = prev.assignedAgentNames || [];
      const updated = current.includes(agentName)
        ? current.filter(n => n !== agentName)
        : [...current, agentName];
      return { ...prev, assignedAgentNames: updated };
    });
  };

  const getStatusColor = (status?: ContractStatus) => {
    switch (status) {
      case ContractStatus.ACTIVE: return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50';
      case ContractStatus.COMPLETED: return 'text-blue-400 bg-blue-950/30 border-blue-900/50';
      case ContractStatus.TERMINATED: return 'text-red-400 bg-red-950/30 border-red-900/50';
      default: return 'text-zinc-400 bg-zinc-900/50 border-zinc-800';
    }
  };

  const getAnchorIcon = (type: AnchorType) => {
    switch (type) {
      case 'GOAL': return <Target className="w-4 h-4 text-emerald-500" />;
      case 'CONSTRAINT': return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'INVARIANT': return <Lock className="w-4 h-4 text-blue-500" />;
      case 'RED_TEAM': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-void text-zinc-100 overflow-hidden">
      
      {/* LEFT PANE: Contract List */}
      <div className="w-80 border-r border-zinc-900 bg-zinc-950/50 flex flex-col z-10 shrink-0">
        <div className="p-6 border-b border-zinc-900">
           <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
             <Briefcase className="w-6 h-6 text-sovereign" />
             Contracts
           </h2>
           <p className="text-xs text-zinc-500 font-mono">Cognitive Work Orders</p>
        </div>

        <div className="p-4 border-b border-zinc-900">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                 type="text" 
                 placeholder="Search contracts..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:border-sovereign outline-none"
              />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
           <button 
             onClick={handleCreateNew}
             className="w-full flex items-center justify-center gap-2 bg-sovereign hover:bg-sovereign/90 text-black font-bold py-2 rounded mb-4 transition-all"
           >
              <Plus className="w-4 h-4" />
              <span>NEW CONTRACT</span>
           </button>

           {filteredContracts.map(contract => (
              <div 
                 key={contract.id}
                 onClick={() => handleEdit(contract)}
                 className={`p-4 rounded-xl border cursor-pointer transition-all hover:bg-zinc-900 ${
                    selectedContract?.id === contract.id 
                       ? 'bg-zinc-900 border-sovereign/50 shadow-lg' 
                       : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                 }`}
              >
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{contract.title}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${getStatusColor(contract.status)}`}>
                       {contract.status}
                    </span>
                 </div>
                 <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                       <Users className="w-3 h-3" /> {contract.assignedAgentNames.length}
                    </span>
                    <span className="flex items-center gap-1">
                       <Target className="w-3 h-3" /> {contract.anchors.length}
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                       <Calendar className="w-3 h-3" /> {new Date(contract.updatedAt).toLocaleDateString()}
                    </span>
                 </div>
              </div>
           ))}
           
           {filteredContracts.length === 0 && (
              <div className="text-center py-8 text-zinc-600 italic text-xs">
                 No active contracts found.
              </div>
           )}
        </div>
      </div>

      {/* CENTER PANE: Workspace */}
      <div className="flex-1 bg-void relative overflow-y-auto custom-scrollbar">
         {isEditing ? (
            <div className="max-w-5xl mx-auto px-8 py-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2">
               
               {/* Header Controls */}
               <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
                  <div>
                     <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {editForm.id ? 'Contract Editor' : 'New Contract'}
                     </h2>
                     <p className="text-sm text-zinc-500 font-mono">Define Scope, Anchors, and Assigned Personnel</p>
                  </div>
                  <div className="flex gap-3">
                     <button 
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                     >
                        Cancel
                     </button>
                     {editForm.id && (
                        <button 
                           onClick={() => {
                              confirm('Delete Contract?', async () => {
                                 onDeleteContract(editForm.id!);
                                 setIsEditing(false);
                              });
                           }}
                           className="flex items-center gap-2 px-4 py-2 bg-red-950/30 text-red-400 border border-red-900/50 rounded hover:bg-red-900/50 transition-colors"
                        >
                           <Trash2 className="w-4 h-4" />
                           <span className="text-xs font-bold">DELETE</span>
                        </button>
                     )}
                     <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-sovereign hover:bg-sovereign/90 text-black font-bold rounded shadow-lg shadow-sovereign/20 transition-all"
                     >
                        <Save className="w-4 h-4" />
                        <span>SAVE CONTRACT</span>
                     </button>
                  </div>
               </div>

               {/* Meta Info */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Contract Title</label>
                        <input 
                           type="text" 
                           value={editForm.title}
                           onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                           className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-sovereign outline-none"
                           placeholder="e.g. Project Chimera Initiation"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Mission Statement</label>
                        <textarea 
                           value={editForm.missionStatement}
                           onChange={(e) => setEditForm(prev => ({ ...prev, missionStatement: e.target.value }))}
                           className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-zinc-300 min-h-[100px] resize-y focus:border-sovereign outline-none"
                           placeholder="Define the high-level objective..."
                        />
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Contract Status</label>
                        <div className="space-y-2">
                           {(['DRAFT', 'ACTIVE', 'COMPLETED', 'TERMINATED'] as ContractStatus[]).map(status => (
                              <button
                                 key={status}
                                 onClick={() => setEditForm(prev => ({ ...prev, status }))}
                                 className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-bold border transition-all flex items-center justify-between ${
                                    editForm.status === status 
                                       ? getStatusColor(status) + ' ring-1 ring-white/10'
                                       : 'bg-zinc-900/30 border-transparent text-zinc-500 hover:bg-zinc-900'
                                 }`}
                              >
                                 {status}
                                 {editForm.status === status && <CheckCircle2 className="w-3 h-3" />}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="border-t border-zinc-900 my-2"></div>

               {/* Anchors & Team Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[400px]">
                  
                  {/* Anchors Column */}
                  <div className="flex flex-col">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                           <Target className="w-4 h-4 text-cognitive" />
                           Project Anchors
                        </h3>
                        <span className="text-xs text-zinc-500 font-mono">Invariants & Goals</span>
                     </div>

                     <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex-1 flex flex-col">
                        <div className="flex gap-2 mb-4">
                           <select 
                              value={newAnchorType}
                              onChange={(e) => setNewAnchorType(e.target.value as AnchorType)}
                              className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded px-2 outline-none"
                           >
                              <option value="GOAL">GOAL</option>
                              <option value="CONSTRAINT">CONSTRAINT</option>
                              <option value="INVARIANT">INVARIANT</option>
                              <option value="RED_TEAM">RED TEAM</option>
                           </select>
                           <input 
                              type="text" 
                              value={newAnchorInput}
                              onChange={(e) => setNewAnchorInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddAnchor()}
                              placeholder="Add specific anchor..."
                              className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-cognitive outline-none"
                           />
                           <button onClick={handleAddAnchor} disabled={!newAnchorInput.trim()} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded">
                              <Plus className="w-4 h-4" />
                           </button>
                        </div>

                        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 max-h-[400px]">
                           {editForm.anchors?.map((anchor) => (
                              <div key={anchor.id} className="flex items-start gap-3 bg-zinc-950/50 p-3 rounded border border-zinc-800/50 group hover:border-zinc-700 transition-colors">
                                 <div className="mt-0.5" title={anchor.type}>{getAnchorIcon(anchor.type)}</div>
                                 <div className="flex-1">
                                    <p className="text-sm text-zinc-300">{anchor.description}</p>
                                    <span className="text-[10px] text-zinc-600 font-mono uppercase">{anchor.type}</span>
                                 </div>
                                 <button onClick={() => handleRemoveAnchor(anchor.id)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-3 h-3" />
                                 </button>
                              </div>
                           ))}
                           {(!editForm.anchors || editForm.anchors.length === 0) && (
                              <div className="text-center py-10 text-zinc-600 italic text-xs">
                                 No anchors defined.
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Team Column */}
                  <div className="flex flex-col">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                           <Users className="w-4 h-4 text-sovereign" />
                           Assigned Swarm
                        </h3>
                        <span className="text-xs text-zinc-500 font-mono">
                           {editForm.assignedAgentNames?.length} Active Units
                        </span>
                     </div>

                     <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex-1 flex flex-col">
                        <div className="mb-2 pb-2 border-b border-zinc-800/50">
                           <p className="text-[10px] text-zinc-500 font-mono uppercase mb-2">Vault Roster</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2 overflow-y-auto custom-scrollbar flex-1 max-h-[400px]">
                           {agents.map(agent => {
                              const isAssigned = editForm.assignedAgentNames?.includes(agent.identity.name);
                              return (
                                 <button
                                    key={agent.identity.name}
                                    onClick={() => toggleAgentAssignment(agent.identity.name)}
                                    className={`flex items-center justify-between p-3 rounded border transition-all text-left group ${
                                       isAssigned 
                                          ? 'bg-sovereign/10 border-sovereign/30' 
                                          : 'bg-zinc-950 border-zinc-800/50 hover:border-zinc-700'
                                    }`}
                                 >
                                    <div className="flex items-center gap-3">
                                       <Bot className={`w-4 h-4 ${isAssigned ? 'text-sovereign' : 'text-zinc-600'}`} />
                                       <div>
                                          <div className={`text-sm font-bold ${isAssigned ? 'text-white' : 'text-zinc-400'}`}>
                                             {agent.identity.name}
                                          </div>
                                          <div className="text-[10px] text-zinc-600 font-mono">{agent.identity.designation}</div>
                                       </div>
                                    </div>
                                    {isAssigned ? (
                                       <CheckCircle2 className="w-4 h-4 text-sovereign" />
                                    ) : (
                                       <Plus className="w-4 h-4 text-zinc-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                 </button>
                              );
                           })}
                           {agents.length === 0 && (
                              <div className="text-center py-10 text-zinc-600 italic text-xs">
                                 Vault empty. Fabricate agents first.
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
               <Briefcase className="w-16 h-16 opacity-20 mb-4" />
               <h3 className="text-lg font-bold text-zinc-400">Select or Create a Contract</h3>
               <p className="text-sm font-mono mt-2">Manage cognitive work orders and swarm assignments.</p>
               <button onClick={handleCreateNew} className="mt-6 flex items-center gap-2 text-sovereign hover:underline text-xs font-bold uppercase tracking-widest">
                  Initialize Project <ArrowRight className="w-3 h-3" />
               </button>
            </div>
         )}
      </div>
    </div>
  );
};
