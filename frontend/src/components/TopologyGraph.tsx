import React, { useState, useRef } from 'react';
import { Equipamento, TipoAtivo } from '../types/inventory';
import { 
  Server, 
  Database, 
  Laptop, 
  Router, 
  ShieldAlert, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search,
  Share2
} from 'lucide-react';

interface TopologyGraphProps {
  ativos: Equipamento[];
  onSelectAtivo: (ativo: Equipamento) => void;
  onOpenConnectModal?: () => void;
}

export const TopologyGraph: React.FC<TopologyGraphProps> = ({
  ativos,
  onSelectAtivo,
  onOpenConnectModal,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  // Posições locais dos nós para permitir arraste
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const total = ativos.length;
    const centerX = 420;
    const centerY = 270;
    const radius = 190;

    ativos.forEach((ativo, idx) => {
      if (ativo.x !== undefined && ativo.y !== undefined) {
        pos[ativo.id_ativo] = { x: ativo.x, y: ativo.y };
      } else {
        // Layout circular padrão
        const angle = (idx / Math.max(1, total)) * 2 * Math.PI - Math.PI / 2;
        pos[ativo.id_ativo] = {
          x: Math.round(centerX + radius * Math.cos(angle)),
          y: Math.round(centerY + radius * Math.sin(angle)),
        };
      }
    });
    return pos;
  });

  const svgRef = useRef<SVGSVGElement | null>(null);

  const getIconForTipo = (tipo: TipoAtivo) => {
    switch (tipo) {
      case 'SERVIDOR':
        return Server;
      case 'BANCO_DE_DADOS':
        return Database;
      case 'NOTEBOOK':
        return Laptop;
      case 'ROTEADORES':
        return Router;
      default:
        return Server;
    }
  };

  // Cores de risco
  const getNodeRiskColor = (riscoFinal: number) => {
    if (riscoFinal >= 15) return { border: '#ef4444', glow: 'rgba(239, 68, 68, 0.45)', bg: '#450a0a' };
    if (riscoFinal >= 10) return { border: '#f97316', glow: 'rgba(249, 115, 22, 0.35)', bg: '#431407' };
    if (riscoFinal >= 5) return { border: '#eab308', glow: 'rgba(234, 179, 8, 0.3)', bg: '#422006' };
    return { border: '#06b6d4', glow: 'rgba(6, 182, 212, 0.25)', bg: '#083344' };
  };

  // Manipulação de arraste
  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedNode(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    setNodePositions(prev => ({
      ...prev,
      [draggedNode]: { x: Math.max(40, Math.min(800, mouseX)), y: Math.max(40, Math.min(500, mouseY)) },
    }));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  // Coletar conexões direcionadas
  const connections: { sourceId: string; targetId: string; source: { x: number; y: number }; target: { x: number; y: number }; isHighRisk: boolean }[] = [];
  const idParaAtivo: Record<string, Equipamento> = {};
  ativos.forEach(a => { idParaAtivo[a.id_ativo] = a; });

  ativos.forEach(source => {
    const sPos = nodePositions[source.id_ativo];
    if (!sPos) return;

    (source.conexoes || []).forEach(targetId => {
      const tPos = nodePositions[targetId];
      const target = idParaAtivo[targetId];
      if (tPos && target) {
        const isHighRisk = (source.risco_final >= 10) || (target.risco_final >= 10);
        connections.push({
          sourceId: source.id_ativo,
          targetId: targetId,
          source: sPos,
          target: tPos,
          isHighRisk,
        });
      }
    });
  });

  return (
    <div className="relative w-full h-[520px] bg-[#0c1220] border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
      {/* Header com controles */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-[#0d1527]/85 backdrop-blur border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
            IT Inventory Topology Network Graph
          </h3>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
            ({ativos.length} nós · {connections.length} conexões de propagação)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Busca de ativos no grafo */}
          <div className="relative w-40 sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar ativo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 text-xs text-slate-200 placeholder-slate-500 pl-8 pr-2.5 py-1.5 rounded-md border border-slate-700/80 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {onOpenConnectModal && (
            <button
              onClick={onOpenConnectModal}
              className="px-2.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 rounded-md transition-colors flex items-center gap-1.5 shrink-0"
              title="Criar nova rota de conexão entre nós"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Conectar Nós</span>
            </button>
          )}

          {/* Controles de Zoom */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5">
            <button
              onClick={() => setZoom(z => Math.min(1.8, z + 0.15))}
              className="p-1 text-slate-400 hover:text-slate-100 transition-colors"
              title="Aproximar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
              className="p-1 text-slate-400 hover:text-slate-100 transition-colors"
              title="Afastar"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-1 text-slate-400 hover:text-slate-100 transition-colors"
              title="Redefinir visualização"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas com Cyber Grid */}
      <div 
        className="flex-1 w-full h-full relative cursor-crosshair overflow-hidden bg-grid-cyber bg-radial-glow"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 880 540"
          className="w-full h-full select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Marcadores de seta para conexões direcionadas */}
            <marker
              id="arrowhead-normal"
              markerWidth="7"
              markerHeight="7"
              refX="18"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 7 3.5, 0 7" fill="#0891b2" />
            </marker>

            <marker
              id="arrowhead-risk"
              markerWidth="8"
              markerHeight="8"
              refX="19"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#ef4444" />
            </marker>

            {/* Filtro de brilho neon */}
            <filter id="glow-danger" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Linhas de conexão (Arestas da Matriz A) */}
          {connections.map((conn, idx) => {
            const dx = conn.target.x - conn.source.x;
            const dy = conn.target.y - conn.source.y;
            const midX = (conn.source.x + conn.target.x) / 2;
            const midY = (conn.source.y + conn.target.y) / 2;

            return (
              <g key={`conn-${idx}`} className="transition-opacity duration-300">
                {/* Linha de conexão */}
                <line
                  x1={conn.source.x}
                  y1={conn.source.y}
                  x2={conn.target.x}
                  y2={conn.target.y}
                  stroke={conn.isHighRisk ? '#ef4444' : '#0e7490'}
                  strokeWidth={conn.isHighRisk ? 2.5 : 1.5}
                  strokeDasharray={conn.isHighRisk ? '6 4' : undefined}
                  markerEnd={conn.isHighRisk ? 'url(#arrowhead-risk)' : 'url(#arrowhead-normal)'}
                  opacity={conn.isHighRisk ? 0.85 : 0.6}
                />

                {/* Tag "Risk Propagation" no meio das arestas críticas */}
                {conn.isHighRisk && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-46"
                      y="-9"
                      width="92"
                      height="18"
                      rx="4"
                      fill="#1f1118"
                      stroke="#ef4444"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3.5"
                      fill="#fca5a5"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="font-mono tracking-wider select-none pointer-events-none"
                    >
                      Propagando
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Renderização dos Nós de Ativos */}
          {ativos.map((ativo) => {
            const pos = nodePositions[ativo.id_ativo] || { x: 440, y: 270 };
            const riskColor = getNodeRiskColor(ativo.risco_final);
            const Icon = getIconForTipo(ativo.tipo);
            const isHovered = hoveredNode === ativo.id_ativo;
            const isMatchingSearch = searchTerm && (
              ativo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ativo.id_ativo.includes(searchTerm) ||
              ativo.departamento.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return (
              <g
                key={ativo.id_ativo}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer group"
                onMouseDown={(e) => handleMouseDown(ativo.id_ativo, e)}
                onMouseEnter={() => setHoveredNode(ativo.id_ativo)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onSelectAtivo(ativo)}
              >
                {/* Halo de Risco / Aura */}
                <circle
                  cx="0"
                  cy="0"
                  r={isHovered ? 38 : 32}
                  fill={riskColor.bg}
                  stroke={riskColor.border}
                  strokeWidth={isMatchingSearch ? 3 : 2}
                  className="transition-all duration-200"
                  style={{
                    filter: isHovered || ativo.risco_final >= 10 ? `drop-shadow(0 0 10px ${riskColor.glow})` : undefined,
                  }}
                />

                {/* Anel pulsante para nós críticos (>= 15) */}
                {ativo.risco_final >= 15 && (
                  <circle
                    cx="0"
                    cy="0"
                    r="40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="animate-spin"
                    style={{ transformOrigin: '0 0', animationDuration: '10s' }}
                  />
                )}

                {/* Ícone do Ativo via foreignObject */}
                <foreignObject x="-14" y="-14" width="28" height="28" className="pointer-events-none">
                  <div className="w-full h-full flex items-center justify-center text-slate-100">
                    <Icon className="w-5 h-5 drop-shadow" style={{ color: riskColor.border }} />
                  </div>
                </foreignObject>

                {/* Badge de Risco Final no canto superior direito do nó */}
                <g transform="translate(18, -18)">
                  <circle
                    cx="0"
                    cy="0"
                    r="10"
                    fill="#020617"
                    stroke={riskColor.border}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="3"
                    fill="#ffffff"
                    fontSize="8.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-mono select-none"
                  >
                    {Math.round(ativo.risco_final)}
                  </text>
                </g>

                {/* Nome do Ativo & Departamento */}
                <text
                  x="0"
                  y="46"
                  fill={isHovered ? '#38bdf8' : '#f1f5f9'}
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  className="font-mono tracking-tight select-none"
                >
                  {ativo.nome}
                </text>

                <text
                  x="0"
                  y="59"
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="middle"
                  className="font-mono select-none"
                >
                  {ativo.tipo} · ID:{ativo.id_ativo}
                </text>

                {/* Tooltip ao passar o mouse */}
                {isHovered && (
                  <g transform="translate(0, -56)" className="pointer-events-none">
                    <rect
                      x="-80"
                      y="-28"
                      width="160"
                      height="38"
                      rx="5"
                      fill="#020617"
                      stroke="#38bdf8"
                      strokeWidth="1"
                      className="shadow-2xl"
                    />
                    <text x="0" y="-12" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                      Risco Final: {ativo.risco_final} | Próprio: {ativo.risco_proprio}
                    </text>
                    <text x="0" y="2" fill="#94a3b8" fontSize="9" textAnchor="middle">
                      {ativo.vulnerabilidades.length} vuln(s) · {ativo.conexoes?.length || 0} conexões
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Rodapé informativo do grafo */}
      <div className="px-4 py-2 bg-[#090e1c] border-t border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-cyan-300" />
            Normal (&lt;5)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-300" />
            Moderado (5-9)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-400" />
            Alto (10-14)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-400 animate-pulse" />
            Crítico (&ge;15)
          </span>
        </div>
        <div className="text-slate-400 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Arraste os nós para reorganizar o mapa · Clique para detalhes</span>
        </div>
      </div>
    </div>
  );
};
