import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Terminal, Eye, AlertTriangle, ShieldCheck, ArrowUpDown, Trash2 } from 'lucide-react';
import { Asset } from '../types';

interface AssetInventoryTableProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onConnectAsset: (asset: Asset) => void;
  onDeleteAsset: (asset: Asset) => void;
  onOpenAddModal: () => void;
}

export const AssetInventoryTable: React.FC<AssetInventoryTableProps> = ({
  assets,
  onSelectAsset,
  onEditAsset,
  onConnectAsset,
  onDeleteAsset,
  onOpenAddModal,
}) => {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortAsc, setSortAsc] = useState(false);

  const departments = Array.from(new Set(assets.map((a) => a.departamento)));

  const filteredAssets = assets
    .filter((asset) => {
      const matchSearch =
        asset.nome.toLowerCase().includes(search.toLowerCase()) ||
        asset.departamento.toLowerCase().includes(search.toLowerCase()) ||
        asset.ip.includes(search);
      const matchDept = departmentFilter === 'ALL' || asset.departamento === departmentFilter;
      const matchRisk =
        riskFilter === 'ALL' ||
        (riskFilter === 'CRITICAL' && asset.riscoFinal >= 9.0) ||
        (riskFilter === 'HIGH' && asset.riscoFinal >= 7.0 && asset.riscoFinal < 9.0) ||
        (riskFilter === 'MEDIUM' && asset.riscoFinal >= 4.0 && asset.riscoFinal < 7.0) ||
        (riskFilter === 'LOW' && asset.riscoFinal < 4.0);
      return matchSearch && matchDept && matchRisk;
    })
    .sort((a, b) => (sortAsc ? a.riscoFinal - b.riscoFinal : b.riscoFinal - a.riscoFinal));

  const getRiskBadge = (score: number) => {
    if (score >= 9.0) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${score * 10}%` }}></div>
          </div>
          <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded tabular-nums">
            {score.toFixed(1)} Crítico
          </span>
        </div>
      );
    }
    if (score >= 7.0) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${score * 10}%` }}></div>
          </div>
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded tabular-nums">
            {score.toFixed(1)} Alto
          </span>
        </div>
      );
    }
    if (score >= 4.0) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${score * 10}%` }}></div>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded tabular-nums">
            {score.toFixed(1)} Médio
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${score * 10}%` }}></div>
        </div>
        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded tabular-nums">
          {score.toFixed(1)} Baixo
        </span>
      </div>
    );
  };

  return (
    <div className="bg-[#070b13] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-5 border-b border-slate-800/80 bg-[#090e1a]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
              Tabela de Inventário de Ativos de TI & Vulnerabilidades
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Monitoramento contínuo de superfícies de ataque e propagação de risco
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer self-start lg:self-auto"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Ativo
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, departamento ou endereço IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#05080f] border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#05080f] border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">Todos os Departamentos</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#05080f] border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">Todos os Riscos</option>
              <option value="CRITICAL">Crítico (9.0+)</option>
              <option value="HIGH">Alto (7.0 - 8.9)</option>
              <option value="MEDIUM">Médio (4.0 - 6.9)</option>
              <option value="LOW">Baixo (&lt; 4.0)</option>
            </select>

            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#05080f] hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortAsc ? 'Menor Risco' : 'Maior Risco'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#080d17] text-xs font-mono text-slate-400">
              <th className="py-3.5 px-5">Nome</th>
              <th className="py-3.5 px-5">Departamento</th>
              <th className="py-3.5 px-5">Risco Final</th>
              <th className="py-3.5 px-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-xs">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 font-mono">
                  Nenhum ativo encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-[#0a1120] transition-colors group cursor-pointer"
                  onClick={() => onSelectAsset(asset)}
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0e1628] border border-slate-700 flex items-center justify-center font-mono font-bold text-cyan-400">
                        {asset.tipo === 'Database' ? 'DB' : asset.tipo === 'Firewall' ? 'FW' : asset.tipo === 'Gateway' ? 'GW' : 'SRV'}
                      </div>
                      <div>
                        <div className="font-mono font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                          {asset.nome}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                          <span>{asset.ip}</span>
                          <span>·</span>
                          <span>{asset.cves.length} CVEs</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-5">
                    <span className="text-slate-300 font-medium">{asset.departamento}</span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{asset.tipo}</div>
                  </td>

                  <td className="py-3.5 px-5">
                    {getRiskBadge(asset.riscoFinal)}
                  </td>

                  <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectAsset(asset)}
                        title="Ver Detalhes do Equipamento"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer text-xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ver Detalhes</span>
                      </button>

                      <button
                        onClick={() => onEditAsset(asset)}
                        title="Editar Informações do Ativo"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-rose-400" />
                      </button>

                      <button
                        onClick={() => onConnectAsset(asset)}
                        title="Conectar Terminal SSH / Diagnóstico"
                        className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800 transition-colors cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteAsset(asset)}
                        title="Apagar Ativo do Inventário"
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 border border-rose-800/80 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 bg-[#080d17] border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>Total de Registros: <strong className="text-slate-200 tabular-nums">{filteredAssets.length}</strong> de {assets.length}</span>
        <span className="text-slate-500">Conexão REST: Ativa</span>
      </div>
    </div>
  );
};
