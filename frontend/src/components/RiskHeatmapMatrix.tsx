import React from 'react';
import { Asset, RiskPropagationMetrics } from '../types';
import { AlertOctagon, TrendingUp, Cpu, Flame } from 'lucide-react';

interface RiskHeatmapMatrixProps {
  metrics: RiskPropagationMetrics;
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
}

export const RiskHeatmapMatrix: React.FC<RiskHeatmapMatrixProps> = ({ metrics, assets, onSelectAsset }) => {
  const getCellBg = (val: number) => {
    if (val >= 6.0) return 'bg-rose-600/90 text-white font-bold border-rose-400';
    if (val >= 3.0) return 'bg-amber-600/80 text-white font-semibold border-amber-400';
    if (val >= 1.0) return 'bg-emerald-600/70 text-white font-medium border-emerald-400';
    if (val >= 0.4) return 'bg-cyan-700/60 text-slate-100 border-cyan-500';
    return 'bg-blue-900/40 text-slate-300 border-blue-700';
  };

  const highestRiskAssets = [...assets].sort((a, b) => b.riscoFinal - a.riscoFinal).slice(0, 4);

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="bg-[#070b13] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Matriz de Propagação de Risco & Heatmaps CVSS
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Interseção de vetores entre zonas de isolamento
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded bg-cyan-950/40">
            Densidade: {metrics.matrixDensity.toFixed(2)}
          </span>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-xs font-mono text-slate-500"></th>
                {metrics.heatmap.labels.map((lbl) => (
                  <th key={lbl} className="p-2 text-xs font-mono font-semibold text-slate-300">
                    {lbl}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.heatmap.matrix.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="p-2 text-xs font-mono font-semibold text-left text-slate-300">
                    {metrics.heatmap.labels[rowIdx]}
                  </td>
                  {row.map((val, colIdx) => (
                    <td key={colIdx} className="p-1">
                      <div
                        className={`py-2 px-3 rounded text-xs font-mono tabular-nums border transition-transform hover:scale-105 cursor-default ${getCellBg(
                          val
                        )}`}
                      >
                        {val.toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
          <span>Escala de Impacto:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-400">0.00</span>
            <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-blue-700 via-emerald-600 via-amber-500 to-rose-600"></div>
            <span className="text-rose-400 font-bold">10.00</span>
          </div>
        </div>
      </div>

      <div className="bg-[#070b13] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white tracking-wide font-mono flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Centralidade por Autovetor (A · x = λx)
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Grafo: {metrics.eigenvectorCentrality.metricsCount} nós
          </span>
        </div>

        <div className="p-3 bg-[#05080f] rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300 mb-4 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[10px] block mb-1">Equação do Sistema:</span>
            <span className="text-cyan-300">A · x = λmax · x</span>
            <div className="text-[11px] text-slate-400 mt-1">
              λmax = <strong className="text-rose-400 tabular-nums">{metrics.lambdaMax.toFixed(2)}</strong> (Raiz Espectral)
            </div>
          </div>
          <div className="text-right text-[11px]">
            <span className="text-slate-500 text-[10px] block mb-1">Métricas Globais:</span>
            <span className="text-slate-300">Densidade: {metrics.eigenvectorCentrality.density.toFixed(3)}</span>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-2 flex items-center justify-between">
            <span>Ativos em Risco Crítico</span>
            <span className="text-rose-400">Top Alvos</span>
          </h4>
          <div className="space-y-2">
            {highestRiskAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#05080f] border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className={`w-4 h-4 ${asset.riscoFinal >= 9.0 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">{asset.nome}</span>
                    <span className="text-[10px] text-slate-400">{asset.departamento}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    asset.riscoFinal >= 9.0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {asset.riscoFinal.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
