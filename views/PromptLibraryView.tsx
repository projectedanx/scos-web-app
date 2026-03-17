
import React, { useState, useMemo } from 'react';
import { SovereignPrompt, SovereignAgentManifest, ProvenanceIndexEntry } from '../types';
import { BookTemplate, Search, Filter, Plus, Tag, Folder, Hash, Calendar, Copy, Edit3, Trash2, Bot, Link, Check, X, Save, AlertCircle } from 'lucide-react';

interface PromptLibraryViewProps {
  prompts: SovereignPrompt[];
  agents: SovereignAgentManifest[];
  onSavePrompt: (prompt: SovereignPrompt) => void;
  onDeletePrompt: (id: string) => void;
  onRegisterProvenance: (entry: ProvenanceIndexEntry) => void;
}

/**
 * The PromptLibraryView function.
 * @param {
 *   prompts,
 *   agents,
 *   onSavePrompt,
 *   onDeletePrompt,
 *   onRegisterProvenance
 * } - The {
 *   prompts,
 *   agents,
 *   onSavePrompt,
 *   onDeletePrompt,
 *   onRegisterProvenance
 * } parameter.
 * @returns The resulting value.
 */
export const PromptLibraryView: React.FC<PromptLibraryViewProps> = ({ 
  prompts, 
  agents, 
  onSavePrompt, 
  onDeletePrompt,
  onRegisterProvenance
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Partial<SovereignPrompt>>({});
  
  // Derived Categories
  const categories = useMemo(() => {
    const cats = new Set(prompts.map(p => p.category));
    return Array.from(cats).sort();
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchCat = selectedCategory ? p.category === selectedCategory : true;
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [prompts, selectedCategory, searchQuery]);

  const handleCreateNew = () => {
    setEditingPrompt({
      id: crypto.randomUUID(),
      title: '',
      content: '',
      category: 'General',
      subcategory: '',
      tags: [],
      linkedAgentNames: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1
    });
    setIsEditorOpen(true);
  };

  const handleEdit = (prompt: SovereignPrompt) => {
    setEditingPrompt({ ...prompt });
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (!editingPrompt.title || !editingPrompt.content) return;

    const finalPrompt: SovereignPrompt = {
      id: editingPrompt.id || crypto.randomUUID(),
      title: editingPrompt.title || 'Untitled Prompt',
      content: editingPrompt.content || '',
      category: editingPrompt.category || 'General',
      subcategory: editingPrompt.subcategory,
      description: editingPrompt.description,
      tags: editingPrompt.tags || [],
      linkedAgentNames: editingPrompt.linkedAgentNames || [],
      createdAt: editingPrompt.createdAt || Date.now(),
      updatedAt: Date.now(),
      version: (editingPrompt.version || 0) + 1
    };

    onSavePrompt(finalPrompt);
    
    // Provenance Registration
    onRegisterProvenance({
      hash: `prompt-${finalPrompt.id}-${Date.now()}`,
      agentName: 'Sovereign Architect',
      timestamp: Date.now(),
      sourceType: 'PROMPT_TEMPLATE',
      snippet: `Prompt Created/Updated: ${finalPrompt.title} [Cat: ${finalPrompt.category}]`,
      analysis: {
        wordCount: finalPrompt.content.split(/\s+/).length,
        sentiment: 'NEUTRAL',
        topics: finalPrompt.tags
      }
    });

    setIsEditorOpen(false);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    // Could add toast here
  };

  const toggleAgentLink = (agentName: string) => {
    setEditingPrompt(prev => {
      const current = prev.linkedAgentNames || [];
      const updated = current.includes(agentName)
        ? current.filter(n => n !== agentName)
        : [...current, agentName];
      return { ...prev, linkedAgentNames: updated };
    });
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val && !editingPrompt.tags?.includes(val)) {
        setEditingPrompt(prev => ({
          ...prev,
          tags: [...(prev.tags || []), val]
        }));
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tag: string) => {
    setEditingPrompt(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag)
    }));
  };

  return (
    <div className="flex h-screen bg-void text-zinc-100 overflow-hidden">
      
      {/* LEFT PANE: Categories */}
      <div className="w-64 border-r border-zinc-900 bg-zinc-950/50 flex flex-col z-10 shrink-0">
        <div className="p-6 border-b border-zinc-900">
           <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
             <BookTemplate className="w-6 h-6 text-sovereign" />
             Prompt Lib
           </h2>
           <p className="text-xs text-zinc-500 font-mono">Sovereign Pluriversal Registry</p>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
           <button 
             onClick={() => setSelectedCategory(null)}
             className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                selectedCategory === null ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
             }`}
           >
              <div className="flex items-center gap-2">
                 <Folder className="w-4 h-4" />
                 <span>ALL PROMPTS</span>
              </div>
              <span className="text-xs opacity-50">{prompts.length}</span>
           </button>

           <div className="my-2 border-t border-zinc-900"></div>
           <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase mb-2">Categories</p>

           {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                   selectedCategory === cat ? 'bg-zinc-900 text-white border-l-2 border-sovereign' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border-l-2 border-transparent'
                }`}
              >
                 <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{cat}</span>
                 </div>
                 <span className="text-xs opacity-50">{prompts.filter(p => p.category === cat).length}</span>
              </button>
           ))}
        </div>

        <div className="p-4 border-t border-zinc-900">
           <button 
             onClick={handleCreateNew}
             className="w-full flex items-center justify-center gap-2 bg-sovereign hover:bg-sovereign/90 text-black font-bold py-2 rounded transition-all"
           >
              <Plus className="w-4 h-4" />
              <span>NEW PROMPT</span>
           </button>
        </div>
      </div>

      {/* CENTER PANE: Grid */}
      <div className="flex-1 bg-void relative overflow-y-auto custom-scrollbar p-8">
         <div className="flex items-center justify-between mb-8 sticky top-0 z-20 bg-void/90 backdrop-blur pb-4 border-b border-zinc-900">
            <div>
               <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  {selectedCategory || "Global Registry"}
                  <span className="text-sm font-normal text-zinc-500 font-mono bg-zinc-900 px-2 py-0.5 rounded">
                     {filteredPrompts.length} Assets
                  </span>
               </h2>
            </div>
            <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
               <input 
                  type="text" 
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:border-sovereign outline-none transition-colors"
               />
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPrompts.length > 0 ? (
               filteredPrompts.map(prompt => (
                  <div key={prompt.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 hover:border-sovereign/30 transition-all group flex flex-col h-full">
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                           <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded w-fit mb-2">
                              {prompt.category} {prompt.subcategory && `// ${prompt.subcategory}`}
                           </span>
                           <h3 className="text-lg font-bold text-white group-hover:text-sovereign transition-colors line-clamp-1">{prompt.title}</h3>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleEdit(prompt)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
                              <Edit3 className="w-4 h-4" />
                           </button>
                           <button onClick={() => onDeletePrompt(prompt.id)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>

                     <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{prompt.description || "No description provided."}</p>
                     
                     <div className="bg-black/30 rounded border border-zinc-800/50 p-3 mb-4 font-mono text-xs text-zinc-300 overflow-hidden relative h-32">
                        <p className="line-clamp-6 opacity-70">{prompt.content}</p>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                              onClick={() => handleCopy(prompt.content)}
                              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded text-xs border border-zinc-600"
                           >
                              <Copy className="w-3 h-3" /> Copy
                           </button>
                        </div>
                     </div>

                     <div className="mt-auto space-y-3">
                        {/* Linked Agents */}
                        {prompt.linkedAgentNames.length > 0 && (
                           <div className="flex flex-wrap gap-1">
                              {prompt.linkedAgentNames.slice(0, 3).map((name, i) => (
                                 <div key={i} className="flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                    <Bot className="w-3 h-3" />
                                    <span className="truncate max-w-[80px]">{name}</span>
                                 </div>
                              ))}
                              {prompt.linkedAgentNames.length > 3 && (
                                 <span className="text-[10px] text-zinc-500 px-1">+{prompt.linkedAgentNames.length - 3}</span>
                              )}
                           </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-zinc-800/50">
                           <div className="flex gap-1 overflow-hidden">
                              {prompt.tags.slice(0, 3).map((tag, i) => (
                                 <span key={i} className="text-[10px] text-zinc-500 font-mono">#{tag}</span>
                              ))}
                           </div>
                           <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
                              <Calendar className="w-3 h-3" />
                              {new Date(prompt.updatedAt).toLocaleDateString()}
                           </div>
                        </div>
                     </div>
                  </div>
               ))
            ) : (
               <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-500">
                  <BookTemplate className="w-16 h-16 opacity-20 mb-4" />
                  <p className="text-sm font-mono">No prompts found in the sovereign registry.</p>
                  <button onClick={handleCreateNew} className="mt-4 text-sovereign hover:underline text-xs">Initialize First Asset</button>
               </div>
            )}
         </div>
      </div>

      {/* RIGHT PANE: Editor Modal */}
      {isEditorOpen && (
         <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-zinc-950 h-full border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
               {/* Editor Header */}
               <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-sovereign/10 rounded">
                        <Edit3 className="w-5 h-5 text-sovereign" />
                     </div>
                     <div>
                        <h3 className="text-sm font-bold text-white">Prompt Architect</h3>
                        <p className="text-xs text-zinc-500 font-mono">{editingPrompt.id ? 'EDITING ASSET' : 'NEW ASSET'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => setIsEditorOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               {/* Editor Body */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                  {/* Title & Desc */}
                  <div className="space-y-4">
                     <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Title</label>
                        <input 
                           type="text" 
                           value={editingPrompt.title}
                           onChange={(e) => setEditingPrompt({...editingPrompt, title: e.target.value})}
                           placeholder="e.g., Quantum Code Reviewer System Prompt"
                           className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-sovereign outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Description (Internal)</label>
                        <textarea 
                           value={editingPrompt.description}
                           onChange={(e) => setEditingPrompt({...editingPrompt, description: e.target.value})}
                           placeholder="Context about when to use this prompt..."
                           className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:border-sovereign outline-none h-20 resize-none"
                        />
                     </div>
                  </div>

                  {/* Taxonomy */}
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Category</label>
                        <input 
                           type="text" 
                           value={editingPrompt.category}
                           onChange={(e) => setEditingPrompt({...editingPrompt, category: e.target.value})}
                           list="cat-suggestions"
                           className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-sovereign outline-none"
                        />
                        <datalist id="cat-suggestions">
                           {categories.map(c => <option key={c} value={c} />)}
                        </datalist>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Subcategory</label>
                        <input 
                           type="text" 
                           value={editingPrompt.subcategory}
                           onChange={(e) => setEditingPrompt({...editingPrompt, subcategory: e.target.value})}
                           className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-sovereign outline-none"
                        />
                     </div>
                  </div>

                  {/* Main Content */}
                  <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 flex justify-between">
                        <span>Prompt Payload</span>
                        <span className="text-zinc-600 font-mono">{editingPrompt.content?.length || 0} chars</span>
                     </label>
                     <div className="relative">
                        <textarea 
                           value={editingPrompt.content}
                           onChange={(e) => setEditingPrompt({...editingPrompt, content: e.target.value})}
                           className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm font-mono text-zinc-300 focus:border-sovereign outline-none min-h-[300px] resize-y"
                           placeholder="Enter your prompt payload here..."
                        />
                     </div>
                  </div>

                  {/* Tags */}
                  <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Semantic Tags</label>
                     <div className="flex flex-wrap gap-2 mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded min-h-[40px]">
                        {(editingPrompt.tags || []).map(tag => (
                           <span key={tag} className="flex items-center gap-1 bg-black text-zinc-300 px-2 py-1 rounded text-xs border border-zinc-700">
                              {tag}
                              <button onClick={() => removeTag(tag)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                           </span>
                        ))}
                        <input 
                           type="text"
                           onKeyDown={handleTagInput}
                           placeholder="Type tag & enter..."
                           className="bg-transparent border-none outline-none text-xs text-white min-w-[100px] flex-1"
                        />
                     </div>
                  </div>

                  {/* Agent Linker */}
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
                     <div className="flex items-center gap-2 mb-3">
                        <Link className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-sm font-bold text-white">Agent Linkage</h4>
                     </div>
                     <p className="text-xs text-zinc-500 mb-3">Select Sovereign Agents from your Vault that are optimized for this prompt.</p>
                     
                     <div className="flex flex-col gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                        {agents.map(agent => {
                           const isLinked = (editingPrompt.linkedAgentNames || []).includes(agent.identity.name);
                           return (
                              <label
                                 key={agent.identity.name}
                                 className={`flex items-center gap-3 px-3 py-2 rounded text-xs text-left border transition-all cursor-pointer ${
                                    isLinked 
                                       ? 'bg-indigo-900/20 border-indigo-500/50 text-indigo-200' 
                                       : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                 }`}
                              >
                                 <input
                                    type="checkbox"
                                    checked={isLinked}
                                    onChange={() => toggleAgentLink(agent.identity.name)}
                                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                                 />
                                 <span className="truncate flex-1">{agent.identity.name}</span>
                              </label>
                           )
                        })}
                        {agents.length === 0 && (
                           <div className="text-center py-2 text-xs text-zinc-600 italic">No agents in Vault to link.</div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Footer */}
               <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                  <div className="text-xs text-zinc-500 font-mono">
                     {editingPrompt.id ? `ID: ${editingPrompt.id.substring(0,8)}...` : 'Unsaved Draft'}
                  </div>
                  <button 
                     onClick={handleSave}
                     className="flex items-center gap-2 bg-sovereign hover:bg-sovereign/90 text-black font-bold px-6 py-2 rounded transition-all"
                  >
                     <Save className="w-4 h-4" />
                     <span>SAVE ASSET</span>
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
