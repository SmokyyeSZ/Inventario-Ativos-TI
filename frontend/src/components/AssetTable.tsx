import React, { useState } from 'react';
import { Equipamento, TipoAtivo } from '../types/inventory';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Share2, 
  Edit2, 
  Trash2, 
  Server, 
  Database, 
  Laptop, 
  Router,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  Eye
} from 'lucide-react';

interface AssetTableProps {
  ativos: Equipamento[];
  onSelectAtivo: (ativo: Equipamento) => void;
  onOpenNewModal: () => void;
  onOpenEditModal: (ativo: Equipamento) => void;
  onOpenCveModal: (ativo: Equipamento) => void;
  onOpenConnectModal: (ativo: Equipamento) => void;
  onDeleteAtivo: (id: string) => void;
  onAnalisarRiscos?: () => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  ativos,
  onSelectAtivo,
  onOpenNewModal,
  onOpenEditModal,
  onOpenCveModal,
  onOpenConnectModal,
  onDeleteAtivo,
  onAnalisarRiscos,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [ordenarPor, setOrdenarPor] = useState<'risco_final' | 'nome' | 'cvss'>('risco_final');
  const [ordemAsc, setOrdemAsc] = useState(false);

  const getIconForTipo = (tipo: TipoAtivo) => {
    switch (tipo) {
      case 'SERVIDOR': return Server;
      case 'BANCO_DE_DADOS': return Database;
      case 'NOTEBOOK': return Laptop;
      case 'ROTEADORES': return Router;
      default: return Server;
    }
  };

  // Filtragem
  const filtrados = ativos.filter((a) => {
    const matchBusca = 
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.id_ativo.includes(busca) ||
      a.departamento.toLowerCase().includes(busca.toLowerCase()) ||
      a.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
      a.vulnerabilidades.some(v => v.cve_code?.toLowerCase().includes(busca.toLowerCase()));

    const matchTipo = filtroTipo === 'TODOS' || a.tipo === filtroTipo;

    return matchBusca && matchTipo;
  });

