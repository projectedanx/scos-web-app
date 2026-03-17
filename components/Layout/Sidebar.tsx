
import React from 'react';
import { Terminal, Database, HardDrive, LayoutGrid, Network, Bot, GitGraph, Sparkles, BookTemplate, MessageSquareCode, Briefcase } from 'lucide-react';
import { ViewMode } from '../../types';

interface SidebarProps {
  currentMode: ViewMode;
  onSwitch: (mode: ViewMode) => void;
  onToggleVault: () => void;
}

/**
 * The Sidebar function.
 * @param { currentMode, onSwitch, onToggleVault } - The { currentMode, onSwitch, onToggleVault } parameter.
 * @returns The resulting value.
 */
export const Sidebar: React.FC<SidebarProps> = ({ currentMode, onSwitch, onToggleVault }) => {
  
  const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode; icon: any; label: string }) => {
    const isActive = currentMode === mode;
    return (
      <button
        onClick={() => onSwitch(mode)}
        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all mb-1 ${
          isActive 
            ? 'bg-sovereign/10 text-sovereign border border-sovereign/20' 
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm font-bold font-mono tracking-tight">{label}</span>
      </button>
    );
  };

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Branding */}
      <div className="p-6 border-b border-zinc-900 flex items-center space-x-3">
        <div className="bg-sovereign/10 p-2 rounded">
          <Terminal className="w-6 h-6 text-sovereign" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight">SCOS FORGE</h1>
          <p className="text-xs text-zinc-600 font-mono">v1.9.9 // SOVEREIGN</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <p className="text-[10px] text-zinc-600 font-mono uppercase mb-3 pl-2">Operations</p>
          <NavItem mode={ViewMode.DASHBOARD} icon={LayoutGrid} label="Dashboard" />
          <NavItem mode={ViewMode.COLLABORATOR} icon={MessageSquareCode} label="Co-Mind" />
          <NavItem mode={ViewMode.CONTRACTS} icon={Briefcase} label="Contracts" />
          <div className="my-2 border-t border-zinc-900/50"></div>
          <NavItem mode={ViewMode.PROMPT_FORGE} icon={Sparkles} label="Prompt Forge" />
          <NavItem mode={ViewMode.PROMPT_LIBRARY} icon={BookTemplate} label="Prompt Library" />
          <NavItem mode={ViewMode.AGENTS} icon={Bot} label="Agent Library" />
          <NavItem mode={ViewMode.FORGE} icon={Terminal} label="Agent Forge" />
          <NavItem mode={ViewMode.CAPSULE_LAB} icon={Database} label="Capsule Lab" />
          <NavItem mode={ViewMode.WORD_MAPPER} icon={GitGraph} label="Word Mapper" />
          <NavItem mode={ViewMode.REGISTRY} icon={Network} label="Registry" />
        </div>
      </div>

      {/* Vault Toggle */}
      <div className="p-4 border-t border-zinc-900">
        <button 
           onClick={onToggleVault}
           className="w-full flex items-center justify-between px-3 py-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all group"
        >
           <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4" />
              <span className="text-xs font-mono font-bold">OPEN VAULT</span>
           </div>
           <div className="w-1.5 h-1.5 rounded-full bg-sovereign/50 group-hover:bg-sovereign shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"></div>
        </button>
      </div>
    </div>
  );
};
