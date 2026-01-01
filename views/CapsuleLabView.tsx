
import React, { useState, useEffect } from 'react';
import { Database, Loader2, FileText, Download, Code, Globe, Zap, ChevronRight, History, Eye, Save, FolderOpen, Trash2, Tag, Plus, X, Sparkles, Check, Edit3, Link, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { distillCapsule, analyzeDocument } from '../services/geminiService';
import { compileCapsuleHtml } from '../services/capsuleCompiler';
import { ContextCapsule } from '../types';

interface CapsuleDraft {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  capsuleResult: ContextCapsule | null;
}

const DRAFTS_KEY = 'sovereign_capsule_drafts';

export const CapsuleLabView: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [capsule, setCapsule] = useState<ContextCapsule | null>(null);
  
  // Tagging State
  const [newTagInput, setNewTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isAnalyzingTags, setIsAnalyzingTags] = useState(false);

  // Metadata Editor State
  const [isMetaEditorOpen, setIsMetaEditorOpen] = useState(false);
  const [newSourcePaper, setNewSourcePaper] = useState('');
  
  // Persistent Drafts
  const [drafts, setDrafts] = useState<CapsuleDraft[]>(() => {
    try {
      const saved = localStorage.getItem(DRAFTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleDistill = async () => {
    if (!inputValue.trim()) return;
    setIsProcessing(true);
    setSuggestedTags([]); 
    try {
      const result = await distillCapsule(inputValue);
      setCapsule(result);
    } catch (e) {
      console.error(e);
      alert("Distillation failed. Check console.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveDraft = () => {
    if (!inputValue.trim() && !capsule) return;

    const title = capsule?.meta.title || (inputValue.slice(0, 40).replace(/\n/g, ' ') + (inputValue.length > 40 ? '...' : '')) || "Empty Draft";
    
    const newDraft: CapsuleDraft = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      title,
      content: inputValue,
      capsuleResult: capsule
    };

    const updatedDrafts = [newDraft, ...drafts];
    setDrafts(updatedDrafts);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));
  };

  const handleLoadDraft = (draft: CapsuleDraft) => {
    if (confirm("Load draft? Current unsaved changes will be lost.")) {
      setInputValue(draft.content);
      setCapsule(draft.capsuleResult);
      setSuggestedTags([]);
    }
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this draft permanently?")) {
      const updatedDrafts = drafts.filter(d => d.id !== id);
      setDrafts(updatedDrafts);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));
    }
  };

  // --- Metadata Management ---

  const handleMetaUpdate = (field: keyof ContextCapsule['meta'], value: string) => {
    if (!capsule) return;
    setCapsule({
      ...capsule,
      meta: {
        ...capsule.meta,
        [field]: value
      }
    });
  };

  const handleAddSourcePaper = () => {
    if (!capsule || !newSourcePaper.trim()) return;
    setCapsule({
      ...capsule,
      meta: {
        ...capsule.meta,
        source_papers: [...(capsule.meta.source_papers || []), newSourcePaper.trim()]
      }
    });
    setNewSourcePaper('');
  };

  const handleRemoveSourcePaper = (idx: number) => {
    if (!capsule) return;
    const newPapers = [...(capsule.meta.source_papers || [])];
    newPapers.splice(idx, 1);
    setCapsule({
      ...capsule,
      meta: {
        ...capsule.meta,
        source_papers: newPapers
      }
    });
  };

  // --- Tag Management ---

  const handleAddTag = (tagToAdd: string) => {
    if (!capsule || !tagToAdd.trim()) return;
    const cleanTag = tagToAdd.trim();
    // Case-insensitive duplicate check
    if ((capsule.meta.tags || []).some(t => t.toLowerCase() === cleanTag.toLowerCase())) return;

    setCapsule({
      ...capsule,
      meta: {
        ...capsule.meta,
        tags: [...(capsule.meta.tags || []), cleanTag]
      }
    });
    setNewTagInput('');
    // Remove from suggestions if present (case-insensitive)
    setSuggestedTags(prev => prev.filter(t => t.toLowerCase() !== cleanTag.toLowerCase()));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!capsule) return;
    setCapsule({
      ...capsule,
      meta: {
        ...capsule.meta,
        tags: (capsule.meta.tags || []).filter(t => t !== tagToRemove)
      }
    });
  };

  const handleAnalyzeForTags = async () => {
    if (!capsule) return;
    setIsAnalyzingTags(true);
    try {
      // Create a dense context string for analysis, including deeper sections for better relevance
      const context = `
        Title: ${capsule.meta.title}
        Overview: ${capsule.sections.overview?.intro || ''}
        Key Concepts: ${capsule.sections.key_concepts?.cards.map(c => c.title).join(', ') || ''}
        Workflow Steps: ${capsule.sections.workflow?.steps.map(s => s.label).join(', ') || ''}
        Resilience Modes: ${capsule.sections.resilience?.failure_modes.map(f => f.name).join(', ') || ''}
      `;
      
      const analysis = await analyzeDocument(context);
      
      // Filter out tags that already exist (case-insensitive)
      const currentTags = (capsule.meta.tags || []).map(t => t.toLowerCase());
      const novelTags = analysis.topics.filter(t => !currentTags.includes(t.toLowerCase()));
      
      setSuggestedTags(novelTags);
      
      if (novelTags.length === 0) {
        // Optional: User feedback if no new tags found
        console.log("No novel tags discovered.");
      }
    } catch (e) {
      console.error("Tag analysis failed", e);
    } finally {
      setIsAnalyzingTags(false);
    }
  };

  const handleAcceptAllTags = () => {
    if (!capsule) return;
    const currentTags = capsule.meta.tags || [];
    // Combine and Dedupe
    const combined = [...currentTags];
    suggestedTags.forEach(st => {
       if (!combined.some(ct => ct.toLowerCase() === st.toLowerCase())) {
          combined.push(st);
       }
    });

    setCapsule({
       ...capsule,
       meta: { ...capsule.meta, tags: combined }
    });
    setSuggestedTags([]);
  };

  // --- Exports ---

  const handleDownloadHtml = () => {
    if (!capsule) return;
    const html = compileCapsuleHtml(capsule);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${capsule.meta.id || 'capsule'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!capsule) return;
    const blob = new Blob([JSON.stringify(capsule, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${capsule.meta.id || 'capsule'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
      {!capsule ? (
        <div className="max-w-3xl mx-auto space-y-12">
          <div>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4 text-white">Context Capsule Lab</h2>
              <p className="text-zinc-400">
                Distill raw research or Agent Identities into portable, immutable knowledge nodes.
                Mint static HTML artifacts for public dissemination.
              </p>
            </div>

            <div className="relative group mb-6">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-void-light rounded-xl border border-zinc-800 p-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste research paper content, markdown notes, or an Agent Manifest JSON here..."
                  className="w-full bg-transparent text-sm font-mono text-zinc-300 p-4 min-h-[300px] outline-none resize-y placeholder:text-zinc-700"
                />
                <div className="px-4 py-3 border-t border-zinc-800 bg-black/20 flex justify-between items-center">
                  <button
                     onClick={handleSaveDraft}
                     disabled={!inputValue}
                     className="flex items-center space-x-2 text-zinc-400 hover:text-white px-3 py-1.5 rounded hover:bg-zinc-800 transition-colors text-xs font-mono disabled:opacity-30"
                  >
                     <Save className="w-4 h-4" />
                     <span>SAVE DRAFT</span>
                  </button>

                  <button
                    onClick={handleDistill}
                    disabled={isProcessing || !inputValue}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>DISTILLING...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        <span>GENERATE CAPSULE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Drafts Section */}
          {drafts.length > 0 && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="flex items-center space-x-2 mb-4 text-zinc-500 border-b border-zinc-800 pb-2">
                 <FolderOpen className="w-4 h-4" />
                 <h3 className="text-xs font-mono uppercase tracking-widest">Saved Drafts</h3>
              </div>
              <div className="grid gap-3">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => handleLoadDraft(draft)}
                    className="w-full flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/30 rounded-lg group transition-all cursor-pointer"
                  >
                     <div className="flex items-center space-x-4 overflow-hidden">
                        <div className={`p-2 rounded transition-colors shrink-0 ${draft.capsuleResult ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                           {draft.capsuleResult ? <Zap className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                           <h4 className="font-bold text-sm text-zinc-200 group-hover:text-white truncate">{draft.title}</h4>
                           <div className="flex items-center space-x-2 text-xs text-zinc-500 font-mono mt-0.5">
                             <span>{new Date(draft.timestamp).toLocaleDateString()}</span>
                             <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                             <span>{draft.capsuleResult ? 'COMPILED' : 'RAW TEXT'}</span>
                           </div>
                        </div>
                     </div>
                     <button 
                        onClick={(e) => handleDeleteDraft(draft.id, e)}
                        className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h2 className="text-2xl font-bold text-white">{capsule.meta.title}</h2>
                 <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                    {capsule.meta.status}
                 </span>
              </div>
              <p className="text-sm text-zinc-500 font-mono">{capsule.meta.id}</p>
            </div>
            <div className="flex flex-wrap gap-3">
               <button
                  onClick={handleSaveDraft}
                  className="flex items-center space-x-2 text-zinc-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors border border-transparent hover:border-zinc-800 rounded"
               >
                 <Save className="w-4 h-4" />
                 <span>Save Draft</span>
               </button>
               <div className="w-px h-6 bg-zinc-800 self-center hidden md:block"></div>
               <button
                  onClick={() => setCapsule(null)}
                  className="text-zinc-500 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
               >
                 Back to Lab
               </button>
               <button
                  onClick={handleDownloadJson}
                  className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded border border-zinc-700 text-sm transition-colors"
               >
                 <Code className="w-4 h-4" />
                 <span>JSON</span>
               </button>
               <button
                  onClick={handleDownloadHtml}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold text-sm shadow-lg shadow-emerald-900/20 transition-colors"
               >
                 <Globe className="w-4 h-4" />
                 <span>MINT HTML ARTIFACT</span>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Metadata Editor */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
               <div 
                 className="flex items-center justify-between mb-4 cursor-pointer select-none"
                 onClick={() => setIsMetaEditorOpen(!isMetaEditorOpen)}
               >
                  <div className="flex items-center space-x-2 text-zinc-400">
                      <Edit3 className="w-4 h-4" />
                      <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Metadata Editor</h3>
                  </div>
                  {isMetaEditorOpen ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
               </div>

               {isMetaEditorOpen && (
                 <div className="space-y-4 pt-2 border-t border-zinc-800/50">
                    <div className="space-y-3">
                        <div>
                           <label className="text-[10px] text-zinc-500 font-mono uppercase mb-1 block">Capsule Title</label>
                           <input 
                              type="text" 
                              value={capsule.meta.title}
                              onChange={(e) => handleMetaUpdate('title', e.target.value)}
                              className="w-full bg-zinc-950/50 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                           />
                        </div>
                        
                        <div>
                           <label className="text-[10px] text-zinc-500 font-mono uppercase mb-1 block">Short Tagline</label>
                           <input 
                              type="text" 
                              value={capsule.meta.short_tagline}
                              onChange={(e) => handleMetaUpdate('short_tagline', e.target.value)}
                              className="w-full bg-zinc-950/50 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500 outline-none"
                           />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-[10px] text-zinc-500 font-mono uppercase mb-1 block">Primary Pill</label>
                              <input 
                                  type="text" 
                                  value={capsule.meta.primary_pill}
                                  onChange={(e) => handleMetaUpdate('primary_pill', e.target.value)}
                                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                              />
                           </div>
                           <div>
                              <label className="text-[10px] text-zinc-500 font-mono uppercase mb-1 block">Worldview Ref</label>
                              <input 
                                  type="text" 
                                  value={capsule.meta.worldview_ref || ''}
                                  onChange={(e) => handleMetaUpdate('worldview_ref', e.target.value)}
                                  placeholder="Optional..."
                                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-400 focus:border-indigo-500 outline-none"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-[10px] text-zinc-500 font-mono uppercase mb-1 block">CTA Label</label>
                              <input 
                                  type="text" 
                                  value={capsule.meta.hero_cta_label}
                                  onChange={(e) => handleMetaUpdate('hero_cta_label', e.target.value)}
                                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                              />
                           </div>
                           <div>
                              <label className="text-[10px] text-zinc-500 font-mono uppercase mb-1 block">CTA Target</label>
                              <input 
                                  type="text" 
                                  value={capsule.meta.hero_cta_target}
                                  onChange={(e) => handleMetaUpdate('hero_cta_target', e.target.value)}
                                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-400 focus:border-indigo-500 outline-none"
                              />
                           </div>
                        </div>

                        <div>
                           <label className="text-[10px] text-zinc-500 font-mono uppercase mb-2 block flex justify-between">
                              <span>Source Papers / References</span>
                              <span className="text-zinc-600">{(capsule.meta.source_papers || []).length} refs</span>
                           </label>
                           <div className="space-y-2 mb-2">
                              {(capsule.meta.source_papers || []).map((paper, idx) => (
                                 <div key={idx} className="flex items-center justify-between text-xs bg-zinc-950/30 px-2 py-1.5 rounded border border-zinc-800/50 group">
                                    <span className="truncate text-zinc-400 max-w-[90%]">{paper}</span>
                                    <button onClick={() => handleRemoveSourcePaper(idx)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <X className="w-3 h-3" />
                                    </button>
                                 </div>
                              ))}
                           </div>
                           <div className="flex items-center space-x-2">
                              <Link className="w-4 h-4 text-zinc-600 shrink-0" />
                              <input 
                                 type="text"
                                 value={newSourcePaper}
                                 onChange={(e) => setNewSourcePaper(e.target.value)}
                                 onKeyDown={(e) => e.key === 'Enter' && handleAddSourcePaper()}
                                 placeholder="Add citation..."
                                 className="flex-1 bg-transparent border-b border-zinc-800 text-xs text-zinc-300 py-1 outline-none focus:border-zinc-500"
                              />
                              <button onClick={handleAddSourcePaper} disabled={!newSourcePaper} className="text-zinc-500 hover:text-white disabled:opacity-0">
                                 <Plus className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                    </div>
                 </div>
               )}
            </div>

            {/* Semantic Tagging Engine */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-2 text-zinc-400">
                    <Tag className="w-4 h-4" />
                    <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Semantic Tagging Engine</h3>
                 </div>
                 <div className="flex gap-2">
                   {suggestedTags.length > 0 && (
                      <button 
                        onClick={handleAcceptAllTags}
                        className="flex items-center space-x-1.5 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded transition-colors"
                      >
                         <CheckCircle2 className="w-3 h-3" />
                         <span>ACCEPT ALL</span>
                      </button>
                   )}
                   <button 
                     onClick={handleAnalyzeForTags}
                     disabled={isAnalyzingTags}
                     className="flex items-center space-x-1.5 text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded transition-colors disabled:opacity-50"
                   >
                      {isAnalyzingTags ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>{isAnalyzingTags ? 'ANALYZING...' : 'AI SUGGEST TAGS'}</span>
                   </button>
                 </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                 {(capsule.meta.tags || []).map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-200 text-xs border border-zinc-700 group animate-in zoom-in duration-200">
                       <span>{tag}</span>
                       <button 
                         onClick={() => handleRemoveTag(tag)}
                         className="text-zinc-500 hover:text-red-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                          <X className="w-3 h-3" />
                       </button>
                    </span>
                 ))}
                 <div className="flex items-center">
                    <input 
                      type="text" 
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag(newTagInput)}
                      placeholder="Add manual tag..."
                      className="bg-transparent border-b border-zinc-700 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-indigo-500 outline-none w-32 py-1 px-1 transition-colors"
                    />
                    <button 
                      onClick={() => handleAddTag(newTagInput)}
                      disabled={!newTagInput.trim()}
                      className="ml-2 text-zinc-500 hover:text-white disabled:opacity-0 transition-all"
                    >
                       <Plus className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              {suggestedTags.length > 0 && (
                 <div className="border-t border-zinc-800 pt-3 animate-in slide-in-from-top-1">
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-[10px] text-indigo-400/80 font-mono flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          SUGGESTED BY DEEP ANALYSIS
                       </p>
                       <button onClick={() => setSuggestedTags([])} className="text-[10px] text-zinc-600 hover:text-zinc-400">CLEAR</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {suggestedTags.map((tag, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleAddTag(tag)}
                            className="flex items-center space-x-1 px-2 py-1 rounded border border-dashed border-indigo-500/30 text-xs text-indigo-300 hover:bg-indigo-500/10 transition-colors animate-in fade-in"
                          >
                             <span>{tag}</span>
                             <Plus className="w-3 h-3" />
                          </button>
                       ))}
                    </div>
                 </div>
              )}
            </div>
          </div>

          {/* Live Artifact Preview Pane */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-zinc-500 text-xs font-mono uppercase tracking-wider pl-1">
               <Eye className="w-3 h-3" />
               <span>Live Artifact Preview</span>
            </div>
            
            {/* The Preview Window - Styled to mimic the Slate theme of the HTML artifact */}
            <div className="w-full bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
               {/* Browser Chrome Mimic */}
               <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2 flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                  <div className="flex-1 text-center">
                     <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-3 py-0.5 rounded border border-slate-800/50">
                        {capsule.meta.id}.html
                     </span>
                  </div>
               </div>

               {/* Scrollable Content Area */}
               <div className="p-8 md:p-12 max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
                  
                  {/* Capsule Header */}
                  <div className="border-b border-slate-800 pb-8 mb-10">
                     <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-400/40 font-medium">
                           {capsule.meta.primary_pill}
                        </span>
                        <div className="flex gap-2">
                           {(capsule.meta.tags || []).slice(0,3).map((tag, i) => (
                              <span key={i} className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                                 {tag}
                              </span>
                           ))}
                        </div>
                     </div>
                     <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">
                        {capsule.meta.title}
                     </h1>
                     <p className="text-slate-400 text-lg font-light">
                        {capsule.meta.short_tagline}
                     </p>
                  </div>

                  {/* Overview Section */}
                  {capsule.sections.overview && (
                     <div className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-6">
                           <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                              Overview
                           </h2>
                           <p className="text-slate-300 leading-relaxed text-lg font-light">
                              {capsule.sections.overview.intro}
                           </p>
                           {(capsule.sections.overview.hero_pills && capsule.sections.overview.hero_pills.length > 0) && (
                              <div className="flex flex-wrap gap-2">
                                 {capsule.sections.overview.hero_pills.map((pill, i) => (
                                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-sky-500/15 text-sky-100 border border-sky-400/40">
                                       {pill}
                                    </span>
                                 ))}
                              </div>
                           )}
                        </div>
                        
                        {/* Summary Card */}
                        <div className="lg:col-span-1">
                           {capsule.sections.overview.summary_card && (
                              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 sticky top-4">
                                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    {capsule.sections.overview.summary_card.label}
                                 </p>
                                 <h3 className="text-lg font-semibold text-white">
                                    {capsule.sections.overview.summary_card.title}
                                 </h3>
                                 <p className="text-sm text-slate-300 leading-relaxed">
                                    {capsule.sections.overview.summary_card.body}
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Key Concepts Section */}
                  {capsule.sections.key_concepts && (
                     <div className="pt-10 border-t border-slate-800/50">
                        <div className="mb-8">
                           <h2 className="text-2xl font-semibold text-white mb-2">
                              {capsule.sections.key_concepts.title}
                           </h2>
                           <p className="text-slate-400">
                              {capsule.sections.key_concepts.intro}
                           </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {(capsule.sections.key_concepts.cards || []).map((card, idx) => (
                              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-colors">
                                 <h3 className="font-semibold text-white mb-3 text-lg">
                                    {card.title}
                                 </h3>
                                 <p className="text-sm text-slate-300 leading-relaxed">
                                    {card.body}
                                 </p>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Footer Hint */}
                  <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-600 font-mono">
                     PREVIEW MODE // DOWNLOAD HTML FOR FULL INTERACTIVITY
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
