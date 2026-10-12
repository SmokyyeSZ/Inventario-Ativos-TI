import React from 'react';
import { Equipamento } from '../types/inventory';
import { AlertTriangle, Globe, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface HighestRiskAssetsProps {
  ativos: Equipamento[];
  onSelectAtivo: (ativo: Equipamento) => void;
}

export const HighestRiskAssets: React.FC<HighestRiskAssetsProps> = ({
  ativos,
  onSelectAtivo,
}) => {
  // Ordenar ativos pelo risco_final decrescente
  const ativosOrdenados = [...ativos].sort((a, b) => b.risco_final - a.risco_final);
  const topCriticos = ativosOrdenados.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* 1. Risk Propagation Flow (Diagrama de cascata de ameaças da Imagem 1) */}
      <div className="bg-[#0f172a]/90 backdrop-blur border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 tracking-tight mb-3 flex items-center justify-between">
          <span>Risk Propagation Flow</span>
          <span className="text-[10px] font-mono text-cyan-400">Cascata de Rede</span>
        </h4>

        <div className="flex items-center justify-between gap-1 text-[11px] font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <div className="flex flex-col items-center text-center">
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 mb-1">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span className="text-slate-400 text-[10px]">Internet</span>
          </div>

          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />

          <div className="flex flex-col items-center text-center">
            <div className="w-7 h-7 rounded-full bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-400 mb-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="text-rose-300 text-[10px]">Gateway</span>
          </div>

          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />

          <div className="flex flex-col items-center text-center">
            <div className="w-7 h-7 rounded-full bg-amber-950 border border-amber-600 flex items-center justify-center text-amber-400 mb-1">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span className="text-amber-300 text-[10px]">Servidores</span>
          </div>

          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />

          <div className="flex flex-col items-center text-center">
            <div className="w-7 h-7 rounded-full bg-red-950 border border-red-500 flex items-center justify-center text-red-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-red-300 text-[10px]">Banco Dados</span>
          </div>
        </div>
      </div>

      {/* 2. Highest Risk Assets (Lista de Alertas da Imagem 1) */}
      <div className="bg-[#0f172a]/90 backdrop-blur border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 tracking-tight">
            Highest Risk Assets
          </h4>
          <span className="text-[10px] font-mono text-rose-400 bg-rose-950/70 border border-rose-900/60 px-1.5 py-0.5 rounded">
            Top Prioridades
          </span>
        </div>

        <div className="divide-y divide-slate-800/60 mt-2">
          {topCriticos.map((ativo) => {
            const isCrit = ativo.risco_final >= 15;
            const isHigh = ativo.risco_final >= 10 && ativo.risco_final < 15;

            return (
              <div
                key={ativo.id_ativo}
                onClick={() => onSelectAtivo(ativo)}
                className="py-2.5 px-2 hover:bg-slate-800/40 rounded flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-mono font-bold text-slate-200 truncate flex items-center gap-1.5">
                    {ativo.nome}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {ativo.tipo} · {ativo.departamento}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isCrit
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                        : isHigh
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : 'bg-yellow-950/80 text-yellow-300 border-yellow-800'
                    }`}
                  >
                    Risco: {ativo.risco_final}
                  </span>

                  <AlertTriangle
                    className={`w-4 h-4 ${
                      isCrit ? 'text-rose-500 animate-pulse' : isHigh ? 'text-amber-500' : 'text-yellow-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Top Risk Vector Progress (Threat Progress visualizer) */}
      <div className="bg-[#0f172a]/90 backdrop-blur border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 tracking-tight">
            Top Risk Vector Analysis
          </h4>
          <span className="text-[10px] font-mono text-slate-400">Threat Progress</span>
        </div>

        <div className="h-28 mt-2 relative flex items-end justify-between px-2 pt-2">
          {/* SVG line curves */}
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 80">
            {/* Grid lines */}
            <line x1="0" y1="20" x2="200" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="200" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="78" x2="200" y2="78" stroke="#334155" />

            {/* Critical vector curve (red) */}
            <path
              d="M 10 75 Q 60 50 110 32 T 190 12"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
            />
            {/* High vector curve (orange) */}
            <path
              d="M 10 75 Q 60 60 110 44 T 190 28"
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
            />
            {/* Medium vector curve (cyan) */}
            <path
              d="M 10 75 Q 60 68 110 58 T 190 48"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1 border-t border-slate-800/60 pt-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Exp. Lateral
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Priv. Escalação
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Phishing / Web
          </span>
        </div>
      </div>
    </div>
  );
};
