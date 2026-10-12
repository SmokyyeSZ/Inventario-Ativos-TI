import React from 'react';
import { Equipamento } from '../../types/inventory';
import { 
  X, 
  ShieldAlert, 
  Share2, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Edit3, 
  Unlink, 
  ExternalLink,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface AssetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ativo: Equipamento | null;
  todosAtivos: Equipamento[];
  onOpenEditModal: (ativo: Equipamento) => void;
  onOpenCveModal: (ativo: Equipamento) => void;
  onOpenConnectModal: (ativo: Equipamento) => void;
  onRemoveVuln: (ativoId: string, vulnId: string, cveCode?: string) => void;
  onDisconnect: (ativoId: string, conexaoId: string) => void;
}

export const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({
  isOpen,
  onClose,
  ativo,
  todosAtivos,
  onOpenEditModal,
  onOpenCveModal,
  onOpenConnectModal,
  onRemoveVuln,
  onDisconnect,
}) => {
  if (!isOpen || !ativo) return null;

  const isCritico = ativo.risco_final >= 15;
  const isAlto = ativo.risco_final >= 10 && ativo.risco_final < 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Detalhes do Equipamento */}
        <div className="px-5 py-4 bg-[#0d1527] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isCritico
                  ? 'bg-rose-500 animate-pulse'
                  : isAlto
                  ? 'bg-amber-500'
                  : 'bg-cyan-400'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 font-mono tracking-tight">
                  {ativo.nome}
                </h3>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  ID: #{ativo.id_ativo}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  [detalhes_equipamentos/{ativo.id_ativo}]
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Departamento: <strong className="text-slate-200">{ativo.departamento}</strong> · Responsável: <strong className="text-slate-200">{ativo.responsavel}</strong> · Tipo: <strong className="text-slate-200">{ativo.tipo}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions Bar matching detalhes.html: Editar, Vincular CVE, Conectar */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Ações do Ativo:</span>
            <button
              onClick={() => {
                onClose();
                onOpenEditModal(ativo);
              }}
              className="px-2.5 py-1 text-xs font-mono text-slate-200 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Editar campos do ativo (editar_equipamento)"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenCveModal(ativo);
              }}
              className="px-2.5 py-1 text-xs font-mono text-cyan-200 bg-cyan-950/80 hover:bg-cyan-900 rounded border border-cyan-800 flex items-center gap-1.5 transition-colors"
              title="Vincular nova CVE da NVD (vincular_cve)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vincular CVE</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenConnectModal(ativo);
              }}
              className="px-2.5 py-1 text-xs font-mono text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 rounded border border-emerald-800 flex items-center gap-1.5 transition-colors"
              title="Conectar rota de risco com outro ativo (conexao_risco)"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Conectar</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Risco Atual: <strong className={isCritico ? 'text-rose-400 text-sm' : isAlto ? 'text-amber-400 text-sm' : 'text-cyan-400 text-sm'}>{ativo.risco_final.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Key Metric Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Risco Próprio (b)</span>
              <span className="text-base font-bold font-mono text-slate-200">
                {ativo.risco_proprio.toFixed(2)}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                ∑ CVSS × Fator {ativo.tipo === 'SERVIDOR' || ativo.tipo === 'BANCO_DE_DADOS' ? '1.5x' : '1.0x'}
              </span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Risco Final Propagado (x)</span>
              <span
                className={`text-base font-bold font-mono ${
                  isCritico ? 'text-rose-400' : isAlto ? 'text-amber-400' : 'text-cyan-400'
                }`}
              >
                {ativo.risco_final.toFixed(2)}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                (I - α·A)⁻¹ · b
              </span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Endereço IP &amp; Rede</span>
              <span className="text-xs font-mono text-cyan-300 font-semibold truncate block">
                {ativo.ip || `10.100.${ativo.id_ativo}.1`}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                Status: Monitorado
              </span>
            </div>
          </div>

          {/* Seção 1: Vulnerabilidades (CVEs) matching detalhes.html */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Vulnerabilidades (CVEs) · Total: {ativo.vulnerabilidades.length}</span>
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenCveModal(ativo);
                }}
                className="px-2 py-1 text-xs font-semibold text-rose-200 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 rounded transition-colors flex items-center gap-1 font-mono text-[11px]"
              >
                <Plus className="w-3 h-3" />
                <span>Registrar CVE</span>
              </button>
            </div>

            {ativo.vulnerabilidades.length === 0 ? (
              <div className="p-4 bg-slate-900/80 rounded-lg text-center text-xs text-slate-400 font-mono">
                Nenhuma falha de segurança associada a este equipamento.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {ativo.vulnerabilidades.map((vuln) => (
                  <div
                    key={vuln.id}
                    className="p-3 bg-slate-900/95 border border-slate-800/90 rounded-lg space-y-1.5 relative group hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-rose-400 bg-rose-950/70 px-2 py-0.5 rounded border border-rose-900/80">
                          {vuln.cve_code || 'CVE-N/A'}
                        </span>
                        <span className="text-xs font-mono text-slate-300 font-medium truncate max-w-[200px]">
                          {vuln.categoria}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-slate-400">
                          CVSS: <strong className="text-rose-400">{vuln.score}</strong> ({vuln.severidade})
                        </span>
                        {/* Botão Remover CVE (matching remover_cve) */}
                        <button
                          onClick={() => onRemoveVuln(ativo.id_ativo, vuln.id, vuln.cve_code)}
                          className="px-2 py-0.5 text-[11px] font-mono text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 rounded transition-colors flex items-center gap-1"
                          title="Remover vulnerabilidade (remover_cve)"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {vuln.descricao}
                    </p>

                    <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60 flex justify-between">
                      <span>Status de Tratamento: <strong className="text-cyan-400">{vuln.status}</strong></span>
                      <span className="text-slate-400">Endpoint: remover_cve/{ativo.id_ativo}/{vuln.cve_code || vuln.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seção 2: Conexões de Rede (desconectar) matching detalhes.html */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Conexões de Rede (Rotas de Propagação) · Total: {(ativo.conexoes || []).length}</span>
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenConnectModal(ativo);
                }}
                className="px-2 py-1 text-xs font-semibold text-cyan-200 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 rounded transition-colors flex items-center gap-1 font-mono text-[11px]"
              >
                <Plus className="w-3 h-3" />
                <span>Nova Conexão</span>
              </button>
            </div>

            {(ativo.conexoes || []).length === 0 ? (
              <p className="p-4 bg-slate-900/80 rounded-lg text-center text-xs text-slate-400 font-mono">
                Nenhuma conexão de rede registrada para este equipamento.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {ativo.conexoes.map((targetId) => {
                  const target = todosAtivos.find((a) => a.id_ativo === targetId);
                  return (
                    <div
                      key={targetId}
                      className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">{ativo.nome}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-100 font-bold">
                          {target ? `${target.nome} (#${target.id_ativo})` : `#${targetId}`}
                        </span>
                        {target && (
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {target.tipo} · {target.departamento}
                          </span>
                        )}
                      </div>

                      {/* Botão Desconectar (matching desconectar) */}
                      <button
                        onClick={() => onDisconnect(ativo.id_ativo, targetId)}
                        className="px-2 py-0.5 text-[11px] font-mono text-amber-300 bg-amber-950/60 hover:bg-amber-900 border border-amber-800/80 rounded transition-colors flex items-center gap-1"
                        title="Desconectar rota de rede (desconectar)"
                      >
                        <Unlink className="w-3 h-3" />
                        <span>Desconectar</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0d1527] border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            Sincronizado com modelo Django Equipamento &amp; Vulnerabilidade
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
