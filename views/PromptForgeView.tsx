
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Settings, Upload, Save, Copy, Check, FileText, Image as ImageIcon, Terminal, Code, Crosshair, Zap, ArrowRight, Loader2, RotateCcw, Trash2, ChevronDown, BookTemplate } from 'lucide-react';
import { PromptEngineConfig, PromptEngineType, GeneratedPrompt, TokenUsage, SovereignPrompt, ProvenanceIndexEntry } from '../types';
import { generateMetaPrompt } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import { useDialog } from '../contexts/DialogContext';

// --- Default Sovereign Engines ---

const DEFAULT_ENGINES: PromptEngineConfig[] = [
  {
    id: 'drp-default',
    type: 'DRP',
    name: 'Deep Research Prompt (DRP)',
    description: 'Generates recursive research protocols for complex topics.',
    icon: 'FileText',
    knowledgeContext: '',
    metaSystemPrompt: `
You are the DRP-ARCHITECT (Deep Research Protocol).
Your goal is to generate a comprehensive "Deep Research Prompt" based on the USER INTENT.

STRUCTURE OF GENERATED PROMPT:
1. MISSION STATEMENT: Clear objective.
2. VECTORS: 3-5 specific search queries or angles of attack.
3. SYNTHESIS PROTOCOL: How to merge conflicting data.
4. OUTPUT SCHEMA: JSON or Structured Markdown format.

TONE: Clinical, Academic, Exhaustive.
    `
  },
  {
    id: 'prp-default',
    type: 'PRP',
    name: 'Product Req. Prompt (PRP)',
    description: 'Converts abstract ideas into technical user stories and acceptance criteria.',
    icon: 'Crosshair',
    knowledgeContext: '',
    metaSystemPrompt: `
You are the PRP-ENGINEER (Product Requirement Protocol).
Generate a prompt that will act as a "Senior Product Manager".

STRUCTURE OF GENERATED PROMPT:
1. ROLE: Senior PM / Technical Architect.
2. INPUT ANALYSIS: Parse the user's raw idea.
3. OUTPUT ARTIFACTS: User Stories (Gherkin), Acceptance Criteria, Edge Cases, Database Schema Draft.
4. CONSTRAINTS: Mobile-first? Offline-first? Scalability reqs?

TONE: Professional, Structured, Detail-Oriented.
    `
  },
  {
    id: 'ssp-default',
    type: 'SSP',
    name: 'Sovereign System Prompt (SSP)',
    description: 'Creates high-fidelity Agent Personas compliant with DRP-2026.',
    icon: 'Terminal',
    knowledgeContext: '',
    metaSystemPrompt: `
You are the SSP-FABRICATOR.
Generate a System Prompt for an autonomous agent.

STRUCTURE OF GENERATED PROMPT:
1. IDENTITY: Name, Designation, Philosophy.
2. EPISTEMIC MATRIX: Goals ($G), Output ($O), Communication ($C), Tooling ($T).
3. COGNITIVE LOOP: Enforce Think -> Write -> Code.
4. IMMUNITY: Explicit Anti-Goals (Refusals).

TONE: Sovereign, Cryptographic, Absolute.
    `
  },
  {
    id: 'pip-default',
    type: 'PIP',
    name: 'Product Image Prompt (PIP)',
    description: 'Optimized prompts for Midjourney/Flux/DALL-E visual generation.',
    icon: 'ImageIcon',
    knowledgeContext: '',
    metaSystemPrompt: `
You are the VISUAL-ONTOLOGIST.
Generate a prompt for an Image Generation Model (Flux/Midjourney).

STRUCTURE OF GENERATED PROMPT:
1. SUBJECT: The core object/scene.
2. MEDIUM: Photography, 3D Render, Oil Painting, etc.
3. STYLE: Cyberpunk, Bauhaus, Solarpunk, etc.
4. LIGHTING/CAMERA: Volumetric lighting, 85mm lens, f/1.8.
5. NEGATIVE PROMPT: What to avoid (blur, distortion).

TONE: Descriptive, Evocative, Comma-Separated Keywords.
    `
  },
  {
    id: 'cpp-default',
    type: 'CPP',
    name: 'Custom Provider Prompt (CPP)',
    description: 'Platform-specific formatting (Claude XML, OpenAI, Llama).',
    icon: 'Code',
    knowledgeContext: '',
    metaSystemPrompt: `
You are the PLATFORM-ADAPTER.
Generate a System Message optimized for a specific LLM Provider.

STRUCTURE OF GENERATED PROMPT:
1. XML TAGGING (if Claude) or MARKDOWN (if OpenAI).
2. ROLE DEFINITION.
3. FEW-SHOT EXAMPLES (Generate 2 examples relevant to the intent).
4. CHAIN OF THOUGHT Instructions.

TONE: Technical, Meta-Cognitive.
    `
  },
  {
    id: 'sdp-default',
    type: 'SDP',
    name: 'Spec Driven Prompt (SDP)',
    description: 'Turns feature lists into rigorous technical specifications.',
    icon: 'Settings',
    knowledgeContext: '',
    metaSystemPrompt: `
You are the SPEC-WRITER.
Generate a prompt that transforms feature lists into Engineering Specs.

STRUCTURE OF GENERATED PROMPT:
1. ARCHITECTURE DIAGRAM (Mermaid).
2. API CONTRACTS (OpenAPI/Swagger YAML).
3. DATA MODELS (SQL/NoSQL).
4. SECURITY PROTOCOLS.

TONE: Engineering-First, Precise, No Fluff.
    `
  }
];

