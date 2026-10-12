import React, { useState } from 'react';
import { Equipamento } from '../../types/inventory';
import { X, Share2, ArrowRight, Trash2, Plus } from 'lucide-react';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ativoOrigem: Equipamento | null;
  todosAtivos: Equipamento[];
  onAddConexao: (origemId: string, destinoId: string) => void;
  onRemoveConexao: (origemId: string, destinoId: string) => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  ativoOrigem,
  todosAtivos,
  onAddConexao,
  onRemoveConexao,
}) => {
  const [alvoSelecionado, setAlvoSelecionado] = useState('');

  if (!isOpen || !ativoOrigem) return null;

  // Filtrar outros equipamentos que não sejam o próprio ativo
  const outrosEquipamentos = todosAtivos.filter(
    (a) => a.id_ativo !== ativoOrigem.id_ativo
  );

  const conexoesAtuais = ativoOrigem.conexoes || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alvoSelecionado) return;
    if (conexoesAtuais.includes(alvoSelecionado)) return;

    onAddConexao(ativoOrigem.id_ativo, alvoSelecionado);
    setAlvoSelecionado('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0d1527] border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>CONEXÕES DE REDE &amp; RISCO (MATRIZ A)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Rotas direcionadas de propagação a partir de {ativoOrigem.nome} (#{ativoOrigem.id_ativo})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Adicionar nova conexão */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-xs font-mono text-slate-300">
              Conectar com ativo de destino:
            </label>
            <div className="flex gap-2">
              <select
                value={alvoSelecionado}
                onChange={(e) => setAlvoSelecionado(e.target.value)}
                className="flex-1 bg-slate-900 text-xs font-mono text-slate-100 px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Selecione um ativo...</option>
                {outrosEquipamentos.map((outro) => {
                  const jaConectado = conexoesAtuais.includes(outro.id_ativo);
                  return (
                    <option key={outro.id_ativo} value={outro.id_ativo} disabled={jaConectado}>
                      {outro.nome} (#{outro.id_ativo} - {outro.tipo}) {jaConectado ? '✓ Já conectado' : ''}
                    </option>
                  );
                })}
              </select>
              <button
                type="submit"
                disabled={!alvoSelecionado}
                className="px-3.5 py-2 text-xs font-semibold text-cyan-200 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 disabled:opacity-40 rounded-md transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Rota</span>
              </button>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              * Isso cria uma aresta direcionada A[{ativoOrigem.id_ativo}][Destino] = 1 no modelo matemático.
            </p>
          </form>

          {/* Conexões ativas */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-mono text-slate-300 mb-2">
              Rotas ativas de saída ({conexoesAtuais.length}):
            </h4>

            {conexoesAtuais.length === 0 ? (
              <div className="p-4 bg-slate-900/50 rounded-lg text-center text-xs text-slate-400 font-mono">
                Nenhuma conexão cadastrada para este nó.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {conexoesAtuais.map((idDestino) => {
                  const dest = todosAtivos.find((a) => a.id_ativo === idDestino);
                  return (
                    <div
                      key={idDestino}
                      className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">{ativoOrigem.nome}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-200 font-bold">
                          {dest ? `${dest.nome} (#${dest.id_ativo})` : `#${idDestino}`}
                        </span>
                        {dest && (
                          <span className="text-[10px] text-slate-400">({dest.tipo})</span>
                        )}
                      </div>

                      <button
                        onClick={() => onRemoveConexao(ativoOrigem.id_ativo, idDestino)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                        title="Remover conexão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fechar */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
