
import React, { useState } from 'react';
import { Shield, Activity, Zap, Lock, Terminal, Box, FileJson, GitBranch, Info, Copy, Check, X, Code, ChevronDown, ChevronRight, Anchor, Hash, Globe, FileText, Filter, Microscope, DollarSign, Network, BrainCircuit, Target, AlertOctagon, MessageSquareCode } from 'lucide-react';
import { SovereignAgentManifest, AgentConstraint, AgentTool, InternalTool } from '../types';
import { ConductorExportModal } from './ConductorExportModal';

interface ManifestDisplayProps {
  manifest: SovereignAgentManifest;
}

const RISK_DESCRIPTIONS = {
  LOW: "Safe. Read-only access to non-sensitive, public data layers.",
  MEDIUM: "Caution. Standard operations with potential for minor side effects.",
  HIGH: "Warning. Can modify state, access restricted resources, or incur costs.",
  CRITICAL: "Danger. Destructive capabilities or full system access. Requires strict immunity."
};

/**
 * Helper to produce a clean manifest for export (removing heavy logs)
 */
const getCleanManifest = (manifest: SovereignAgentManifest): SovereignAgentManifest => {
  if (!manifest.provenance?.councilLog) return manifest;
  const { councilLog, ...cleanProvenance } = manifest.provenance;
  return {
    ...manifest,
    provenance: cleanProvenance
  };
};

/**
 * Generates a structured Markdown System Specification from the Manifest
 */
const generateMarkdownDocumentation = (manifest: SovereignAgentManifest): string => {
  const date = new Date().toISOString().split('T')[0];
  const budget = manifest.budget;
  const protocol = manifest.protocol;
  const matrix = manifest.epistemicMatrix;
  
  return `# SOVEREIGN AGENT IDENTITY: ${manifest.identity.name.toUpperCase()}
> **Designation:** ${manifest.identity.designation}  
> **Role:** ${protocol?.role || 'UNASSIGNED'} (DRP-2025)
> **Date:** ${date}  
> **Status:** OPERATIONAL  

---

## 1. EPISTEMIC MATRIX (DRP-2026)

### Goal Orientation ($G)
- **Primary Goal (Invariant):** ${matrix?.goals?.primary || 'Undefined'}
- **Constraints (Anti-Goals):**
${matrix?.goals?.antiGoals?.map(g => `  - [REFUSAL] ${g}`).join('\n') || '  - None'}

### Cognitive Protocol
- **Thinking Budget:** ${matrix?.cognitive?.thinkingBudget || 0} tokens
- **Think Instruction:** "${matrix?.cognitive?.thinkingInstruction}"

### Output Fidelity ($O)
- **Format:** ${matrix?.output?.format}
- **Strict Constraints:** ${matrix?.output?.constraints.join(', ')}

---

## 2. CORE PHILOSOPHY
${manifest.identity.corePhilosophy}

---

## 3. IMMUNOLOGICAL CONSTRAINTS (POLICY)
${manifest.constraints.map(c => `- **[${c.type}]** ${c.description} *(Enforcement: ${c.enforcementMechanism})*`).join('\n')}

---

## 4. TOOLING & CAPABILITIES

### External Action Space
${manifest.tools.map(t => `#### 🔧 ${t.name}
- **Risk Level:** ${t.riskLevel}
- **Description:** ${t.description}
- **Input Schema:** \`${t.inputSchema}\`
`).join('\n')}

### Internal Diagnostics (Metacognition)
${manifest.internalTools?.map(t => `#### 🔬 ${t.name}
- **Trigger:** ${t.usageCondition}
- **Recovery:** ${t.recoveryStrategy}
`).join('\n') || '_No internal diagnostic tools defined._'}

---

## 5. TOKEN ECONOMICS
${budget ? `- **Total Budget:** ${budget.tokenBudget.toLocaleString()} tokens` : '- _Not specified_'}
${budget ? `- **Drift Allowance:** ${(budget.driftAllowance * 100).toFixed(1)}%` : ''}

