import React from 'react';
import {
  Server,
  AlertTriangle,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Asset, RiskPropagationMetrics } from '../types';
import { NetworkTopologyGraph } from './NetworkTopologyGraph';
import { RiskHeatmapMatrix } from './RiskHeatmapMatrix';

interface DashboardViewProps {
  metrics: RiskPropagationMetrics;
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  selectedAssetId?: string;
  propagationSpeed: number;
  onPropagationSpeedChange: (speed: number) => void;
  onGoToInventory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  assets,
  onSelectAsset,
  selectedAssetId,
  propagationSpeed,
  onPropagationSpeedChange,
  onGoToInventory,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#070b13] border border-slate-800 rounded-xl p-4 shadow-md hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Total de Ativos de TI</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {metrics.totalAssets.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center">
              {metrics.totalAssets > 0 ? 'Ativos' : 'Vazio'}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(metrics.totalAssets * 10, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-[#070b13] border border-slate-800 rounded-xl p-4 shadow-md hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Score Propagação (λmax)</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {metrics.lambdaMax.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-amber-400 flex items-center">
              Espectral
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(metrics.lambdaMax * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-[#070b13] border border-slate-800 rounded-xl p-4 shadow-md hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>CVEs Não Corrigidas</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
              {metrics.unpatchedCves}
            </span>
            <span className="text-xs font-mono text-rose-400 flex items-center">
              {metrics.unpatchedCves > 0 ? 'Crítico' : 'Seguro'}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(metrics.unpatchedCves * 10, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-[#070b13] border border-slate-800 rounded-xl p-4 shadow-md hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Densidade da Matriz</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {metrics.matrixDensity.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-cyan-400 flex items-center">
              Topologia
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(metrics.matrixDensity * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 min-h-[480px]">
          <NetworkTopologyGraph
            assets={assets}
            onSelectAsset={onSelectAsset}
            selectedAssetId={selectedAssetId}
            propagationSpeed={propagationSpeed}
            onPropagationSpeedChange={onPropagationSpeedChange}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <RiskHeatmapMatrix
            metrics={metrics}
            assets={assets}
            onSelectAsset={onSelectAsset}
          />
        </div>
      </div>

      <div className="bg-[#070b13] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Resumo do Inventário de Equipamentos
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Principais nós da topologia ordenados por criticidade de propagação
            </p>
          </div>
          <button
            onClick={onGoToInventory}
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
          >
            Ver Tabela Completa
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {assets.slice(0, 4).map((asset) => (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className="p-3 rounded-lg bg-[#05080f] border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-white">{asset.nome}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  asset.riscoFinal >= 9.0 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {asset.riscoFinal.toFixed(1)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mb-1">{asset.departamento}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{asset.ip}</span>
                <span>{asset.cves.length} CVEs · {asset.conexoes.length} Conexões</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
