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
  tier: 'core' | 'hub' | 'leaf';
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

  const centerX = 360;
  const centerY = 190;

  // Mapa rápido de vizinhos de cada ativo para posicionar nós conectados próximos entre si
  const neighborMap = new Map<string, Set<string>>();
  for (const a of assets) {
    const id = String(a.id);
    if (!neighborMap.has(id)) neighborMap.set(id, new Set());
    for (const c of a.conexoes || []) {
      if (c.status === 'Bloqueada') continue;
      const src = String(c.origemId ?? a.id);
      const dst = String(c.destinoId);
      if (!neighborMap.has(src)) neighborMap.set(src, new Set());
      if (!neighborMap.has(dst)) neighborMap.set(dst, new Set());
      neighborMap.get(src)!.add(dst);
      neighborMap.get(dst)!.add(src);
    }
  }

  const areConnected = (idA: string, idB: string) =>
    neighborMap.get(idA)?.has(idB) || neighborMap.get(idB)?.has(idA) || false;

  // Ordena ativos por relevância neural (risco final + grau de conexões)
  const rankedAssets = [...assets].sort((a, b) => {
    const degA = neighborMap.get(String(a.id))?.size ?? (a.conexoes?.length || 0);
    const degB = neighborMap.get(String(b.id))?.size ?? (b.conexoes?.length || 0);
    const scoreA = Number(a.riscoFinal ?? 0) * 2 + degA * 4;
    const scoreB = Number(b.riscoFinal ?? 0) * 2 + degB * 4;
    return scoreB - scoreA;
  });

  const nodeCoords = new Map<string, { x: number; y: number; tier: GraphNode['tier'] }>();

  if (rankedAssets.length > 0) {
    // 1. Nó Central (Core)
    const coreAsset = rankedAssets[0];
    nodeCoords.set(String(coreAsset.id), { x: centerX, y: centerY, tier: 'core' });

    // 2. Camada Intermediária (até 4 Sub-Hubs agrupados por afinidade em X simétrico)
    const hubAssets = rankedAssets.slice(1, 5);
    const leftHubSlots = [
      { x: 225, y: 120 },
      { x: 225, y: 260 },
    ];
    const rightHubSlots = [
      { x: 495, y: 120 },
      { x: 495, y: 260 },
    ];

    const leftHubs: Asset[] = [];
    const rightHubs: Asset[] = [];

    for (const hub of hubAssets) {
      const hId = String(hub.id);
      if (leftHubs.length === 0) {
        leftHubs.push(hub);
      } else if (
        leftHubs.length < 2 &&
        (areConnected(hId, String(leftHubs[0].id)) || rightHubs.length >= 2)
      ) {
        leftHubs.push(hub);
      } else if (rightHubs.length < 2) {
        rightHubs.push(hub);
      } else {
        leftHubs.push(hub);
      }
    }

    leftHubs.forEach((h, i) => {
      const slot = leftHubSlots[i] || { x: 225, y: 190 };
      nodeCoords.set(String(h.id), { x: slot.x, y: slot.y, tier: 'hub' });
    });

    rightHubs.forEach((h, i) => {
      const slot = rightHubSlots[i] || { x: 495, y: 190 };
      nodeCoords.set(String(h.id), { x: slot.x, y: slot.y, tier: 'hub' });
    });

    // 3. Camada Externa (Periféricos distribuídos na mesma asa do Sub-Hub ao qual se conectam)
    const leafAssets = rankedAssets.slice(5);
    const leftLeaves: { asset: Asset; prefY: number }[] = [];
    const rightLeaves: { asset: Asset; prefY: number }[] = [];

    for (const leaf of leafAssets) {
      const lId = String(leaf.id);
      const neighbors = Array.from(neighborMap.get(lId) || []);
      let sumX = 0;
      let sumY = 0;
      let count = 0;

      for (const nId of neighbors) {
        const pos = nodeCoords.get(nId);
        if (pos) {
          sumX += pos.x;
          sumY += pos.y;
          count++;
        }
      }

      const avgX = count > 0 ? sumX / count : centerX;
      const avgY = count > 0 ? sumY / count : centerY;

      if (avgX < centerX - 10) {
        leftLeaves.push({ asset: leaf, prefY: avgY });
      } else if (avgX > centerX + 10) {
        rightLeaves.push({ asset: leaf, prefY: avgY });
      } else {
        if (leftLeaves.length <= rightLeaves.length) {
          leftLeaves.push({ asset: leaf, prefY: avgY });
        } else {
          rightLeaves.push({ asset: leaf, prefY: avgY });
        }
      }
    }

    // Ordena verticalmente cada asa pela posição Y do hub conectado para evitar cruzamento de linhas
    leftLeaves.sort((a, b) => a.prefY - b.prefY);
    rightLeaves.sort((a, b) => a.prefY - b.prefY);

    const assignWingCoords = (
      wingList: { asset: Asset; prefY: number }[],
      side: 'left' | 'right'
    ) => {
      const total = wingList.length;
      wingList.forEach((item, idx) => {
        const minY = total === 1 ? 190 : 75;
        const maxY = total === 1 ? 190 : 305;
        const y =
          total === 1
            ? centerY
            : Math.round(minY + (idx * (maxY - minY)) / (total - 1));
        // Leve curvatura em arco nas asas externas (estilo camadas de rede neural)
        const archOffset = Math.sin(((idx + 0.5) / Math.max(total, 1)) * Math.PI) * 22;
        const x =
          side === 'left'
            ? Math.round(105 - archOffset)
            : Math.round(615 + archOffset);

        nodeCoords.set(String(item.asset.id), { x, y, tier: 'leaf' });
      });
    };

    assignWingCoords(leftLeaves, 'left');
    assignWingCoords(rightLeaves, 'right');
  }

  const nodes: GraphNode[] = rankedAssets.map((asset) => {
    const pos = nodeCoords.get(String(asset.id)) || {
      x: centerX,
      y: centerY,
      tier: 'leaf',
    };
    return {
      id: String(asset.id),
      name: asset.nome,
      type: asset.tipo,
      x: pos.x,
      y: pos.y,
      risk: Number(asset.riscoFinal ?? 0),
      status: asset.status || 'online',
      tier: pos.tier,
    };
  });

  const assetRiskMap = new Map<string, number>(
    assets.map((a) => [String(a.id), Number(a.riscoFinal ?? 0)])
  );

  const seenConnIds = new Set<string>();
  const links: GraphLink[] = [];
  for (const asset of assets) {
    for (const conn of asset.conexoes || []) {
      const connKey = String(conn.id || `${conn.origemId}-${conn.destinoId}`);
      if (seenConnIds.has(connKey)) continue;
      seenConnIds.add(connKey);
      if (conn.status === 'Bloqueada') continue;

      const srcId = String(conn.origemId ?? asset.id);
      const dstId = String(conn.destinoId);
      const srcRisk = assetRiskMap.get(srcId) ?? 0;
      const dstRisk = assetRiskMap.get(dstId) ?? 0;
      const weight = Number(conn.pesoPropagacao ?? 0.1);

      links.push({
        source: srcId,
        target: dstId,
        weight,
        riskFlow:
          srcRisk >= 7.0 ||
          dstRisk >= 7.0 ||
          ((srcRisk > 0 || dstRisk > 0) && weight >= 0.3) ||
          weight >= 0.45,
      });
    }
  }

  const filteredNodes = nodes.filter(
    (n) =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNodeColor = (risk: number) => {
    if (risk >= 9.0)
      return {
        fill: '#7f1d1d',
        stroke: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.7)',
        text: '#fca5a5',
      };
    if (risk >= 7.0)
      return {
        fill: '#7c2d12',
        stroke: '#f97316',
        glow: 'rgba(249, 115, 22, 0.65)',
        text: '#fdba74',
      };
    if (risk >= 4.0)
      return {
        fill: '#14532d',
        stroke: '#10b981',
        glow: 'rgba(16, 185, 129, 0.5)',
        text: '#86efac',
      };
    return {
      fill: '#0c4a6e',
      stroke: '#0284c7',
      glow: 'rgba(56, 189, 248, 0.4)',
      text: '#7dd3fc',
    };
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

      <div className="relative flex-1 min-h-[350px] cyber-grid overflow-hidden flex items-center justify-center p-2">
        <svg
          viewBox="0 0 720 380"
          className="w-full h-full max-h-[430px] select-none transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <defs>
            <linearGradient id="riskLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="neutralLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {links.map((link, idx) => {
            const sNode = nodes.find((n) => n.id === link.source);
            const tNode = nodes.find((n) => n.id === link.target);
            if (!sNode || !tNode) return null;

            const isRisk = link.riskFlow;
            const dx = tNode.x - sNode.x;
            const dy = tNode.y - sNode.y;
            const dist = Math.hypot(dx, dy) || 1;
            const nx = -dy / dist;
            const ny = dx / dist;

            // Curva suave única sem linhas duplicadas
            const bendSign = sNode.y <= tNode.y ? 1 : -1;
            const bendAmount = Math.min(dist * 0.1, 18) * bendSign;
            const cx = (sNode.x + tNode.x) / 2 + nx * bendAmount;
            const cy = (sNode.y + tNode.y) / 2 + ny * bendAmount;
            const mainPath = `M${sNode.x},${sNode.y} Q${cx},${cy} ${tNode.x},${tNode.y}`;

            const labelX = 0.25 * sNode.x + 0.5 * cx + 0.25 * tNode.x;
            const labelY = 0.25 * sNode.y + 0.5 * cy + 0.25 * tNode.y;

            return (
              <g key={`link-${idx}`}>
                {isRisk && (
                  <path
                    d={mainPath}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="4.5"
                    strokeOpacity="0.12"
                    filter="url(#glow)"
                  />
                )}

                <path
                  d={mainPath}
                  fill="none"
                  stroke={isRisk ? 'url(#riskLineGrad)' : 'url(#neutralLineGrad)'}
                  strokeWidth={isRisk ? 2.0 : 1.2}
                  strokeDasharray={isRisk ? '5 3' : undefined}
                />

                {isRisk && (
                  <circle r="3" fill="#ef4444" filter="url(#glow)">
                    <animateMotion
                      path={mainPath}
                      dur={`${Math.max(1.4 / propagationSpeed, 0.45)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                <g transform={`translate(${labelX}, ${labelY})`}>
                  <rect
                    x="-11"
                    y="-6"
                    width="22"
                    height="11"
                    rx="3"
                    fill="#070b13"
                    fillOpacity="0.9"
                  />
                  <text
                    x="0"
                    y="2.5"
                    textAnchor="middle"
                    fill={isRisk ? '#fca5a5' : '#94a3b8'}
                    fontSize="8.5"
                    fontFamily="monospace"
                    className="tabular-nums"
                  >
                    {link.weight.toFixed(1)}
                  </text>
                </g>
              </g>
            );
          })}

          {filteredNodes.map((node) => {
            const colors = getNodeColor(node.risk);
            const isSelected = selectedAssetId === node.id || highlightedNode === node.id;
            const isHighRisk = node.risk >= 9.0;
            const isCore = node.tier === 'core';
            const isHub = node.tier === 'hub';

            const baseRadius = isCore ? 23 : isHub ? 17 : 14.5;
            const outerRadius = isSelected ? baseRadius + 2.5 : baseRadius;
            const innerRadius = isCore ? 8 : isHub ? 6.5 : 5.5;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node.id)}
                className="cursor-pointer group"
              >
                {isCore && (
                  <circle
                    r={outerRadius + 5}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="1"
                    strokeOpacity="0.35"
                    strokeDasharray="3 3"
                    className="pointer-events-none"
                  />
                )}

                {isHighRisk && (
                  <circle
                    r={outerRadius + 6}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.2"
                    strokeOpacity="0.35"
                    className="animate-ping pointer-events-none"
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />
                )}

                <circle
                  r={outerRadius}
                  fill={colors.fill}
                  stroke={isSelected ? '#ffffff' : colors.stroke}
                  strokeWidth={isSelected ? 2.8 : isCore ? 2.4 : 1.8}
                  className="transition-all duration-150 group-hover:stroke-white group-hover:stroke-[2.8px]"
                  style={{
                    filter: `drop-shadow(0 0 ${isCore ? '10px' : '7px'} ${colors.glow})`,
                  }}
                />

                <circle r={innerRadius} fill={colors.stroke} opacity="0.9" />

                {isHighRisk && (
                  <g
                    transform={`translate(-34, ${-(outerRadius + 15)})`}
                    className="pointer-events-none"
                  >
                    <rect
                      width="68"
                      height="12"
                      rx="3"
                      fill="#dc2626"
                      opacity="0.9"
                    />
                    <text
                      x="34"
                      y="8.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="7"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Risco Propagado
                    </text>
                  </g>
                )}

                <text
                  x="0"
                  y={outerRadius + 12}
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize={isCore ? '10' : '9'}
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {node.name}
                </text>
                <text
                  x="0"
                  y={outerRadius + 22}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="8.5"
                  fontFamily="monospace"
                  className="tabular-nums font-bold"
                >
                  {node.risk.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-2.5 border-t border-slate-800/80 bg-[#090e1a] text-xs font-mono text-slate-300">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="text-[11px] font-bold text-white flex items-center gap-1.5 shrink-0">
            <Cpu className="w-3.5 h-3.5 text-rose-500" />
            Matriz Adjacente (amostra):
          </span>
          <span className="text-[10px] text-cyan-300 bg-[#05080f] px-2.5 py-1 rounded border border-slate-800 whitespace-nowrap">
            {assets.length === 0
              ? 'P = [ ]'
              : `P (${assets.length}×${assets.length}) · α = ${propagationSpeed.toFixed(2)}`}
          </span>
        </div>

        <div className="flex items-center gap-3 min-w-[220px]">
          <span className="text-[11px] text-slate-400 whitespace-nowrap">
            Velocidade (α={propagationSpeed.toFixed(2)}):
          </span>
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.05"
            value={propagationSpeed}
            onChange={(e) => onPropagationSpeedChange(parseFloat(e.target.value))}
            className="w-28 accent-rose-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
