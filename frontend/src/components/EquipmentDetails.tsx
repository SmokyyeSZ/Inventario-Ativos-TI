import React, { useState } from 'react';
import {
  Edit3,
  ShieldAlert,
  Terminal,
  Server,
  ArrowRightLeft,
  Trash2,
  Plus,
  Network,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Radio,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Asset, CveItem, NetworkConnection } from '../types';

interface EquipmentDetailsProps {
  asset: Asset;
  allAssets: Asset[];
  onSelectAnotherAsset: (asset: Asset) => void;
  onOpenEdit: () => void;
  onOpenLinkCve: () => void;
  onOpenConnect: () => void;
  onUnlinkCve: (cveId: string) => void;
  onAddConnection: (connection: NetworkConnection) => void;
  onUpdateConnection: (connId: string, connection: Partial<NetworkConnection>) => void;
  onDeleteConnection: (connId: string) => void;
}

export const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({
  asset,
  allAssets,
  onSelectAnotherAsset,
  onOpenEdit,
  onOpenLinkCve,
  onOpenConnect,
  onUnlinkCve,
  onAddConnection,
  onUpdateConnection,
  onDeleteConnection,
}) => {
  const otherAssets = allAssets.filter((a) => String(a.id) !== String(asset.id));
  const [showAddConn, setShowAddConn] = useState(false);
  const [editingConnId, setEditingConnId] = useState<string | null>(null);
  const [targetAssetId, setTargetAssetId] = useState(otherAssets[0]?.id || '');
  const [port, setPort] = useState(443);
  const [protocol, setProtocol] = useState('HTTPS / TLS');
  const [weight, setWeight] = useState(0.5);
  const [direction, setDirection] = useState<NetworkConnection['direcao']>('Bidirecional');
  const [connStatus, setConnStatus] = useState<NetworkConnection['status']>('Ativa');

  const selectedTargetId = otherAssets.some((a) => String(a.id) === String(targetAssetId))
    ? targetAssetId
    : otherAssets[0]?.id || '';

  const handleOpenNewConn = () => {
    setEditingConnId(null);
    setTargetAssetId(otherAssets[0]?.id || '');
    setPort(443);
    setProtocol('HTTPS / TLS');
    setWeight(0.5);
    setDirection('Bidirecional');
    setConnStatus('Ativa');
    setShowAddConn(!showAddConn);
  };

  const handleStartEditConn = (conn: NetworkConnection) => {
    setEditingConnId(conn.id);
    setTargetAssetId(conn.destinoId);
    setPort(conn.porta);
    setProtocol(conn.protocolo);
    setWeight(conn.pesoPropagacao);
    setDirection(conn.direcao);
    setConnStatus(conn.status || 'Ativa');
    setShowAddConn(true);
  };

  const handleCreateConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingConnId) {
      onUpdateConnection(editingConnId, {
        porta: Number(port),
        protocolo: protocol,
        pesoPropagacao: Number(weight),
        direcao: direction,
        status: connStatus,
      });
      setEditingConnId(null);
      setShowAddConn(false);
      return;
    }

    const targetAsset = otherAssets.find((a) => String(a.id) === String(selectedTargetId));
    if (!targetAsset) return;

    const newConn: NetworkConnection = {
      id: `conn-${Date.now().toString().slice(-4)}`,
      origemId: asset.id,
      destinoId: targetAsset.id,
      destinoNome: targetAsset.nome,
      porta: Number(port),
      protocolo: protocol,
      pesoPropagacao: Number(weight),
      direcao: direction,
      status: connStatus,
    };

    onAddConnection(newConn);
    setShowAddConn(false);
  };

  const getRiskBorder = (score: number) => {
    if (score >= 9.0) return 'border-rose-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
    if (score >= 7.0) return 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
    if (score >= 4.0) return 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
    return 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]';
  };

  return (
    <div className="space-y-6">
      <div className={`bg-[#070b13] border rounded-xl p-6 relative overflow-hidden ${getRiskBorder(asset.riscoFinal)}`}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#0b1325] border border-slate-700 flex items-center justify-center shrink-0">
              <Server className="w-8 h-8 text-rose-500" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
                  {asset.nome}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {asset.tipo}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  Criticidade: {asset.criticidade.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400">
                <span>Departamento: <strong className="text-slate-200">{asset.departamento}</strong></span>
                <span>·</span>
                <span>IP: <strong className="text-cyan-400">{asset.ip}</strong></span>
                <span>·</span>
                <span>MAC: <strong className="text-slate-300">{asset.mac}</strong></span>
                <span>·</span>
                <span>SO: <strong className="text-slate-300">{asset.sistemaOperacional}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-4 px-4 py-2 bg-[#05080f] border border-slate-800 rounded-lg">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Risco Final</span>
                <div className="text-xl font-mono font-extrabold text-rose-400 tabular-nums">
                  {asset.riscoFinal.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 10</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 rounded-full border-2 border-rose-500"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${asset.riscoFinal * 10}% 0%, 100% 100%, 0% 100%)`,
                  }}
                ></div>
                <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenEdit}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-600 transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                <Edit3 className="w-4 h-4 text-rose-400" />
                Editar
              </button>

              <button
                onClick={onOpenLinkCve}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all cursor-pointer whitespace-nowrap"
              >
                <ShieldAlert className="w-4 h-4" />
                Vincular CVE
              </button>

              <button
                onClick={onOpenConnect}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer whitespace-nowrap"
              >
                <Terminal className="w-4 h-4" />
                Conectar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Último scan de integridade: {asset.ultimoScan}
            </span>
            <span className="flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-cyan-500" />
              Peso de propagação espectral: {(asset.pesoPropagacao * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>Alternar Equipamento:</span>
            <select
              value={asset.id}
              onChange={(e) => {
                const target = allAssets.find((a) => String(a.id) === String(e.target.value));
                if (target) onSelectAnotherAsset(target);
              }}
              className="px-2.5 py-1 bg-[#05080f] border border-slate-700 rounded text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {allAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} ({a.riscoFinal.toFixed(1)} - {a.departamento})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#070b13] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Vulnerabilidades Vinculadas (CVEs)
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Mapeadas pelo motor de risco e auditorias
                </p>
              </div>
            </div>

            <button
              onClick={onOpenLinkCve}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800 text-xs font-semibold font-mono transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Vincular CVE
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {asset.cves.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                Nenhuma vulnerabilidade CVE vinculada a este equipamento.
              </div>
            ) : (
              asset.cves.map((cve) => (
                <div
                  key={cve.id}
                  className="p-4 rounded-lg bg-[#05080f] border border-slate-800 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-amber-400">{cve.id}</span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        cve.cvss >= 9.0
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        CVSS {cve.cvss.toFixed(1)}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {cve.vetorAtaque}
                      </span>
                    </div>

                    <button
                      onClick={() => onUnlinkCve(cve.id)}
                      title="Desvincular CVE do Ativo"
                      className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    {cve.descricao}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
                    <span>Descoberta: {cve.dataDescoberta}</span>
                    <span className="text-amber-300">Status: {cve.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#070b13] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Conexões de Rede (Topologia deste Ativo)
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Rotas de tráfego e vetores de propagação lateral
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenNewConn}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800 text-xs font-semibold font-mono transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Conexão
            </button>
          </div>

          {showAddConn && (
            <form onSubmit={handleCreateConnection} className="p-3.5 mb-4 bg-[#05080f] border border-cyan-500/40 rounded-lg space-y-3">
              <h3 className="text-xs font-mono font-bold text-cyan-300">
                {editingConnId ? 'Editar Conexão de Rede' : 'Criar Conexão de Rede Lateral'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Destino</label>
                  <select
                    value={selectedTargetId}
                    disabled={Boolean(editingConnId)}
                    onChange={(e) => setTargetAssetId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#0a1120] border border-slate-700 rounded text-xs font-mono text-slate-200 disabled:opacity-60"
                  >
                    {otherAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome} ({a.ip})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Porta</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#0a1120] border border-slate-700 rounded text-xs font-mono text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Protocolo / Serviço</label>
                  <input
                    type="text"
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
                    placeholder="Ex: TCP / PostgreSQL TLS"
                    className="w-full px-2.5 py-1.5 bg-[#0a1120] border border-slate-700 rounded text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Peso de Propagação: <span className="text-rose-400 font-bold tabular-nums">{weight.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Direção do Tráfego</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as NetworkConnection['direcao'])}
                    className="w-full px-2.5 py-1.5 bg-[#0a1120] border border-slate-700 rounded text-xs font-mono text-slate-200"
                  >
                    <option value="Bidirecional">Bidirecional (↔ Ambos os sentidos)</option>
                    <option value="Outbound">Outbound (→ Sai deste ativo)</option>
                    <option value="Inbound">Inbound (← Entra neste ativo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Status da Conexão</label>
                  <select
                    value={connStatus}
                    onChange={(e) => setConnStatus(e.target.value as NetworkConnection['status'])}
                    className="w-full px-2.5 py-1.5 bg-[#0a1120] border border-slate-700 rounded text-xs font-mono text-slate-200"
                  >
                    <option value="Ativa">Ativa (Propaga risco)</option>
                    <option value="Monitorada">Monitorada (Sob observação)</option>
                    <option value="Bloqueada">Bloqueada (Isolada pelo Firewall)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingConnId(null);
                    setShowAddConn(false);
                  }}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded cursor-pointer"
                >
                  {editingConnId ? 'Atualizar Conexão' : 'Salvar Conexão'}
                </button>
              </div>
            </form>
          )}

          <div className="flex-1 space-y-3">
            {asset.conexoes.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
                <Network className="w-8 h-8 text-cyan-500 mx-auto mb-2 opacity-60" />
                Nenhuma conexão registrada para este ativo no grafo de rede.
              </div>
            ) : (
              asset.conexoes.map((conn) => (
                <div
                  key={conn.id}
                  className="p-3.5 rounded-lg bg-[#05080f] border border-slate-800 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{conn.destinoNome}</span>
                      <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                        Porta {conn.porta}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {conn.protocolo}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        conn.status === 'Bloqueada'
                          ? 'bg-rose-950/60 text-rose-400 border-rose-800/80'
                          : conn.status === 'Monitorada'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/80'
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                      }`}>
                        {conn.status || 'Ativa'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditConn(conn)}
                        title="Editar Conexão"
                        className="p-1 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteConnection(conn.id)}
                        title="Excluir Conexão"
                        className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                      Direção: {conn.direcao}
                    </span>
                    <span>
                      Peso no Grafo: <strong className="text-rose-400 tabular-nums">w={conn.pesoPropagacao.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