interface MetaPromptTemplate {
  id: string;
  name: string;
  systemPrompt: string; // The metaSystemPrompt content
  knowledgeContext: string; // The knowledgeContext content
  timestamp: number;
}

const TEMPLATES_KEY = 'sovereign_meta_templates';
const ENGINES_WIP_KEY = 'sovereign_forge_engines_wip';

interface PromptForgeViewProps {
  onSavePrompt: (prompt: SovereignPrompt) => void;
  onRegisterProvenance: (entry: ProvenanceIndexEntry) => void;
}

/**
 * The PromptForgeView function.
 * @param { onSavePrompt, onRegisterProvenance } - The { onSavePrompt, onRegisterProvenance } parameter.
 * @returns The resulting value.
 */
export const PromptForgeView: React.FC<PromptForgeViewProps> = ({ onSavePrompt, onRegisterProvenance }) => {
  const [activeEngineId, setActiveEngineId] = useState<string | null>(null);
  
  // Initialize engines with persistence
  const [engines, setEngines] = useState<PromptEngineConfig[]>(() => {
    try {
      const saved = localStorage.getItem(ENGINES_WIP_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation to ensure schema match or merge with defaults if needed
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_ENGINES;
    } catch {
      return DEFAULT_ENGINES;
    }
  });
  
  // Interaction State
  const [userIntent, setUserIntent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<GeneratedPrompt | null>(null);
  const [activeTab, setActiveTab] = useState<'GENERATE' | 'CONFIGURE'>('GENERATE');
  
  // Template Library State
  const [savedTemplates, setSavedTemplates] = useState<MetaPromptTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(TEMPLATES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addToast } = useToast();
  const { confirm, prompt } = useDialog();

  const activeEngine = engines.find(e => e.id === activeEngineId) || null;

  // Persist templates
  useEffect(() => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(savedTemplates));
  }, [savedTemplates]);

  // Persist WIP engines
  useEffect(() => {
    localStorage.setItem(ENGINES_WIP_KEY, JSON.stringify(engines));
  }, [engines]);

  const handleEngineSelect = (id: string) => {
    setActiveEngineId(id);
    setOutput(null);
    setUserIntent('');
    setActiveTab('GENERATE');
  };

  const handleUpdateEngine = (field: keyof PromptEngineConfig, value: string) => {
    if (!activeEngine) return;
    setEngines(prev => prev.map(e => 
       e.id === activeEngine.id ? { ...e, [field]: value } : e
    ));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeEngine) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Append or replace? Let's append with a newline
      const current = activeEngine.knowledgeContext || '';
      handleUpdateEngine('knowledgeContext', current ? current + '\n\n' + text : text);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Meta Template Logic ---

  const handleSaveTemplate = () => {
    if (!activeEngine) return;
    prompt("Name this Configuration (Meta Prompt + Knowledge):", `${activeEngine.name} Custom`, async (name: string) => {
      if (!name) return;

      const newTemplate: MetaPromptTemplate = {
        id: crypto.randomUUID(),
        name,
        systemPrompt: activeEngine.metaSystemPrompt,
        knowledgeContext: activeEngine.knowledgeContext || '',
        timestamp: Date.now()
      };

      setSavedTemplates(prev => [newTemplate, ...prev]);
      addToast(`Configuration saved as template: "${name}"`, 'success');
    });
  };

  const handleLoadTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!activeEngine) return;
    const value = e.target.value;

    if (value === 'DEFAULT') {
      const defaultEngine = DEFAULT_ENGINES.find(de => de.id === activeEngine.id);
      if (defaultEngine) {
        // We update the state directly via setEngines to ensure React re-renders with new values
        setEngines(prev => prev.map(eng => 
            eng.id === activeEngine.id ? { 
                ...eng, 
                metaSystemPrompt: defaultEngine.metaSystemPrompt,
                knowledgeContext: defaultEngine.knowledgeContext 
            } : eng
        ));
      }
    } else {
      const template = savedTemplates.find(t => t.id === value);
      if (template) {
        // Support legacy templates that might use 'content' key, vs new 'systemPrompt' key
        const sysPrompt = template.systemPrompt || (template as any).content || '';
        
        setEngines(prev => prev.map(eng => 
            eng.id === activeEngine.id ? { 
                ...eng, 
                metaSystemPrompt: sysPrompt,
                knowledgeContext: template.knowledgeContext || ''
            } : eng
        ));
      }
    }
    // Reset selection visually
    e.target.value = "";
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    confirm("Delete this template?", async () => {
       setSavedTemplates(prev => prev.filter(t => t.id !== id));
    });
  };

  // --- Generation Logic ---

  const handleGenerate = async () => {
    if (!activeEngine || !userIntent.trim()) return;
    
    setIsGenerating(true);
    try {
      const result = await generateMetaPrompt(userIntent, activeEngine);
      
      const generated: GeneratedPrompt = {
         id: crypto.randomUUID(),
         engineId: activeEngine.id,
         intent: userIntent,
         content: result.data,
         timestamp: Date.now(),
         usage: result.usage
      };
      
      setOutput(generated);
    } catch (e) {
      console.error(e);
      addToast("Generation failed. Check console.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!output || !activeEngine) return;
    
    // Default title from intent or engine
    const defaultTitle = output.intent.length > 40 
        ? `${output.intent.substring(0, 40)}...` 
        : output.intent;
        
    prompt("Save to Library - Enter Prompt Title:", defaultTitle, async (title: string) => {
      if (!title) return;

      const newPrompt: SovereignPrompt = {
          id: crypto.randomUUID(),
          title,
          content: output.content,
          category: activeEngine.type, // Use engine type as category
          subcategory: 'Forged',
          tags: [activeEngine.name, 'Forged'],
          linkedAgentNames: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: 1,
          description: `Generated via ${activeEngine.name}. Intent: ${output.intent}`
      };

      onSavePrompt(newPrompt);

      // Register in provenance
      onRegisterProvenance({
          hash: `forged-${newPrompt.id}`,
          agentName: 'Prompt Forge',
          timestamp: Date.now(),
          sourceType: 'PROMPT_TEMPLATE',
          snippet: `Forged: ${title}`,
          analysis: {
              wordCount: output.content.split(/\s+/).length,
              sentiment: 'NEUTRAL',
              topics: [activeEngine.type, 'AI_GENERATED']
          }
      });

      addToast("Saved to Sovereign Prompt Library.", 'success');
    });
  };

  const copyOutput = () => {
     if (!output) return;
     navigator.clipboard.writeText(output.content);
  };

  // Helper to render icons dynamically
  const renderIcon = (iconName: string, className: string) => {
     switch (iconName) {
        case 'FileText': return <FileText className={className} />;
        case 'Crosshair': return <Crosshair className={className} />;
        case 'Terminal': return <Terminal className={className} />;
        case 'ImageIcon': return <ImageIcon className={className} />;
        case 'Code': return <Code className={className} />;
        case 'Settings': return <Settings className={className} />;
        default: return <Sparkles className={className} />;
     }
  };

  if (!activeEngine) {
    // STATE 1: Engine Selection Hub
    return (
       <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-sovereign" />
                Sovereign Prompt Forge
             </h2>
             <p className="text-zinc-400 max-w-2xl mx-auto">
                Select a specialized generation engine. Each engine is equipped with an editable 
                System Prompt and a Knowledge Context slot for grounding.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {engines.map(engine => (
                <button
                  key={engine.id}
                  onClick={() => handleEngineSelect(engine.id)}
                  className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-sovereign/50 p-6 rounded-xl text-left transition-all group flex flex-col h-full"
                >
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 group-hover:border-sovereign/30 transition-colors">
                         {renderIcon(engine.icon, "w-6 h-6 text-zinc-400 group-hover:text-sovereign")}
                      </div>
                      <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-white -translate-x-2 group-hover:translate-x-0 transition-all opacity-0 group-hover:opacity-100" />
                   </div>
                   <h3 className="text-lg font-bold text-white mb-2">{engine.name}</h3>
                   <p className="text-sm text-zinc-400 leading-relaxed flex-grow">{engine.description}</p>
                   <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase bg-zinc-950 px-2 py-1 rounded">
                         {engine.type}
                      </span>
                      {engine.knowledgeContext && (
                         <span className="text-[10px] font-mono text-blue-400 uppercase bg-blue-900/10 border border-blue-900/30 px-2 py-1 rounded flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Context Loaded
                         </span>
                      )}
                   </div>
                </button>
             ))}
          </div>
       </div>
    );
  }

  // STATE 2: The Forge Interface
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 h-[calc(100vh-4rem)] flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-900 shrink-0">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setActiveEngineId(null)}
                className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors"
             >
                <RotateCcw className="w-5 h-5" />
             </button>
             <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   {renderIcon(activeEngine.icon, "w-5 h-5 text-sovereign")}
                   {activeEngine.name}
                </h2>
                <p className="text-xs text-zinc-500 font-mono">
                   {activeEngine.description}
                </p>
             </div>
          </div>

          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
             <button
                onClick={() => setActiveTab('GENERATE')}
                className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${
                   activeTab === 'GENERATE' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
             >
                GENERATE
             </button>
             <button
                onClick={() => setActiveTab('CONFIGURE')}
                className={`px-4 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-2 ${
                   activeTab === 'CONFIGURE' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
             >
                <Settings className="w-3 h-3" />
                CONFIGURE ENGINE
             </button>
          </div>
       </div>

       {/* Content Area */}
       <div className="flex-1 min-h-0 flex gap-6">
          
          {activeTab === 'CONFIGURE' ? (
             // CONFIGURATION MODE
             <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                {/* System Prompt Editor */}
                <div className="flex flex-col h-full bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                   <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center gap-2">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 whitespace-nowrap">
                         <Terminal className="w-4 h-4" />
                         Meta System Prompt
                      </h3>
                      
                      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                         {/* Templates Dropdown */}
                         <div className="relative group max-w-[200px]">
                            <select 
                               onChange={handleLoadTemplate}
                               className="appearance-none w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] rounded px-3 py-1.5 pr-8 focus:outline-none focus:border-sovereign cursor-pointer"
                               defaultValue=""
                            >
                               <option value="" disabled>Load Config Template...</option>
                               <option value="DEFAULT" className="font-bold text-sovereign">↺ Reset to Default</option>
                               {savedTemplates.length > 0 && <option disabled>──────────</option>}
                               {savedTemplates.map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                               ))}
                            </select>
                            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                         </div>

                         <button 
                            onClick={handleSaveTemplate}
                            className="flex items-center gap-1.5 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1.5 rounded border border-zinc-700 transition-colors whitespace-nowrap"
                            title="Save current configuration as a new Template"
                         >
                            <Save className="w-3 h-3" />
                            SAVE
                         </button>
                      </div>
                   </div>
                   <textarea 
                      className="flex-1 bg-transparent p-4 text-sm font-mono text-zinc-300 resize-none outline-none custom-scrollbar focus:bg-zinc-900/50 transition-colors"
                      value={activeEngine.metaSystemPrompt}
                      onChange={(e) => handleUpdateEngine('metaSystemPrompt', e.target.value)}
                      placeholder="Enter instructions for the prompt generator..."
                   />
                </div>

                {/* Knowledge Context Editor */}
                <div className="flex flex-col h-full bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                   <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                         <Zap className="w-4 h-4" />
                         Knowledge Context
                      </h3>
                      <div>
                         <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded border border-zinc-700 transition-colors"
                         >
                            <Upload className="w-3 h-3" />
                            UPLOAD RESEARCH
                         </button>
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".txt,.md,.json" 
                            onChange={handleFileUpload} 
                         />
                      </div>
                   </div>
                   <textarea 
                      className="flex-1 bg-transparent p-4 text-sm font-mono text-zinc-300 resize-none outline-none custom-scrollbar focus:bg-zinc-900/50 transition-colors placeholder:text-zinc-700"
                      value={activeEngine.knowledgeContext}
                      onChange={(e) => handleUpdateEngine('knowledgeContext', e.target.value)}
                      placeholder="Paste research papers, methodologies, or specific constraints here to ground the generator..."
                   />
                </div>
             </div>
          ) : (
             // GENERATION MODE
             <div className="w-full flex flex-col md:flex-row gap-6 h-full overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                {/* Input Column */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                   <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-1 flex-1 flex flex-col">
                      <textarea 
                         className="flex-1 bg-transparent p-4 text-sm font-medium text-white resize-none outline-none placeholder:text-zinc-600"
                         placeholder="Describe your intent. E.g., 'I need a prompt to research the history of quantum computing algorithms'..."
                         value={userIntent}
                         onChange={(e) => setUserIntent(e.target.value)}
                      />
                      <div className="p-2 border-t border-zinc-800">
                         <button
                            onClick={handleGenerate}
                            disabled={!userIntent.trim() || isGenerating}
                            className="w-full bg-sovereign hover:bg-sovereign/90 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                         >
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            <span>{isGenerating ? 'FORGING...' : 'GENERATE PROMPT'}</span>
                         </button>
                      </div>
                   </div>

                   {/* Stats / Info */}
                   {output && output.usage && (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                         <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Telemetry</h4>
                         <div className="flex justify-between text-xs font-mono text-zinc-400">
                            <span>Tokens</span>
                            <span className="text-white">{output.usage.totalTokens}</span>
                         </div>
                         <div className="flex justify-between text-xs font-mono text-zinc-400 mt-1">
                            <span>Cost (Est)</span>
                            <span className="text-emerald-400">~0.00 Credits</span>
                         </div>
                      </div>
                   )}
                </div>

                {/* Output Column */}
                <div className="w-full md:w-2/3 flex flex-col bg-black/40 border border-zinc-800 rounded-xl overflow-hidden relative">
                   {output ? (
                      <>
                         <div className="absolute top-4 right-4 flex gap-2 z-10">
                            <button 
                               onClick={handleSaveToLibrary}
                               className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg border border-indigo-700/50 shadow-lg transition-colors backdrop-blur-sm text-xs font-bold"
                               title="Save to Prompt Library"
                            >
                               <BookTemplate className="w-3 h-3" />
                               SAVE TO LIB
                            </button>
                            <button 
                               onClick={copyOutput}
                               className="p-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg border border-zinc-700 transition-colors backdrop-blur-sm"
                               title="Copy to Clipboard"
                            >
                               <Copy className="w-4 h-4" />
                            </button>
                         </div>
                         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-16">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-300 leading-relaxed">
                               {output.content}
                            </pre>
                         </div>
                      </>
                   ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                         <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                         <p className="text-sm font-mono">Ready to Forge</p>
                      </div>
                   )}
                </div>
             </div>
          )}
       </div>
    </div>
  );
};
