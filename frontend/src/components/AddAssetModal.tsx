import React, { useState } from 'react';
import { X, Server, Plus } from 'lucide-react';
import { Asset, SeverityLevel } from '../types';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newAsset: Asset) => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [nome, setNome] = useState('');
  const [departamento, setDepartamento] = useState('Infraestrutura Cloud');
  const [ip, setIp] = useState('10.100.');
  const [tipo, setTipo] = useState<Asset['tipo']>('Internal Server');
  const [responsavel,setResponsavel] = useState('');
  const [criticidade, setCriticidade] = useState<SeverityLevel>('High');
  const [sistemaOperacional, setSistemaOperacional] = useState('Ubuntu Linux 24.04 LTS');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !ip.trim()) return;

    const baseRisk = criticidade === 'Critical' ? 9.1 : criticidade === 'High' ? 7.5 : criticidade === 'Medium' ? 4.8 : 2.2;

    const newAsset: Asset = {
      id: `ast-${Date.now().toString().slice(-4)}`,
      nome: nome.trim().toUpperCase(),
      departamento: departamento.trim(),
      ip: ip.trim(),
      mac: '00:1A:2B:' + Math.floor(10 + Math.random() * 89) + ':' + Math.floor(10 + Math.random() * 89) + ':' + Math.floor(10 + Math.random() * 89),
      tipo,
      responsavel,
      criticidade,
      riscoFinal: baseRisk,
      pesoPropagacao: baseRisk / 12,
      status: 'online',
      ultimoScan: 'Agora mesmo',
      sistemaOperacional,
      cves: [],
      conexoes: [],
    };

    onAdd(newAsset);
    onClose();
    setNome('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0b101b] border border-cyan-500/30 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1424]">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white tracking-wide">Cadastrar Novo Ativo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Nome do Ativo</label>
            <input
              type="text"
              required
              placeholder="Ex: PROD-API-03, AUTH-SRV"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 uppercase focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Departamento</label>
              <input
                type="text"
                required
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className='block text-xs font-mono text-slate-400 mb-1.5'>Responsavel</label>
              <input
                type="text"
                required
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Endereço IP</label>
              <input
                type="text"
                required
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Tipo de Ativo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Asset['tipo'])}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Database">Database Server</option>
                <option value="Gateway">API Gateway / Proxy</option>
                <option value="Internal Server">Servidor Interno</option>
                <option value="Workstation">Estação de Trabalho</option>
                <option value="Cloud Endpoint">Cloud Endpoint</option>
                <option value="Firewall">Firewall / Borda</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Criticidade</label>
              <select
                value={criticidade}
                onChange={(e) => setCriticidade(e.target.value as SeverityLevel)}
                className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Critical">Crítica (Score ~9.1)</option>
                <option value="High">Alta (Score ~7.5)</option>
                <option value="Medium">Média (Score ~4.8)</option>
                <option value="Low">Baixa (Score ~2.2)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Sistema Operacional</label>
            <input
              type="text"
              value={sistemaOperacional}
              onChange={(e) => setSistemaOperacional(e.target.value)}
              className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
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
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar ao Inventário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
