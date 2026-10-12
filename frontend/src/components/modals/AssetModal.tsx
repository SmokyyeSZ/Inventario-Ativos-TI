import React, { useState, useEffect } from 'react';
import { Equipamento, TipoAtivo } from '../../types/inventory';
import { FATORES_EXPOSICAO } from '../../services/mathEngine';
import { X, Server, Database, Laptop, Router } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ativo: Equipamento) => void;
  initialAtivo?: Equipamento | null;
  existingIds: string[];
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAtivo,
  existingIds,
}) => {
  const [idAtivo, setIdAtivo] = useState('');
  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [tipo, setTipo] = useState<TipoAtivo>('SERVIDOR');
  const [ip, setIp] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (initialAtivo) {
      setIdAtivo(initialAtivo.id_ativo);
      setNome(initialAtivo.nome);
      setResponsavel(initialAtivo.responsavel);
      setDepartamento(initialAtivo.departamento);
      setTipo(initialAtivo.tipo);
      setIp(initialAtivo.ip || '');
      setErro('');
    } else {
      // Gerar ID sugerido
      const nextId = String(Math.floor(Math.random() * 899) + 100);
      setIdAtivo(nextId);
      setNome('');
      setResponsavel('Admin SecOps');
      setDepartamento('TI Infra');
      setTipo('SERVIDOR');
      setIp('');
      setErro('');
    }
  }, [initialAtivo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idAtivo.trim()) {
      setErro('Informe o ID do ativo.');
      return;
    }
    if (!nome.trim()) {
      setErro('Informe o nome ou hostname do ativo.');
      return;
    }
    // Validar se ID já existe em caso de novo ativo
    if (!initialAtivo && existingIds.includes(idAtivo.trim())) {
      setErro(`Já existe um ativo cadastrado com o ID ${idAtivo}`);
      return;
    }

    const updatedAtivo: Equipamento = {
      id_ativo: idAtivo.trim(),
      nome: nome.trim(),
      responsavel: responsavel.trim() || 'Admin',
      departamento: departamento.trim() || 'TI',
      tipo,
      ip: ip.trim() || `10.100.${idAtivo}.1`,
      vulnerabilidades: initialAtivo ? initialAtivo.vulnerabilidades : [],
      conexoes: initialAtivo ? initialAtivo.conexoes : [],
      risco_proprio: initialAtivo ? initialAtivo.risco_proprio : 0,
      risco_final: initialAtivo ? initialAtivo.risco_final : 0,
      x: initialAtivo ? initialAtivo.x : 400 + Math.floor(Math.random() * 100),
      y: initialAtivo ? initialAtivo.y : 250 + Math.floor(Math.random() * 100),
    };

    onSave(updatedAtivo);
    onClose();
  };

  const fatorExpo = FATORES_EXPOSICAO[tipo];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#0d1527] border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono tracking-tight">
              {initialAtivo ? `[ EDITAR ATIVO #${initialAtivo.id_ativo} ]` : '[ NOVO ATIVO DE TI ]'}
            </h3>
            <p className="text-xs text-slate-400">
              Registrar parâmetros no inventário de rede e topologia
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {erro && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-md font-mono">
              [ERRO] {erro}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                ID do Ativo (Número) *
              </label>
              <input
                type="text"
                disabled={!!initialAtivo}
                value={idAtivo}
                onChange={(e) => setIdAtivo(e.target.value)}
                placeholder="Ex: 205"
                required
                className="w-full bg-slate-900 text-xs font-mono text-slate-100 px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                IP Address (Opcional)
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="10.100.1.50"
                className="w-full bg-slate-900 text-xs font-mono text-slate-100 px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Nome / Hostname do Ativo *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Srv-Auth-02 ou Web-Portal-GW"
              required
              className="w-full bg-slate-900 text-xs text-slate-100 px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Responsável
              </label>
              <input
                type="text"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Ex: SecOps Admin"
                className="w-full bg-slate-900 text-xs text-slate-100 px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Departamento / Setor
              </label>
              <input
                type="text"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                placeholder="Ex: TI Infra, RH, Financeiro"
                className="w-full bg-slate-900 text-xs text-slate-100 px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Tipo de Ativo Selector */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-2">
              Tipo de Ativo &amp; Fator de Exposição (POO):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['SERVIDOR', 'BANCO_DE_DADOS', 'ROTEADORES', 'NOTEBOOK'] as TipoAtivo[]).map((t) => {
                const isSelected = tipo === t;
                const fator = FATORES_EXPOSICAO[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold font-mono truncate">{t}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      Fator: <span className="text-cyan-400 font-bold">{fator}x</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-2">
              * Servidores e Bancos de Dados possuem fator 1.5x de risco por criticidade operacional.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors shadow-lg shadow-rose-900/30"
            >
              Salvar Equipamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
