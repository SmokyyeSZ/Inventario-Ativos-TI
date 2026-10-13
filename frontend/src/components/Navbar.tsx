import React from 'react';
import { Shield, Server, Activity, Database, Settings2, RefreshCw } from 'lucide-react';
import { JesterLogo } from './JesterLogo';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenApiConfig: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  selectedAssetNome?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenApiConfig,
  onRefreshData,
  isRefreshing,
  selectedAssetNome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#080d17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-8 max-w-[1720px] mx-auto">
        <div className="flex items-center gap-3 shrink-0">
          <div className="cursor-pointer flex items-center gap-3" onClick={() => onTabChange('dashboard')}>
            <JesterLogo size={36} />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-wider text-white font-mono flex items-center gap-1.5">
                JESTER <span className="text-rose-500">RISK</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
                Risk Propagation Model
              </span>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-[#05080f] p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-rose-950/80 to-rose-900/60 text-white border border-rose-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            Dashboard
          </button>

          <button
            onClick={() => onTabChange('inventory')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-gradient-to-r from-cyan-950/80 to-cyan-900/60 text-white border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            Inventário de Ativos
          </button>

          <button
            onClick={() => onTabChange('details')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'details'
                ? 'bg-gradient-to-r from-amber-950/80 to-amber-900/60 text-white border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            Detalhes do Equipamento {selectedAssetNome ? `(${selectedAssetNome})` : ''}
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Sincronizar com Backend REST Django"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-[#0b111e] hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync REST</span>
          </button>

          <button
            onClick={onOpenApiConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-[#0b111e] hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">API Django</span>
          </button>
        </div>
      </div>
    </header>
  );
};
