import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, Cpu } from 'lucide-react';
import { Asset } from '../types';

interface EditAssetModalProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Asset>) => Promise<void> | void;
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({ asset, isOpen, onClose, onSave }) => {
  const [nome, setNome] = useState(asset.nome);
  const [departamento, setDepartamento] = useState(asset.departamento);
  const [ip, setIp] = useState(asset.ip);
  const [mac, setMac] = useState(asset.mac);
  const [responsavel, setResponsavel] = useState(asset.responsavel || '');
  const [tipo, setTipo] = useState(asset.tipo);
  const [sistemaOperacional, setSistemaOperacional] = useState(asset.sistemaOperacional || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSaving(true);
    try {
      await onSave({
        nome: nome.trim(),
        departamento: departamento.trim(),
        ip: ip.trim(),
        mac: mac.trim(),
        sistemaOperacional: sistemaOperacional.trim(),
        tipo,
        responsavel: responsavel.trim(),
      });
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, unknown>;
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError) && typeof firstError[0] === 'string') {
          setErrorMsg(firstError[0]);
        } else if (typeof firstError === 'string') {
          setErrorMsg(firstError);
        } else {
          setErrorMsg('Não foi possível salvar as alterações. Verifique os dados informados.');
        }
      } else {
        setErrorMsg('Não foi possível salvar as alterações. Verifique a conexão com a API.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#0b101b] border border-rose-500/30 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.2)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1424]">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-semibold text-white tracking-wide">Editar Equipamento: {asset.nome}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs font-mono text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Nome do Ativo</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Departamento</label>
              <input
                type="text"
                required
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Endereço IP</label>
              <input
                type="text"
                required
                maxLength={15}
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm font-mono text-slate-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Endereço MAC</label>
              <input
                type="text"
                required
                maxLength={17}
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm font-mono text-slate-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Responsável (Opcional)</label>
              <input
                type="text"
                placeholder="Padrão: usuário logado"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Tipo de Ativo</label>
              <select
                required
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Asset['tipo'])}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="Database">Database (x1.5)</option>
                <option value="Gateway">Gateway (x1.0)</option>
                <option value="Internal Server">Internal Server (x1.5)</option>
                <option value="Workstation">Workstation (x0.5)</option>
                <option value="Cloud Endpoint">Cloud Endpoint (x1.5)</option>
                <option value="Firewall">Firewall (x0.5)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Sistema Operacional / Firmware</label>
              <input
                type="text"
                required
                value={sistemaOperacional}
                onChange={(e) => setSistemaOperacional(e.target.value)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Risco Final (Calculado pelo Motor)
              </label>
              <div className="w-full px-3 py-2 bg-[#060911]/60 border border-slate-800 rounded-lg text-sm font-mono flex items-center justify-between">
                <span className="text-slate-400 text-xs">Spectral Score:</span>
                <span className="text-rose-400 font-bold tabular-nums">{asset.riscoFinal.toFixed(2)} / 10.0</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-60 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