---

## 6. PROVENANCE & ANCHORS
**Anchors (Dependencies):**
${manifest.anchors.map(a => `- ${a.name}: ${a.description}`).join('\n')}

**Digital Signature:**
\`${manifest.provenance?.signature?.signature || 'UNSIGNED_DRAFT'}\`
`;
};

/**
 * The ManifestDisplay function.
 * @param { manifest } - The { manifest } parameter.
 * @returns The resulting value.
 */
export const ManifestDisplay: React.FC<ManifestDisplayProps> = ({ manifest }) => {
  const [activeDep, setActiveDep] = useState<{ name: string; sourceId: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTool, setSelectedTool] = useState<AgentTool | null>(null);
  const [collapsedDeps, setCollapsedDeps] = useState<Set<number>>(new Set());
  const [showConductorModal, setShowConductorModal] = useState(false);
  
  // Risk Filtering State
  const [riskFilter, setRiskFilter] = useState<Set<string>>(new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']));

  // Calculate counts for filter UI
  const riskCounts = manifest.tools.reduce((acc, tool) => {
    acc[tool.riskLevel] = (acc[tool.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const toggleRiskFilter = (level: string) => {
     setRiskFilter(prev => {
        const next = new Set(prev);
        if (next.has(level)) next.delete(level);
        else next.add(level);
        return next;
     });
  };

  const filteredTools = manifest.tools.filter(t => riskFilter.has(t.riskLevel));

  const resolveDependency = (name: string) => {
    const tool = manifest.tools.find(t => t.name === name);
    if (tool) return { type: 'TOOL' as const, description: tool.description, risk: tool.riskLevel };
    
    const ability = manifest.abilities.find(a => a.name === name);
    if (ability) return { type: 'ABILITY' as const, description: ability.description };
    
    const anchor = manifest.anchors?.find(a => a.name === name);
    if (anchor) return { type: 'ANCHOR' as const, description: anchor.description };

    return null;
  };

  const handleDepClick = (e: React.MouseEvent, name: string, sourceId: string) => {
    e.stopPropagation();
    if (activeDep?.sourceId === sourceId) {
      setActiveDep(null);
    } else {
      setActiveDep({ name, sourceId });
    }
  };

  const handleToolClick = (e: React.MouseEvent, tool: AgentTool) => {
    e.stopPropagation();
    setSelectedTool(tool);
  };

  const closeToolModal = () => setSelectedTool(null);

  const toggleDepVisibility = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setCollapsedDeps(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleCopyJson = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clean = getCleanManifest(manifest);
    navigator.clipboard.writeText(JSON.stringify(clean, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadMarkdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const md = generateMarkdownDocumentation(manifest);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${manifest.identity.name.toLowerCase().replace(/\s+/g, '-')}-spec.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Budget Calculations ---
  const tokenBudget = manifest.budget?.tokenBudget || 0;
  const driftAllowance = manifest.budget?.driftAllowance || 0;
  // Rule: Penalty = Drift% + 5%
  const penaltyRate = driftAllowance + 0.05;
  const lostTokens = Math.floor(tokenBudget * penaltyRate);
  const effectiveBudget = tokenBudget - lostTokens;
  const driftTokens = Math.floor(tokenBudget * driftAllowance);

  // --- Epistemic Matrix Shortcuts ---
  const matrix = manifest.epistemicMatrix;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in-up" onClick={() => setActiveDep(null)}>
      
      {/* Identity Card */}
      <div className="bg-void-light border border-zinc-800 rounded-lg p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cognitive/5 rounded-full blur-3xl" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-6 h-6 text-sovereign" />
              <h2 className="text-2xl font-bold text-white tracking-tight">{manifest.identity.name}</h2>
              {manifest.provenance?.signature && (
                 <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-sovereign/10 border border-sovereign/30">
                    <Check className="w-3 h-3 text-sovereign" />
                    <span className="text-[10px] font-mono text-sovereign font-bold">VERIFIED SOVEREIGN</span>
                 </div>
              )}
            </div>

            {manifest.identity.aliases && manifest.identity.aliases.length > 0 && (
              <div className="mb-3 pl-9 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">Aliases:</span>
                {manifest.identity.aliases.map((alias, idx) => (
                  <span key={idx} className="text-xs font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                    {alias}
                  </span>
                ))}
              </div>
            )}

            <p className="text-zinc-400 font-mono text-sm mb-4 uppercase tracking-widest border-l-2 border-sovereign pl-3">
              {manifest.identity.designation}
            </p>
            <p className="text-zinc-300 italic">"{manifest.identity.primeDirective}"</p>
          </div>
          <div className="text-right hidden md:block">
            <span className="inline-block px-3 py-1 bg-sovereign/10 text-sovereign text-xs font-mono rounded border border-sovereign/20">
              STATUS: OPERATIONAL
            </span>
          </div>
        </div>
        <div className="mt-6 p-4 bg-black/40 rounded border border-zinc-800">
            <h3 className="text-xs text-zinc-500 font-mono mb-2 uppercase">Core Philosophy</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">{manifest.identity.corePhilosophy}</p>
        </div>
      </div>

      {/* DRP-2026 EPISTEMIC MATRIX (NEW VISUALIZATION) */}
      {matrix && (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6 relative overflow-hidden">
           <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2 relative z-10">
              <div className="flex items-center space-x-2">
                 <BrainCircuit className="w-5 h-5 text-purple-400" />
                 <h3 className="text-lg font-semibold text-white">Epistemic Matrix (DRP-2026)</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Architecture: Recursive Identity Field</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              
              {/* Dimension $G: Goal Architecture */}
              <div className="bg-zinc-950/50 p-4 rounded border border-zinc-800 flex flex-col h-full">
                 <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-mono text-emerald-400 uppercase font-bold">Goal Architecture ($G)</h4>
                 </div>
                 
                 <div className="space-y-3">
                    <div>
                       <span className="text-[10px] text-zinc-500 uppercase block mb-1">Primary Invariant</span>
                       <div className="p-2 bg-emerald-900/10 border border-emerald-900/30 rounded text-sm text-emerald-100">
                          {matrix.goals?.primary}
                       </div>
                    </div>
                    
                    {matrix.goals?.antiGoals?.length > 0 && (
                       <div>
                          <span className="text-[10px] text-zinc-500 uppercase block mb-1">Anti-Goals (Strict Constraints)</span>
                          <ul className="space-y-1">
                             {matrix.goals.antiGoals.map((ag, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-red-200/80 bg-red-900/10 p-1.5 rounded border border-red-900/20">
                                   <AlertOctagon className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                                   {ag}
                                </li>
                             ))}
                          </ul>
                       </div>
                    )}
                 </div>
              </div>

              {/* Dimension Cognitive: Protocol */}
              <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 flex flex-col h-full">
                 <div className="flex items-center gap-2 mb-3">
                    <MessageSquareCode className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-mono text-blue-400 uppercase font-bold">Cognitive Protocol</h4>
                 </div>

                 <div className="flex items-center justify-between mb-3 text-xs bg-black/30 p-2 rounded">
                    <span className="text-zinc-500">Think Budget:</span>
                    <span className="text-blue-300 font-mono">{matrix.cognitive?.thinkingBudget} Tokens</span>
                 </div>

                 <div className="space-y-4 relative">
                    {/* The Loop Visualization */}
                    <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-zinc-800"></div>
                    
                    <div className="relative pl-6">
                       <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-zinc-900 border border-blue-500/50 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                       </div>
                       <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Phase 1: THINK</p>
                       <p className="text-xs text-zinc-400 italic">"{matrix.cognitive?.thinkingInstruction}"</p>
                    </div>

                    <div className="relative pl-6">
                       <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
                       </div>
                       <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Phase 2: WRITE</p>
                       <p className="text-xs text-zinc-400 italic">Tone: {matrix.communication?.tone}</p>
                    </div>

                    <div className="relative pl-6">
                       <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
                       </div>
                       <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Phase 3: CODE</p>
                       <p className="text-xs text-zinc-400 italic">Format: {matrix.output?.format}</p>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      )}

      {/* Internal Tools (Metacognition) */}
      {manifest.internalTools && manifest.internalTools.length > 0 && (
         <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-lg p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            
            <div className="flex items-center space-x-2 mb-4 border-b border-zinc-800 pb-2 relative z-10">
               <Microscope className="w-5 h-5 text-indigo-400" />
               <h3 className="text-lg font-semibold text-white">Diagnostics & Metacognition</h3>
               <span className="text-[10px] bg-indigo-900/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono uppercase ml-2">Internal Only</span>
            </div>

            <div className="grid grid-cols-1 gap-4 relative z-10">
               {manifest.internalTools.map((tool, idx) => (
                  <div key={idx} className="bg-zinc-950/50 border border-zinc-800 p-4 rounded-lg flex flex-col md:flex-row gap-4 hover:border-indigo-500/30 transition-colors">
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <Terminal className="w-3 h-3 text-indigo-500" />
                           <h4 className="text-sm font-bold text-indigo-200 font-mono">{tool.name}</h4>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{tool.description}</p>
                     </div>
                     <div className="w-px bg-zinc-800 hidden md:block"></div>
                     <div className="flex-1 space-y-2">
                        <div>
                           <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-0.5">Trigger Condition</span>
                           <p className="text-xs text-zinc-300 bg-zinc-900 px-2 py-1 rounded border border-zinc-800/50">{tool.usageCondition}</p>
                        </div>
                        <div>
                           <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-0.5">Recovery Strategy</span>
                           <p className="text-xs text-zinc-300 bg-zinc-900 px-2 py-1 rounded border border-zinc-800/50">{tool.recoveryStrategy}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Token Economics / Budget */}
      {manifest.budget && (
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-lg p-6">
           <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
              <div className="flex items-center space-x-2">
                 <DollarSign className="w-5 h-5 text-emerald-500" />
                 <h3 className="text-lg font-semibold text-white">Token Economics</h3>
              </div>
              <div className="text-[10px] font-mono bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-zinc-400">
                 DRIFT_PENALTY = {(penaltyRate * 100).toFixed(0)}%
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-zinc-950/50 p-4 rounded border border-zinc-800 flex flex-col">
                 <span className="text-xs font-mono text-zinc-500 uppercase mb-1">Total Allocated</span>
                 <span className="text-2xl font-bold text-white">{tokenBudget.toLocaleString()}</span>
                 <span className="text-[10px] text-zinc-600">Base Estimate</span>
              </div>
              <div className="bg-zinc-950/50 p-4 rounded border border-zinc-800 flex flex-col">
                 <span className="text-xs font-mono text-zinc-500 uppercase mb-1">Drift Allowance</span>
                 <span className="text-2xl font-bold text-yellow-500">{(driftAllowance * 100).toFixed(1)}%</span>
                 <span className="text-[10px] text-zinc-600">~{driftTokens.toLocaleString()} tokens deviation</span>
              </div>
              <div className="bg-emerald-900/10 p-4 rounded border border-emerald-900/30 flex flex-col">
                 <span className="text-xs font-mono text-emerald-600 uppercase mb-1">Effective Budget</span>
                 <span className="text-2xl font-bold text-emerald-400">{effectiveBudget.toLocaleString()}</span>
                 <span className="text-[10px] text-emerald-600/70">After Stability Tax</span>
              </div>
           </div>

           {/* Visual Bar */}
           <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-500 font-mono">
                 <span>0</span>
                 <span>Total Capacity: {tokenBudget.toLocaleString()}</span>
              </div>
              <div className="h-4 bg-zinc-800 rounded-full overflow-hidden flex relative">
                 {/* Safe Zone */}
                 <div 
                   className="h-full bg-emerald-600 relative group" 
                   style={{ width: `${((effectiveBudget) / tokenBudget) * 100}%` }}
                 >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-bold text-black bg-emerald-400 transition-opacity">
                       SAFE ZONE
                    </div>
                 </div>
                 
                 {/* Drift Zone (Taxed) */}
                 <div 
                   className="h-full bg-red-900/50 relative border-l border-zinc-900 group"
                   style={{ width: `${(lostTokens / tokenBudget) * 100}%` }}
                 >
                     <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-bold text-red-200 bg-red-900/80 transition-opacity">
                       TAX
                     </div>
                 </div>

                 {/* Remaining (Implicitly the penalty eats into the total, so maybe visualize the "Cost" vs "Value") */}
              </div>
              <p className="text-[10px] text-zinc-600 italic">
                 *The drift allowance incurs a stability tax (Drift% + 5%), reducing the guaranteed effective budget to ensure reliable execution.
              </p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Constraints */}
        <div className="bg-void-light border border-immune/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4 border-b border-zinc-800 pb-2">
            <Lock className="w-5 h-5 text-immune" />
            <h3 className="text-lg font-semibold text-white">Constraints (Immune System)</h3>
          </div>
          <div className="space-y-3">
            {manifest.constraints.map((c: AgentConstraint) => (
              <div key={c.id} className="group p-3 bg-black/20 hover:bg-immune/5 border border-zinc-800 hover:border-immune/30 rounded transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-immune/80">{c.type}</span>
                  <span className="text-[10px] text-zinc-600 font-mono">{c.id}</span>
                </div>
                <p className="text-sm text-zinc-300 mb-2">{c.description}</p>
                <div className="text-xs text-zinc-500 font-mono border-l border-zinc-700 pl-2">
                  Enforcement: {c.enforcementMechanism}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="bg-void-light border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
            <div className="flex items-center space-x-2">
              <Box className="w-5 h-5 text-cognitive" />
              <h3 className="text-lg font-semibold text-white">External Tools</h3>
            </div>
            
            {/* Filter Controls */}
            {manifest.tools.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-zinc-500 font-mono mr-2 uppercase flex items-center gap-1 hidden sm:flex">
                   <Filter className="w-3 h-3" /> Filter:
                </span>
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(level => {
                   if (!riskCounts[level]) return null;
                   const isActive = riskFilter.has(level);
                   let colorClass = '';
                   if (level === 'CRITICAL') colorClass = isActive ? 'bg-red-900/40 text-red-400 border-red-900' : 'text-zinc-600 border-zinc-800 hover:border-red-900/50';
                   else if (level === 'HIGH') colorClass = isActive ? 'bg-orange-900/40 text-orange-400 border-orange-900' : 'text-zinc-600 border-zinc-800 hover:border-orange-900/50';
                   else if (level === 'MEDIUM') colorClass = isActive ? 'bg-blue-900/40 text-blue-400 border-blue-900' : 'text-zinc-600 border-zinc-800 hover:border-blue-900/50';
                   else colorClass = isActive ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'text-zinc-600 border-zinc-800 hover:border-zinc-700';

                   return (
                     <button
                       key={level}
                       onClick={(e) => { e.stopPropagation(); toggleRiskFilter(level); }}
                       className={`text-[10px] px-2 py-1 rounded border transition-all font-mono font-bold ${colorClass}`}
                       title={`Toggle ${level} risk tools`}
                     >
                       {level} ({riskCounts[level]})
                     </button>
                   );
                })}
              </div>
            )}
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
             {filteredTools.length > 0 ? (
                filteredTools.map((t: AgentTool, idx) => {
                 const isHighlighted = activeDep?.name === t.name;
                 return (
                   <div 
                    key={idx}
                    onClick={(e) => handleToolClick(e, t)}
                    className={`flex flex-col p-3 rounded border transition-all duration-300 cursor-pointer group hover:bg-zinc-800/80 ${
                      isHighlighted 
                        ? 'bg-sovereign/10 border-sovereign shadow-[0_0_15px_rgba(16,185,129,0.1)] translate-x-1' 
                        : 'bg-zinc-900/50 border-zinc-800'
                    }`}
                   >
                     <div className="flex justify-between items-start">
                       <span className={`font-mono text-sm font-bold group-hover:text-white transition-colors ${isHighlighted ? 'text-sovereign' : 'text-cognitive'}`}>
                         {t.name}
                       </span>
                       <div className="relative group/tooltip flex items-center">
                         <span className={`text-[10px] px-2 py-0.5 rounded border cursor-help ${
                           t.riskLevel === 'CRITICAL' ? 'bg-red-900/20 text-red-400 border-red-900' :
                           t.riskLevel === 'HIGH' ? 'bg-orange-900/20 text-orange-400 border-orange-900' :
                           'bg-blue-900/20 text-blue-400 border-blue-900'
                         }`}>
                           {t.riskLevel}
                         </span>
                         <div className="absolute bottom-full right-0 mb-2 w-56 p-2 bg-zinc-950 border border-zinc-800 rounded shadow-2xl text-[10px] text-zinc-400 hidden group-hover/tooltip:block z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                             <p className="leading-snug">{RISK_DESCRIPTIONS[t.riskLevel]}</p>
                             <div className="absolute -bottom-1 right-3 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 transform rotate-45"></div>
                         </div>
                       </div>
                     </div>
                     <p className={`text-xs mt-1 ${isHighlighted ? 'text-zinc-200' : 'text-zinc-400'} line-clamp-2`}>{t.description}</p>
                   </div>
                 );
               })
             ) : (
                <div className="text-zinc-500 text-xs italic p-4 text-center border border-zinc-800 border-dashed rounded">
                  {manifest.tools.length > 0 ? "No tools match active filters." : "No external tools defined."}
                </div>
             )}
          </div>
        </div>
      </div>

       {/* Anchors */}
       {manifest.anchors && manifest.anchors.length > 0 && (
        <div className="bg-void-light border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4 border-b border-zinc-800 pb-2">
            <Anchor className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-white">Anchors (Grounding)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {manifest.anchors.map((anchor, idx) => (
              <div key={idx} className="bg-zinc-900/50 p-4 rounded border border-zinc-800 hover:border-purple-500/30 transition-colors flex flex-col h-full">
                  <div className="mb-2">
                     <h4 className="font-mono text-sm text-purple-400 font-bold tracking-tight">{anchor.name}</h4>
                  </div>
                  <p className="text-xs text-zinc-400 mb-4 flex-grow leading-relaxed">{anchor.description}</p>
                  
                  {anchor.dependencies && anchor.dependencies.length > 0 && (
                       <div className="mt-auto pt-3 border-t border-zinc-800/50">
                          <p className="text-[10px] text-zinc-600 font-mono uppercase mb-2">Required Dependencies</p>
                          <div className="flex flex-wrap gap-2">
                              {anchor.dependencies.map((dep, dIdx) => (
                                  <span key={dIdx} className="text-[10px] px-2 py-0.5 rounded bg-purple-900/10 text-purple-300/80 border border-purple-900/30 font-mono">
                                      {dep}
                                  </span>
                              ))}
                          </div>
                       </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Abilities */}
      {manifest.abilities.length > 0 && (
        <div className="bg-void-light border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4 border-b border-zinc-800 pb-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Intrinsic Abilities</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manifest.abilities.map((a, idx) => (
              <div 
                key={`ab-${idx}`} 
                className="flex flex-col p-4 bg-zinc-900/30 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                 <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-600 shrink-0" />
                      <span className="text-sm text-zinc-200 font-bold font-mono">{a.name}</span>
                    </div>
                 </div>
                 <p className="text-xs text-zinc-400 mb-4 flex-grow leading-relaxed">{a.description}</p>
                 {a.dependencies && a.dependencies.length > 0 ? (
                    <div className="bg-black/20 border border-zinc-800/50 rounded p-2 mt-auto">
                        <div 
                            className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-white/5 p-0.5 rounded transition-colors select-none"
                            onClick={(e) => toggleDepVisibility(e, idx)}
                        >
                           <GitBranch className="w-3 h-3 text-zinc-600" />
                           <span className="text-[10px] font-mono text-zinc-600 uppercase flex-1">Dependencies</span>
                           {collapsedDeps.has(idx) ? <ChevronRight className="w-3 h-3 text-zinc-500" /> : <ChevronDown className="w-3 h-3 text-zinc-500" />}
                        </div>
                        
                        {!collapsedDeps.has(idx) && (
                          <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-1 fade-in duration-200">
                            {a.dependencies.map((dep, dIdx) => {
                              const sourceId = `ab-${idx}-dep-${dIdx}`;
                              const isFocused = activeDep?.sourceId === sourceId;
                              const isRelated = activeDep?.name === dep;
                              const resolution = isFocused ? resolveDependency(dep) : null;

                              return (
                                <div key={dIdx} className="relative inline-block">
                                  <button
                                    onClick={(e) => handleDepClick(e, dep, sourceId)}
                                    className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition-all duration-200 cursor-pointer ${
                                      isFocused || isRelated
                                        ? 'bg-sovereign/20 border-sovereign text-sovereign shadow-sm ring-1 ring-sovereign/30' 
                                        : 'bg-zinc-900 border-zinc-800/80 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200'
                                    }`}
                                  >
                                    <span className={`w-1 h-1 rounded-full ${isFocused || isRelated ? 'bg-sovereign animate-pulse' : 'bg-zinc-500'}`}></span>
                                    <span className="text-[10px] font-mono">{dep}</span>
                                  </button>
                                  {isFocused && resolution && (
                                    <div className="absolute bottom-full left-0 mb-2 w-64 z-50 animate-in fade-in zoom-in-95 duration-200">
                                      <div className="bg-zinc-950 border border-sovereign/30 text-zinc-300 text-xs rounded-md shadow-2xl p-3 relative ring-1 ring-black/50">
                                          <div className="flex items-center space-x-2 mb-2 border-b border-zinc-800 pb-2">
                                              <span className={`font-mono text-[9px] px-1 rounded uppercase ${
                                                  resolution.type === 'TOOL' ? 'bg-cognitive/20 text-cognitive' : 
                                                  resolution.type === 'ANCHOR' ? 'bg-purple-900/20 text-purple-500' :
                                                  'bg-yellow-900/20 text-yellow-500'
                                              }`}>
                                                  {resolution.type}
                                              </span>
                                              <span className="font-bold text-white tracking-tight">{dep}</span>
                                          </div>
                                          <p className="leading-relaxed text-zinc-400">{resolution.description}</p>
                                          <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-zinc-950 border-r border-b border-sovereign/30 transform rotate-45"></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                 ) : (
                   <div className="text-[10px] text-zinc-600 font-mono italic p-1">No dependencies declared.</div>
                 )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflows */}
      <div className="bg-void-light border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4 border-b border-zinc-800 pb-2">
          <Activity className="w-5 h-5 text-sovereign" />
          <h3 className="text-lg font-semibold text-white">Operational Workflows</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {manifest.workflows.map((w, idx) => (
             <div key={idx} className="bg-zinc-900/50 p-4 rounded border border-zinc-800">
               <h4 className="font-mono text-sm text-sovereign mb-2">{w.name}</h4>
               <p className="text-xs text-zinc-500 mb-2">Trigger: {w.trigger}</p>
               <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-300 font-mono mb-3">
                 {w.steps.map((s, sIdx) => <li key={sIdx}>{s}</li>)}
               </ol>
               <div className="bg-sovereign/5 p-2 rounded text-xs text-sovereign/80">
                 Outcome: {w.outcome}
               </div>
             </div>
           ))}
        </div>
      </div>

       {/* Download / Export */}
       <div className="flex flex-wrap justify-end pt-4 gap-3">
         <button 
            className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-4 py-2 rounded transition-colors text-sm font-mono border border-zinc-800"
            onClick={handleCopyJson}
         >
           {copied ? <Check className="w-4 h-4 text-sovereign" /> : <Copy className="w-4 h-4" />}
           <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
         </button>
         
         <button 
            className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded transition-colors text-sm font-mono border border-zinc-700"
            onClick={(e) => {
              e.stopPropagation();
              // Get clean manifest (no council log)
              const clean = getCleanManifest(manifest);
              const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `sovereign-agent-${manifest.identity.name.toLowerCase().replace(/\s+/g, '-')}.json`;
              a.click();
            }}
         >
           <FileJson className="w-4 h-4" />
           <span>EXPORT MANIFEST</span>
         </button>
         
         <button 
            className="flex items-center space-x-2 bg-blue-900/20 hover:bg-blue-900/40 text-blue-300 px-4 py-2 rounded transition-colors text-sm font-mono border border-blue-900/50"
            onClick={(e) => {
               e.stopPropagation();
               setShowConductorModal(true);
            }}
         >
           <Network className="w-4 h-4" />
           <span>EXPORT TO SWARM</span>
         </button>

         <button 
            className="flex items-center space-x-2 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-200 px-4 py-2 rounded transition-colors text-sm font-mono border border-indigo-900/50"
            onClick={handleDownloadMarkdown}
         >
           <FileText className="w-4 h-4" />
           <span>GENERATE DOCS (.MD)</span>
         </button>
       </div>

       {/* Tool Details Modal */}
       {selectedTool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeToolModal}>
            <div className="bg-void-light border border-zinc-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start p-6 border-b border-zinc-800 bg-black/20">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                            {selectedTool.name}
                            <span className={`text-[10px] px-2 py-0.5 rounded border ${
                               selectedTool.riskLevel === 'CRITICAL' ? 'bg-red-900/20 text-red-400 border-red-900' :
                               selectedTool.riskLevel === 'HIGH' ? 'bg-orange-900/20 text-orange-400 border-orange-900' :
                               'bg-blue-900/20 text-blue-400 border-blue-900'
                            }`}>
                               {selectedTool.riskLevel}
                            </span>
                        </h3>
                         <p className="text-zinc-400 text-sm">{RISK_DESCRIPTIONS[selectedTool.riskLevel]}</p>
                    </div>
                    <button onClick={closeToolModal} className="text-zinc-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                     <div>
                        <h4 className="text-xs font-mono text-zinc-500 uppercase mb-2">Description</h4>
                        <p className="text-zinc-300 leading-relaxed text-sm">{selectedTool.description}</p>
                     </div>

                     <div>
                        <h4 className="text-xs font-mono text-zinc-500 uppercase mb-2 flex items-center gap-2">
                            <Code className="w-3 h-3" />
                            Input Schema
                        </h4>
                        <div className="bg-black/50 rounded-lg border border-zinc-800 p-4 overflow-x-auto">
                            <pre className="text-xs font-mono text-sovereign/90 whitespace-pre-wrap">
                                {(() => {
                                    try {
                                        return JSON.stringify(JSON.parse(selectedTool.inputSchema), null, 2);
                                    } catch {
                                        return selectedTool.inputSchema;
                                    }
                                })()}
                            </pre>
                        </div>
                     </div>
                </div>
                
                 <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-end">
                     <button onClick={closeToolModal} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm font-medium transition-colors border border-zinc-700">
                        Close Details
                     </button>
                 </div>
            </div>
        </div>
      )}

      {/* Conductor Export Modal */}
      {showConductorModal && (
         <ConductorExportModal 
            agent={manifest} 
            onClose={() => setShowConductorModal(false)} 
         />
      )}
    </div>
  );
};
