import React from 'react';
import { Equipamento } from '../types/inventory';

interface CvssGaugeProps {
  ativos: Equipamento[];
}

export const CvssGauge: React.FC<CvssGaugeProps> = ({ ativos }) => {
  // Coletar todas as vulnerabilidades
  const todasVulns = ativos.flatMap(a => a.vulnerabilidades);
  
  const contagem = {
    CRITICA: todasVulns.filter(v => v.severidade === 'CRITICA').length,
    ALTA: todasVulns.filter(v => v.severidade === 'ALTA').length,
    MEDIA: todasVulns.filter(v => v.severidade === 'MEDIA').length,
    BAIXA: todasVulns.filter(v => v.severidade === 'BAIXA').length,
  };

  const total = todasVulns.length || 1;
  const mediaCvss = todasVulns.length > 0
    ? (todasVulns.reduce((acc, v) => acc + (v.score || 0), 0) / todasVulns.length).toFixed(1)
    : '0.0';

  const scoreNum = Math.min(10, Math.max(0, parseFloat(mediaCvss)));
  // Ângulo do ponteiro do velocímetro: de -90deg (valor 0) até +90deg (valor 10)
  const rotationAngle = -90 + (scoreNum / 10) * 180;

  return (
    <div className="bg-[#0f172a]/90 backdrop-blur border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <h3 className="text-sm font-semibold text-slate-200 tracking-tight">
          CVSS Vulnerability Scores
        </h3>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
          Média: {mediaCvss} / 10
        </span>
      </div>

      {/* Speedometer Gauge Canvas / SVG */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg viewBox="0 0 200 115" className="w-48 overflow-visible">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="35%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background Arc Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Colored Gradient Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset="0"
            opacity="0.9"
          />

          {/* Number Tick Marks around arc */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const angle = (-180 + (num / 10) * 180) * (Math.PI / 180);
            const radius = 64;
            const x = 100 + radius * Math.cos(angle);
            const y = 100 + radius * Math.sin(angle);
            return (
              <text
                key={num}
                x={x}
                y={y}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="central"
                className="font-mono select-none"
              >
                {num}
              </text>
            );
          })}

          {/* Center Pivot Point */}
          <circle cx="100" cy="100" r="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="3" fill="#f43f5e" />

          {/* Needle */}
          <g transform={`rotate(${rotationAngle}, 100, 100)`}>
            <polygon
              points="97,100 100,32 103,100"
              fill="#f8fafc"
              className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            />
          </g>

          <text
            x="100"
            y="92"
            fill="#e2e8f0"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
            className="tracking-wider"
          >
            CVSS
          </text>
        </svg>
      </div>

      {/* Severity Breakdown Bars matching Image 1 */}
      <div className="space-y-2 mt-1">
        {/* Critical */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-rose-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Crítica
            </span>
            <span className="text-slate-300 font-semibold">{contagem.CRITICA}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${(contagem.CRITICA / total) * 100}%` }}
            />
          </div>
        </div>

        {/* High */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-amber-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Alta
            </span>
            <span className="text-slate-300 font-semibold">{contagem.ALTA}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${(contagem.ALTA / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Medium */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-yellow-300 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              Média
            </span>
            <span className="text-slate-300 font-semibold">{contagem.MEDIA}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${(contagem.MEDIA / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Low */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-cyan-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Baixa
            </span>
            <span className="text-slate-300 font-semibold">{contagem.BAIXA}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-500"
              style={{ width: `${(contagem.BAIXA / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex justify-between items-center text-[11px] font-mono text-slate-400">
        <span>Vulnerabilidades: <strong className="text-slate-200">{todasVulns.length}</strong></span>
        <span>Críticas/Altas: <strong className="text-rose-400">{contagem.CRITICA + contagem.ALTA}</strong></span>
      </div>
    </div>
  );
};
