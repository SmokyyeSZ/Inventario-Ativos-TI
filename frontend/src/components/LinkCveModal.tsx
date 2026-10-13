import React, { useState } from 'react';
import { X, ShieldAlert, Plus, Check } from 'lucide-react';
import { CveItem, SeverityLevel } from '../types';

interface LinkCveModalProps {
  assetName: string;
  isOpen: boolean;
  onClose: () => void;
  onLink: (cve: CveItem) => void;
}

const COMMON_CVES: CveItem[] = [
  {
    id: 'CVE-2024-3094',
    cvss: 9.8,
    severidade: 'Critical',
    descricao: 'Injeção de código malicioso e backdoor nas rotinas de autenticação de bibliotecas XZ/SSH.',
    vetorAtaque: 'Network / Remote Execution',
    dataDescoberta: '2024-03-29',
    status: 'Ativo',
  },
  {
    id: 'CVE-2023-38606',
    cvss: 9.2,
    severidade: 'Critical',
    descricao: 'Vulnerabilidade zero-click em parser de pacotes binários e tabelas de memória gráfica.',
    vetorAtaque: 'Network / Zero-Click',
    dataDescoberta: '2023-08-11',
    status: 'Ativo',
  },
  {
    id: 'CVE-2024-21413',
    cvss: 8.8,
    severidade: 'High',
    descricao: 'Bypass de validação de protocolo monikers permitindo execução arbitrária sem restrições.',
    vetorAtaque: 'Remote / Pre-Auth',
    dataDescoberta: '2024-02-14',
    status: 'Ativo',
  },
  {
    id: 'CVE-2023-4863',
    cvss: 8.8,
    severidade: 'High',
    descricao: 'Heap buffer overflow em codificador libwebp desencadeando escalonamento de privilégio local.',
    vetorAtaque: 'Local / Remote Web',
    dataDescoberta: '2023-09-12',
    status: 'Ativo',
  },
  {
    id: 'CVE-2024-0519',
    cvss: 7.5,
    severidade: 'High',
    descricao: 'Acesso de memória fora dos limites em motor V8 utilizado em serviços microfrontends.',
    vetorAtaque: 'Network / Web Access',
    dataDescoberta: '2024-01-16',
    status: 'Ativo',
  },
];

export const LinkCveModal: React.FC<LinkCveModalProps> = ({ assetName, isOpen, onClose, onLink }) => {
  const [cveId, setCveId] = useState('');
  const [cvss, setCvss] = useState(8.5);
  const [descricao, setDescricao] = useState('');
  const [vetorAtaque, setVetorAtaque] = useState('Network / Unauthenticated');
  const [severidade, setSeveridade] = useState<SeverityLevel>('High');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cveId.trim()) return;

    const newCve: CveItem = {
      id: cveId.trim().toUpperCase(),
      cvss: Number(cvss),
      severidade,
      descricao: descricao.trim() || 'Vulnerabilidade vinculada manualmente para análise de propagação.',
      vetorAtaque,
      dataDescoberta: new Date().toISOString().split('T')[0],
      status: 'Ativo',
    };

    onLink(newCve);
    onClose();
  };

  const handleQuickLink = (cve: CveItem) => {
    onLink(cve);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0b101b] border border-amber-500/30 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.2)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1424]">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-white tracking-wide">
              Vincular Nova CVE a {assetName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
              Vincular CVE Catalogada Rapidamente
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {COMMON_CVES.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#070b13] border border-slate-800 hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-amber-400">{item.id}</span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        item.cvss >= 9 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        CVSS {item.cvss}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{item.vetorAtaque}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-1">{item.descricao}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLink(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-md shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Vincular
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
              Ou Cadastrar e Vincular Nova CVE
            </h3>
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Identificador CVE</label>
                  <input
                    type="text"
                    required
                    placeholder="CVE-2024-XXXXX"
                    value={cveId}
                    onChange={(e) => setCveId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm font-mono text-slate-100 uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Pontuação CVSS: <span className="text-amber-400 font-bold tabular-nums">{cvss.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={cvss}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCvss(val);
                      if (val >= 9.0) setSeveridade('Critical');
                      else if (val >= 7.0) setSeveridade('High');
                      else if (val >= 4.0) setSeveridade('Medium');
                      else setSeveridade('Low');
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Vetor de Ataque</label>
                  <input
                    type="text"
                    value={vetorAtaque}
                    onChange={(e) => setVetorAtaque(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Severidade</label>
                  <select
                    value={severidade}
                    onChange={(e) => setSeveridade(e.target.value as SeverityLevel)}
                    className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Critical">Crítica (CVSS 9.0 - 10.0)</option>
                    <option value="High">Alta (CVSS 7.0 - 8.9)</option>
                    <option value="Medium">Média (CVSS 4.0 - 6.9)</option>
                    <option value="Low">Baixa (CVSS 0.1 - 3.9)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Descrição Técnica da Falha</label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Detalhamento técnico da vulnerabilidade identificada..."
                  className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Salvar e Vincular
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