  // Ordenação
  const ordenados = [...filtrados].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    if (ordenarPor === 'risco_final') {
      valA = a.risco_final;
      valB = b.risco_final;
    } else if (ordenarPor === 'cvss') {
      valA = Math.max(0, ...a.vulnerabilidades.map(v => v.score));
      valB = Math.max(0, ...b.vulnerabilidades.map(v => v.score));
    } else {
      return ordemAsc ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome);
    }
    return ordemAsc ? valA - valB : valB - valA;
  });

  const toggleOrdenacao = (criterio: 'risco_final' | 'nome' | 'cvss') => {
    if (ordenarPor === criterio) {
      setOrdemAsc(!ordemAsc);
    } else {
      setOrdenarPor(criterio);
      setOrdemAsc(false);
    }
  };

  return (
    <div className="bg-[#0f172a]/95 backdrop-blur border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Table Toolbar Header matching listar.html */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
            IT Asset Inventory &amp; Vulnerability Table
          </h3>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
            {filtrados.length} / {ativos.length} Ativos
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Campo de Busca */}
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar nome, CVE, IP..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-500 pl-8 pr-3 py-1.5 rounded-md border border-slate-700/80 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            {['TODOS', 'SERVIDOR', 'BANCO_DE_DADOS', 'ROTEADORES', 'NOTEBOOK'].map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                  filtroTipo === t
                    ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'TODOS' ? 'Todos' : t === 'BANCO_DE_DADOS' ? 'DB' : t === 'ROTEADORES' ? 'Rot' : t === 'SERVIDOR' ? 'Serv' : 'Note'}
              </button>
            ))}
          </div>

          {/* Botão Analisar os Riscos (matching listar.html) */}
          {onAnalisarRiscos && (
            <button
              onClick={onAnalisarRiscos}
              className="px-3 py-1.5 text-xs font-mono font-bold text-cyan-200 bg-cyan-950/90 hover:bg-cyan-900/90 border border-cyan-700 rounded-md transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-950/50"
              title="Executar MotorMatematico.calcular_risco_rede()"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span>Analisar Riscos</span>
            </button>
          )}

          {/* Novo Ativo CTA (matching criar_equipamento) */}
          <button
            onClick={onOpenNewModal}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-900/30 font-mono"
            title="Criar novo equipamento"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Equipamento</span>
          </button>
        </div>
      </div>

      {/* Tabela Responsiva */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-[11px] font-mono text-slate-400 border-b border-slate-800 uppercase tracking-wider">
              <th className="py-3 px-4">
                <button
                  onClick={() => toggleOrdenacao('nome')}
                  className="flex items-center gap-1 hover:text-slate-200"
                >
                  <span>Ativo / Hostname</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3">IP / Subnet</th>
              <th className="py-3 px-3">Tipo / Setor</th>
              <th className="py-3 px-3">Criticidade</th>
              <th className="py-3 px-3">Vulnerabilidades (CVE)</th>
              <th className="py-3 px-3">
                <button
                  onClick={() => toggleOrdenacao('cvss')}
                  className="flex items-center gap-1 hover:text-slate-200"
                >
                  <span>CVSS Max</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">Risco Próprio (b)</th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => toggleOrdenacao('risco_final')}
                  className="flex items-center gap-1 justify-end w-full hover:text-slate-200"
                >
                  <span>Risco Final (x)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-xs font-mono">
            {ordenados.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  Nenhum ativo encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              ordenados.map((ativo) => {
                const Icon = getIconForTipo(ativo.tipo);
                const maxCvss = ativo.vulnerabilidades.length > 0
                  ? Math.max(...ativo.vulnerabilidades.map(v => v.score))
                  : 0;

                const isCritico = ativo.risco_final >= 15;
                const isAlto = ativo.risco_final >= 10 && ativo.risco_final < 15;
                const isMedio = ativo.risco_final >= 5 && ativo.risco_final < 10;

                return (
                  <tr
                    key={ativo.id_ativo}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Ativo / Hostname */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-slate-900 border border-slate-700/80 flex items-center justify-center text-cyan-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <button
                            onClick={() => onSelectAtivo(ativo)}
                            className="font-bold text-slate-100 hover:text-cyan-400 transition-colors text-left"
                          >
                            {ativo.nome}
                          </button>
                          <div className="text-[10px] text-slate-400">
                            ID: #{ativo.id_ativo} · Resp: {ativo.responsavel}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* IP */}
                    <td className="py-3 px-3 text-slate-300">
                      {ativo.ip || `10.100.${ativo.id_ativo}.1`}
                    </td>

                    {/* Tipo / Setor */}
                    <td className="py-3 px-3">
                      <span className="text-slate-200">{ativo.tipo}</span>
                      <div className="text-[10px] text-slate-400">{ativo.departamento}</div>
                    </td>

                    {/* Criticality indicator block (E-grade bar from Image 2) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-0.5" title={`Risco Final: ${ativo.risco_final}`}>
                        <span className="w-2.5 h-4 rounded-sm bg-cyan-500" />
                        <span className={`w-2.5 h-4 rounded-sm ${ativo.risco_final >= 5 ? 'bg-yellow-500' : 'bg-slate-800'}`} />
                        <span className={`w-2.5 h-4 rounded-sm ${ativo.risco_final >= 10 ? 'bg-amber-500' : 'bg-slate-800'}`} />
                        <span className={`w-2.5 h-4 rounded-sm ${ativo.risco_final >= 15 ? 'bg-rose-500' : 'bg-slate-800'}`} />
                      </div>
                    </td>

                    {/* Vulnerabilidades (Tags CVE) */}
                    <td className="py-3 px-3 max-w-[220px]">
                      {ativo.vulnerabilidades.length === 0 ? (
                        <span className="text-slate-400 text-[11px]">Nenhuma cadastrada</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {ativo.vulnerabilidades.map((v, i) => (
                            <span
                              key={i}
                              className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                v.severidade === 'CRITICA'
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                  : v.severidade === 'ALTA'
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                  : 'bg-yellow-950/80 text-yellow-300 border-yellow-800'
                              }`}
                              title={v.descricao}
                            >
                              {v.cve_code || `VULN-${i+1}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* CVSS Score */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          maxCvss >= 9.0
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : maxCvss >= 7.0
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : maxCvss >= 4.0
                            ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {maxCvss > 0 ? maxCvss.toFixed(1) : '—'}
                      </span>
                    </td>

                    {/* Risco Próprio b */}
                    <td className="py-3 px-3 text-right text-slate-300">
                      {ativo.risco_proprio.toFixed(2)}
                    </td>

                    {/* Risco Final x (Propagation Weight) */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-bold text-sm ${
                            isCritico
                              ? 'text-rose-400'
                              : isAlto
                              ? 'text-amber-400'
                              : isMedio
                              ? 'text-yellow-400'
                              : 'text-cyan-400'
                          }`}
                        >
                          {ativo.risco_final.toFixed(2)}
                        </span>
                        {/* Mini progress bar */}
                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                          <div
                            className={`h-full ${
                              isCritico ? 'bg-rose-500' : isAlto ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(100, (ativo.risco_final / 25) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Ações matching listar.html */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectAtivo(ativo)}
                          className="px-2 py-1 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 rounded transition-colors flex items-center gap-1"
                          title="Ver detalhes do equipamento (detalhes_equipamentos)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Detalhes</span>
                        </button>
                        <button
                          onClick={() => onOpenCveModal(ativo)}
                          className="p-1.5 text-cyan-400 hover:bg-cyan-950/60 rounded border border-transparent hover:border-cyan-800 transition-colors"
                          title="Vincular CVE da NVD NIST (vincular_cve)"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenConnectModal(ativo)}
                          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
                          title="Conectar com outro nó (conexao_risco)"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(ativo)}
                          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
                          title="Editar Equipamento (editar_equipamento)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteAtivo(ativo.id_ativo)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                          title="Excluir Equipamento (apagar_equipamento)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
