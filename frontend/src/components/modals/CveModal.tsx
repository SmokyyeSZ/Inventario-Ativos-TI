import React, { useState } from 'react';
import { Equipamento, Vulnerabilidade, SeveridadeVulnerabilidade, StatusTratamento } from '../../types/inventory';
import { buscarCveNvd, validarFormatoCve, calcularSeveridadePorScore } from '../../services/cveService';
import { X, Search, ShieldAlert, Sparkles, Check } from 'lucide-react';

interface CveModalProps {
  isOpen: boolean;
  onClose: () => void;
  ativo: Equipamento | null;
  onAddVulnerabilidade: (ativoId: string, vuln: Vulnerabilidade) => void;
}

export const CveModal: React.FC<CveModalProps> = ({
  isOpen,
  onClose,
  ativo,
  onAddVulnerabilidade,
}) => {
  const [cveCode, setCveCode] = useState('CVE-2024-3094');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Vulnerabilidade Crítica');
  const [severidade, setSeveridade] = useState<SeveridadeVulnerabilidade>('CRITICA');
  const [status, setStatus] = useState<StatusTratamento>('ABERTO');
  const [score, setScore] = useState<number>(9.5);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen || !ativo) return null;

  const handleBuscarNvd = async () => {
    setErro(null);
    setSearchSuccess(null);

    if (!validarFormatoCve(cveCode)) {
      setErro(`'${cveCode}' não está no formato correto (Ex: CVE-2024-1234).`);
      return;
    }

    setIsSearching(true);
    try {
      const res = await buscarCveNvd(cveCode);
      setDescricao(res.descricao);
      setCategoria(res.categoria);
      setScore(res.score);
      setSeveridade(res.severidade);
      setSearchSuccess(
        res.source === 'NVD_API'
          ? `[SUCESSO] ${res.cveId} encontrado na base NVD NIST com score CVSS ${res.score}!`
          : `[INFO] Registro encontrado no repositório de vulnerabilidades (CVSS ${res.score})`
      );
    } catch {
      setErro('Erro ao consultar a API NVD NIST. Verifique a conexão ou preencha manualmente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    setSeveridade(calcularSeveridadePorScore(newScore));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) {
      setErro('A descrição da vulnerabilidade não pode ficar vazia.');
      return;
    }

    const novaVuln: Vulnerabilidade = {
      id: `vuln-${Date.now()}`,
      cve_code: cveCode.trim().toUpperCase() || undefined,
      descricao: descricao.trim(),
      categoria: categoria.trim() || 'Cibersegurança',
      severidade,
      status,
      score,
    };

    onAddVulnerabilidade(ativo.id_ativo, novaVuln);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0d1527] border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>VINCULAR CVE · {ativo.nome} (#{ativo.id_ativo})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Consulta à base oficial NVD NIST (CVSS v3.1)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {erro && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-md font-mono">
              [AVISO] {erro}
            </div>
          )}

          {searchSuccess && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-md font-mono flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />
              <span>{searchSuccess}</span>
            </div>
          )}

          {/* CVE Input com botão de busca NIST */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Código CVE (Formato: CVE-YYYY-NNNN)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cveCode}
                onChange={(e) => setCveCode(e.target.value.toUpperCase())}
                placeholder="Ex: CVE-2024-3094"
                className="flex-1 bg-slate-900 text-xs font-mono text-slate-100 px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500 uppercase"
              />
              <button
                type="button"
                onClick={handleBuscarNvd}
                disabled={isSearching}
                className="px-3.5 py-2 text-xs font-semibold text-cyan-200 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 rounded-md transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isSearching ? (
                  <>
                    <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>NVD...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Buscar NVD</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Descrição Técnica da Vulnerabilidade *
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o impacto da falha, vetor de ataque e componentes afetados..."
              required
              className="w-full bg-slate-900 text-xs text-slate-100 px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Categoria
              </label>
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: Falha de Configuração"
                className="w-full bg-slate-900 text-xs text-slate-100 px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Status de Tratamento
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusTratamento)}
                className="w-full bg-slate-900 text-xs font-mono text-slate-100 px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="ABERTO">ABERTO</option>
                <option value="EM_TRATAMENTO">EM TRATAMENTO</option>
                <option value="CORRIGIDA">CORRIGIDA</option>
                <option value="RISCO_ACEITO">RISCO ACEITO</option>
              </select>
            </div>
          </div>

          {/* CVSS Score Slider & Severidade */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300">CVSS v3.1 Base Score:</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-rose-400">{score.toFixed(1)}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    severidade === 'CRITICA'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : severidade === 'ALTA'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : severidade === 'MEDIA'
                      ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                  }`}
                >
                  {severidade}
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0.0"
              max="10.0"
              step="0.1"
              value={score}
              onChange={(e) => handleScoreChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>0.0 (Nenhum)</span>
              <span>4.0 (Médio)</span>
              <span>7.0 (Alto)</span>
              <span>10.0 (Crítico)</span>
            </div>
          </div>

          {/* Footer Actions */}
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
              Registrar Vulnerabilidade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
