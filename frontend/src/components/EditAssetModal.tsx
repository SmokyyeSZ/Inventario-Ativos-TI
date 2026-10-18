import React, { useState } from 'react';
import { X, Save, ShieldAlert, Cpu } from 'lucide-react';
import { Asset, SeverityLevel } from '../types';

interface EditAssetModalProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Asset>) => void;
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({ asset, isOpen, onClose, onSave }) => {
  const [nome, setNome] = useState(asset.nome);
  const [departamento, setDepartamento] = useState(asset.departamento);
  const [ip, setIp] = useState(asset.ip);
  const [mac, setMac] = useState(asset.mac);
  const [responsavel, setResponsavel] = useState(asset.responsavel)
  const [tipo, setTipo] = useState(asset.tipo);
  const [sistemaOperacional, setSistemaOperacional] = useState(asset.sistemaOperacional);
  const [criticidade, setCriticidade] = useState<SeverityLevel>(asset.criticidade);
  const [riscoFinal, setRiscoFinal] = useState<number>(asset.riscoFinal);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nome,
      departamento,
      ip,
      mac,
      sistemaOperacional,
      criticidade,
      riscoFinal: Number(riscoFinal),
      tipo,
      responsavel,
    });
    onClose();
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
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm font-mono text-slate-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Responsável</label>
              <input
                type="text"
                required
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
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="Database">Database</option>
                <option value="Gateway">Gateway</option>
                <option value="Internal Server">Internal Server</option>
                <option value="Workstation">Workstation</option>
                <option value="Cloud Endpoint">Cloud Endpoint</option>
                <option value="Firewall">Firewall</option>
              </select>
            </div>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Criticidade Operacional</label>
              <select
                required
                value={criticidade}
                onChange={(e) => setCriticidade(e.target.value as SeverityLevel)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Critical">Crítica (Tier 1 / Multiplica Risco x2.0)</option>
                <option value="High">Alta (Produção / Multiplica Risco x1.5)</option>
                <option value="Medium">Média (Apoio / Mantém Risco x1.0)</option>
                <option value="Low">Baixa (Isolado / Reduz Risco x0.5)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Risco Final Calculado: <span className="text-rose-400 font-bold tabular-nums">{riscoFinal.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={riscoFinal}
                onChange={(e) => setRiscoFinal(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
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
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
