import React from 'react';
import { Equipamento } from '../types/inventory';
import { NetworkRiskCalculationResult } from '../services/mathEngine';
import { Sliders, Cpu, Activity, Sigma } from 'lucide-react';

interface RiskMatrixHeatmapProps {
  ativos: Equipamento[];
  mathResult: NetworkRiskCalculationResult;
  alpha: number;
  onAlphaChange: (newAlpha: number) => void;
}

export const RiskMatrixHeatmap: React.FC<RiskMatrixHeatmapProps> = ({
  ativos,
  mathResult,
  alpha,
  onAlphaChange,
}) => {
  const { matrizA, vetorB, vetorX, lambdaMax, matrixDensity, amplificationFactor } = mathResult;
  const n = ativos.length;

  // Gerar cor para a célula do heatmap (0.00 a 1.00 ou valor do risco)
  const getCellColor = (val: number, maxVal: number) => {
    if (val === 0) return 'bg-slate-900/60 text-slate-500';
    const ratio = Math.min(1, val / (maxVal || 1));
    if (ratio >= 0.75) return 'bg-rose-600/80 text-white font-bold';
    if (ratio >= 0.5) return 'bg-amber-600/80 text-white font-semibold';
    if (ratio >= 0.25) return 'bg-yellow-600/70 text-slate-900 font-semibold';
    return 'bg-cyan-900/60 text-cyan-200';
  };

  return (
    <div className="bg-[#0f172a]/95 backdrop-blur border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200 tracking-tight">
            Risk Propagation Matrix &amp; CVSS Heatmaps
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span className="bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded">
            λmax = {lambdaMax}
          </span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
            Densidade = {matrixDensity}
          </span>
        </div>
      </div>

      {/* Slider de Velocidade de Propagação (alpha) */}
      <div className="my-3 p-3 bg-slate-900/80 border border-slate-800/80 rounded-lg">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Velocidade de Propagação (α):
          </span>
          <span className="text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            α = {alpha.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.10"
          max="0.95"
          step="0.05"
          value={alpha}
          onChange={(e) => onAlphaChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
          <span>0.10 (Isolado)</span>
          <span>0.50 (Equilibrado)</span>
          <span>0.95 (Cascata Alta)</span>
        </div>
      </div>

      {/* Matriz de Adjacência / Heatmap de Risco */}
      <div className="my-2">
        <div className="text-xs font-mono text-slate-400 mb-2 flex items-center justify-between">
          <span>Matriz de Adjacência de Rede [A]:</span>
          <span className="text-[11px] text-slate-400">Dimensão: {n} × {n}</span>
        </div>

        <div className="overflow-x-auto max-h-52 overflow-y-auto">
          <table className="w-full text-xs font-mono border-collapse border border-slate-800/80">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400">
                <th className="p-1.5 text-left border border-slate-800 text-[10px]">Origem \ Destino</th>
                {ativos.slice(0, 8).map((a) => (
                  <th key={a.id_ativo} className="p-1.5 text-center border border-slate-800 truncate max-w-[55px] text-[10px]" title={a.nome}>
                    {a.nome.slice(0, 5)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrizA.slice(0, 8).map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-1.5 text-left font-medium text-slate-300 border border-slate-800 bg-slate-900/50 truncate max-w-[70px] text-[10px]">
                    {ativos[i]?.nome.slice(0, 8)}
                  </td>
                  {row.slice(0, 8).map((val, j) => (
                    <td
                      key={j}
                      className={`p-1.5 text-center border border-slate-800/80 text-[11px] transition-colors ${
                        val > 0 ? 'bg-cyan-950/70 text-cyan-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {val > 0 ? '1' : '0'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equação Linear do Sistema: (I - alpha*A) * x = b */}
      <div className="mt-3 p-2.5 bg-[#090d16] border border-slate-800 rounded-lg text-xs font-mono space-y-1.5">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Sigma className="w-3.5 h-3.5" />
            Modelo Matemático (Leontief / Inversa de Rede):
          </span>
          <span className="text-slate-400 text-[11px]">Amplificação: <strong className="text-rose-400 font-bold">{amplificationFactor}x</strong></span>
        </div>
        <div className="text-slate-200 text-center py-1 bg-slate-900/70 rounded border border-slate-800 text-[11px]">
          ( I - {alpha.toFixed(2)} · A ) · x = b  ⟹  x = ( I - {alpha.toFixed(2)} · A )⁻¹ · b
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span>Risco Próprio Total: <strong className="text-slate-200">{vetorB.reduce((a,b)=>a+b, 0).toFixed(1)}</strong></span>
          <span>Risco Propagado Final: <strong className="text-rose-400">{vetorX.reduce((a,b)=>a+b, 0).toFixed(1)}</strong></span>
        </div>
      </div>
    </div>
  );
};
