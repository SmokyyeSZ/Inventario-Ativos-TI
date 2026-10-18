import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ShieldAlert, Cpu, Eye } from 'lucide-react';
import { Asset } from '../types';

interface NetworkTopologyGraphProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  selectedAssetId?: string;
  propagationSpeed: number;
  onPropagationSpeedChange: (val: number) => void;
}

interface GraphNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  risk: number;
  status: string;
}

interface GraphLink {
  source: string;
  target: string;
  weight: number;
  riskFlow: boolean;
}

export const NetworkTopologyGraph: React.FC<NetworkTopologyGraphProps> = ({
  assets,
  onSelectAsset,
  selectedAssetId,
  propagationSpeed,
  onPropagationSpeedChange,
}) => {
  const [zoom, setZoom] = useState(1);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const centerX = 340;
  const centerY = 190;
  const radiusX = 175;
  const radiusY = 125;

  const nodes: GraphNode[] = assets.map((asset, index) => {
    let x = centerX;
    let y = centerY;

    if (assets.length === 2) {
      x = index === 0 ? centerX - 110 : centerX + 110;
    } else if (assets.length > 2) {
      const angle = (2 * Math.PI * index) / assets.length - Math.PI / 2;
      x = Math.round(centerX + radiusX * Math.cos(angle));
      y = Math.round(centerY + radiusY * Math.sin(angle));
    }

    return {
      id: String(asset.id),
      name: asset.nome,
      type: asset.tipo,
      x,
      y,
      risk: Number(asset.riscoFinal ?? 0),
      status: asset.status || 'online',
    };
  });

  const seenConnIds = new Set<string>();
  const links: GraphLink[] = [];
  for (const asset of assets) {
    for (const conn of asset.conexoes || []) {
      const connKey = String(conn.id || `${conn.origemId}-${conn.destinoId}`);
      if (seenConnIds.has(connKey)) continue;
      seenConnIds.add(connKey);
      if (conn.status === 'Bloqueada') continue;
      links.push({
        source: String(conn.origemId ?? asset.id),
        target: String(conn.destinoId),
        weight: Number(conn.pesoPropagacao ?? 0.1),
        riskFlow: Number(asset.riscoFinal ?? 0) >= 7.0 || Number(conn.pesoPropagacao ?? 0) >= 0.5,
      });
    }
  }

  const filteredNodes = nodes.filter((n) =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNodeColor = (risk: number) => {
    if (risk >= 9.0) return { fill: '#7f1d1d', stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.8)', text: '#fca5a5' };
    if (risk >= 7.0) return { fill: '#7c2d12', stroke: '#f97316', glow: 'rgba(249, 115, 22, 0.7)', text: '#fdba74' };
    if (risk >= 4.0) return { fill: '#14532d', stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', text: '#86efac' };
    return { fill: '#0c4a6e', stroke: '#0284c7', glow: 'rgba(56, 189, 248, 0.4)', text: '#7dd3fc' };
  };

  const handleNodeClick = (nodeId: string) => {
    setHighlightedNode(nodeId);
    const asset = assets.find((a) => String(a.id) === String(nodeId));
    if (asset) {
      onSelectAsset(asset);
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-[#070b13] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800/80 bg-[#090e1a]">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]"></span>
            Topologia de Rede Interativa (Mapa de Propagação de Risco)
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Vulnerabilidades ativas gerando vetor de infecção propagada
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filtrar nós do grafo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2.5 py-1 text-xs bg-[#05080f] border border-slate-700 rounded-md font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />

          <div className="flex items-center border border-slate-700 rounded-md bg-[#05080f] overflow-hidden">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
              title="Aumentar zoom"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.65))}
              title="Diminuir zoom"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-l border-slate-700 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setHighlightedNode(null);
                setSearchQuery('');
              }}
              title="Resetar exibição"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-l border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-[360px] cyber-grid overflow-hidden flex items-center justify-center p-2">
        <svg
          viewBox="0 0 620 380"
          className="w-full h-full max-h-[460px] select-none transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <defs>
            <linearGradient id="riskLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="neutralLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {links.map((link, idx) => {
            const sNode = nodes.find((n) => n.id === link.source);
            const tNode = nodes.find((n) => n.id === link.target);
            if (!sNode || !tNode) return null;

            const isRisk = link.riskFlow;
            const isConnectedToHighlight =
              highlightedNode && (sNode.id === highlightedNode || tNode.id === highlightedNode);

            return (
              <g key={`link-${idx}`}>
                <line
                  x1={sNode.x}
                  y1={sNode.y}
                  x2={tNode.x}
                  y2={tNode.y}
                  stroke={isRisk ? 'url(#riskLineGrad)' : 'url(#neutralLineGrad)'}
                  strokeWidth={isRisk ? 2.5 : 1.2}
                  strokeDasharray={isRisk ? '4 2' : undefined}
                  className={isRisk ? 'animate-pulse' : ''}
                />
                {isRisk && (
                  <circle
                    r="3.5"
                    fill="#ef4444"
                    filter="url(#glow)"
                  >
                    <animateMotion
                      path={`M${sNode.x},${sNode.y} L${tNode.x},${tNode.y}`}
                      dur={`${Math.max(1.2 / propagationSpeed, 0.4)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <text
                  x={(sNode.x + tNode.x) / 2 + 6}
                  y={(sNode.y + tNode.y) / 2 - 4}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  className="tabular-nums"
                >
                  {link.weight}
                </text>
              </g>
            );
          })}

          {filteredNodes.map((node) => {
            const colors = getNodeColor(node.risk);
            const isSelected = selectedAssetId === node.id || highlightedNode === node.id;
            const isHighRisk = node.risk >= 9.0;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node.id)}
                className="cursor-pointer group"
              >
                {isHighRisk && (
                  <circle
                    r="28"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    className="animate-ping pointer-events-none"
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />
                )}

                <circle
                  r={isSelected ? 22 : 18}
                  fill={colors.fill}
                  stroke={isSelected ? '#ffffff' : colors.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-150 group-hover:stroke-white group-hover:stroke-[3px]"
                  style={{
                    filter: `drop-shadow(0 0 10px ${colors.glow})`,
                  }}
                />

                <circle
                  r="7"
                  fill={colors.stroke}
                  opacity="0.9"
                />

                {isHighRisk && (
                  <g transform="translate(-40, -32)">
                    <rect
                      width="80"
                      height="16"
                      rx="3"
                      fill="#ef4444"
                      opacity="0.9"
                    />
                    <text
                      x="40"
                      y="11"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Risco Propagado
                    </text>
                  </g>
                )}

                <text
                  x="0"
                  y={isSelected ? 34 : 30}
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {node.name}
                </text>
                <text
                  x="0"
                  y={isSelected ? 46 : 42}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="9"
                  fontFamily="monospace"
                  className="tabular-nums font-bold"
                >
                  {node.risk.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute top-3 left-3 bg-[#0a1120]/90 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 max-w-[210px] backdrop-blur-md">
          <p className="text-[11px] font-bold text-white mb-1.5 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-rose-500" />
            Matriz de Adjacência
          </p>
          <div className="bg-[#05080f] p-2 rounded border border-slate-800/80 mb-2.5 overflow-x-auto">
            <div className="text-[10px] text-cyan-300 leading-tight whitespace-pre">
              {assets.length === 0
                ? 'P = [ ]'
                : assets.slice(0, 5).map((rowAsset, rIdx, arr) => {
                    const rowVals = arr.map((colAsset) => {
                      const conn = (rowAsset.conexoes || []).find(
                        (c) => String(c.destinoId) === String(colAsset.id)
                      );
                      return conn ? Number(conn.pesoPropagacao).toFixed(1) : '0';
                    });
                    const prefix = rIdx === 0 ? 'P = [ ' : '      ';
                    const suffix = rIdx === arr.length - 1 ? ' ]' : ',';
                    return `${prefix}[${rowVals.join(', ')}]${suffix}`;
                  }).join('\n')}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span>Velocidade de Propagação:</span>
              <span className="text-rose-400 font-bold tabular-nums">α={propagationSpeed.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={propagationSpeed}
              onChange={(e) => onPropagationSpeedChange(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
