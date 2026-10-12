/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Equipamento, Vulnerabilidade } from './types/inventory';
import { getInitialCalculatedData } from './data/initialData';
import { calcularRiscoRede, NetworkRiskCalculationResult } from './services/mathEngine';
import { JesterLogo } from './components/JesterLogo';
import { CvssGauge } from './components/CvssGauge';
import { TopologyGraph } from './components/TopologyGraph';
import { RiskMatrixHeatmap } from './components/RiskMatrixHeatmap';
import { HighestRiskAssets } from './components/HighestRiskAssets';
import { AssetTable } from './components/AssetTable';
import { NmapSimulator } from './components/NmapSimulator';
import { AssetModal } from './components/modals/AssetModal';
import { CveModal } from './components/modals/CveModal';
import { ConnectionModal } from './components/modals/ConnectionModal';
import { AssetDetailsModal } from './components/modals/AssetDetailsModal';

import { 
  ShieldAlert, 
  RotateCcw, 
  Plus, 
  LayoutDashboard, 
  Table, 
  Cpu, 
  Terminal, 
  Layers, 
  Activity,
  Flame,
  Cloud,
  CheckCircle2,
  Share2
} from 'lucide-react';

export default function App() {
  // Estado principal dos equipamentos
  const [ativos, setAtivos] = useState<Equipamento[]>(() => {
    const salvo = localStorage.getItem('jester_inventario_ativos');
    if (salvo) {
      try {
        return JSON.parse(salvo);
      } catch {
        return getInitialCalculatedData();
      }
    }
    return getInitialCalculatedData();
  });

  // Parâmetro alpha de velocidade de propagação (como visto no screenshot 2)
  const [alpha, setAlpha] = useState<number>(0.5);

  // Resultado do motor matemático
  const [mathResult, setMathResult] = useState<NetworkRiskCalculationResult>(() => {
    return calcularRiscoRede(ativos, alpha);
  });

  // Aba ativa: 'dashboard' | 'inventario' | 'motor' | 'nmap'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventario' | 'motor' | 'nmap'>('dashboard');

  // Estado de modais
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState<Equipamento | null>(null);

  const [isCveModalOpen, setIsCveModalOpen] = useState(false);
  const [selectedAtivoForCve, setSelectedAtivoForCve] = useState<Equipamento | null>(null);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedAtivoForConnect, setSelectedAtivoForConnect] = useState<Equipamento | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAtivoForDetails, setSelectedAtivoForDetails] = useState<Equipamento | null>(null);

  const [notificacao, setNotificacao] = useState<string | null>(null);

  // Recalcular riscos sempre que os ativos ou o alpha mudarem
  const triggerRecalculate = (currentAtivos: Equipamento[], currentAlpha: number) => {
    const result = calcularRiscoRede(currentAtivos, currentAlpha);
    setMathResult(result);
    setAtivos(result.ativosAtualizados);
    localStorage.setItem('jester_inventario_ativos', JSON.stringify(result.ativosAtualizados));
  };

  const showNotification = (msg: string) => {
    setNotificacao(msg);
    setTimeout(() => setNotificacao(null), 3500);
  };

  // Efeito inicial para garantir sincronismo
  useEffect(() => {
    const result = calcularRiscoRede(ativos, alpha);
    setMathResult(result);
  }, []);

  // Handlers de Ativos
  const handleSaveAtivo = (novoOuEditado: Equipamento) => {
    let novosAtivos: Equipamento[];
    const index = ativos.findIndex(a => a.id_ativo === novoOuEditado.id_ativo);
    if (index >= 0) {
      novosAtivos = [...ativos];
      novosAtivos[index] = novoOuEditado;
      showNotification(`Ativo #${novoOuEditado.id_ativo} (${novoOuEditado.nome}) atualizado!`);
    } else {
      novosAtivos = [...ativos, novoOuEditado];
      showNotification(`Ativo #${novoOuEditado.id_ativo} cadastrado com sucesso!`);
    }
    triggerRecalculate(novosAtivos, alpha);
  };

  const handleDeleteAtivo = (id: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o ativo #${id} e todas as suas rotas?`)) {
      return;
    }
    const filtrados = ativos
      .filter(a => a.id_ativo !== id)
      .map(a => ({
        ...a,
        conexoes: (a.conexoes || []).filter(cId => cId !== id),
      }));
    triggerRecalculate(filtrados, alpha);
    showNotification(`Ativo #${id} excluído do inventário.`);
  };

  // Handlers de Vulnerabilidade
  const handleAddVulnerabilidade = (ativoId: string, vuln: Vulnerabilidade) => {
    const atualizados = ativos.map(a => {
      if (a.id_ativo === ativoId) {
        return {
          ...a,
          vulnerabilidades: [...a.vulnerabilidades, vuln],
        };
      }
      return a;
    });
    triggerRecalculate(atualizados, alpha);
    showNotification(`Vulnerabilidade ${vuln.cve_code || 'CVE'} vinculada ao ativo #${ativoId}!`);
  };

  const handleRemoveVulnerabilidade = (ativoId: string, vulnId: string) => {
    const atualizados = ativos.map(a => {
      if (a.id_ativo === ativoId) {
        return {
          ...a,
          vulnerabilidades: a.vulnerabilidades.filter(v => v.id !== vulnId),
        };
      }
      return a;
    });
    triggerRecalculate(atualizados, alpha);
    showNotification('Vulnerabilidade removida.');
  };

  // Handlers de Conexão de Rede (Rotas de Risco)
  const handleAddConexao = (origemId: string, destinoId: string) => {
    const atualizados = ativos.map(a => {
      if (a.id_ativo === origemId) {
        const conexoesExistentes = a.conexoes || [];
        if (!conexoesExistentes.includes(destinoId)) {
          return {
            ...a,
            conexoes: [...conexoesExistentes, destinoId],
          };
        }
      }
      return a;
    });
    triggerRecalculate(atualizados, alpha);
    showNotification(`Rota criada: #${origemId} ➔ #${destinoId} (Matriz A atualizada)`);
  };

  const handleRemoveConexao = (origemId: string, destinoId: string) => {
    const atualizados = ativos.map(a => {
      if (a.id_ativo === origemId) {
        return {
          ...a,
          conexoes: (a.conexoes || []).filter(c => c !== destinoId),
        };
      }
      return a;
    });
    triggerRecalculate(atualizados, alpha);
    showNotification(`Rota #${origemId} ➔ #${destinoId} removida.`);
  };

  // Restaurar dados padrão do simulador.py
  const handleResetData = () => {
    if (window.confirm('Restaurar topologia inicial do simulador.py?')) {
      const iniciais = getInitialCalculatedData();
      localStorage.removeItem('jester_inventario_ativos');
      setAtivos(iniciais);
      triggerRecalculate(iniciais, 0.5);
      setAlpha(0.5);
      showNotification('Topologia e inventário restaurados com sucesso.');
    }
  };

  // Métricas agregadas para os KPI Cards do topo (como em Imagem 1 e 2)
  const totalAssets = ativos.length;
  const totalVulns = ativos.reduce((acc, a) => acc + a.vulnerabilidades.length, 0);
  const highRiskDevices = ativos.filter(a => a.risco_final >= 10).length;
  const cloudInstances = ativos.filter(a => a.tipo === 'SERVIDOR' || a.tipo === 'BANCO_DE_DADOS').length;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Toast de Notificação */}
      {notificacao && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 bg-slate-900/95 border border-cyan-500 text-cyan-200 text-xs font-mono rounded-lg shadow-2xl flex items-center gap-2 backdrop-blur animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{notificacao}</span>
        </div>
      )}

      {/* TOP BAR / HEADER (Matching 3-zone contract) */}
      <header className="sticky top-0 z-40 bg-[#090e1c]/95 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark with Jester Mask Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <JesterLogo size="md" glow={true} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white font-mono flex items-center gap-1.5">
                <span className="text-rose-500">JESTER</span>
                <span className="text-slate-400 font-light">//</span>
                <span className="text-cyan-400">RISK PROPAGATE</span>
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider hidden sm:block">
              REAL-TIME IT INVENTORY &amp; NETWORK SECURITY OVERVIEW
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dashboard &amp; Topologia</span>
            <span className="md:hidden">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('inventario')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'inventario'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Inventário de Ativos</span>
            <span className="md:hidden">Inventário</span>
          </button>

          <button
            onClick={() => setActiveTab('motor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'motor'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Motor Matemático (A)</span>
            <span className="md:hidden">Matriz</span>
          </button>

          <button
            onClick={() => setActiveTab('nmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'nmap'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Simulador Nmap</span>
            <span className="md:hidden">Nmap</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => triggerRecalculate(ativos, alpha)}
            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-md border border-slate-800 transition-colors"
            title="Recalcular propagação de riscos no motor matemático"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setEditingAtivo(null);
              setIsAssetModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-bold font-mono text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-900/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Ativo</span>
          </button>
        </div>
      </header>

      {/* SUB-HEADER / TOP KPI CARDS (Matching Image 1 & 2) */}
      <section className="px-4 sm:px-6 py-4 bg-[#0a0f1d] border-b border-slate-800/80">
        <div className="max-w-[1520px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Assets */}
          <div className="p-3.5 bg-[#0f172a]/80 border border-slate-800/80 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Total IT Assets
              </span>
              <span className="text-[10px] text-cyan-400">Ativos</span>
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
              {totalAssets.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Topologia Mapeada
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none p-2">
              <Layers className="w-12 h-12 text-cyan-400" />
            </div>
          </div>

          {/* Card 2: Active Vulnerabilities */}
          <div className="p-3.5 bg-[#0f172a]/80 border border-slate-800/80 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                Active Vulnerabilities
              </span>
              <span className="text-[10px] text-rose-400">CVEs</span>
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
              {totalVulns}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Unpatched &amp; Em Tratamento
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none p-2">
              <ShieldAlert className="w-12 h-12 text-rose-500" />
            </div>
          </div>

          {/* Card 3: High Risk Devices */}
          <div className="p-3.5 bg-[#0f172a]/80 border border-slate-800/80 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                High Risk Devices
              </span>
              <span className="text-[10px] text-amber-400">Críticos</span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
              {highRiskDevices}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Risco Propagado &ge; 10
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none p-2">
              <Flame className="w-12 h-12 text-amber-500" />
            </div>
          </div>

          {/* Card 4: Risk Propagation Score (λmax) */}
          <div className="p-3.5 bg-[#0f172a]/80 border border-slate-800/80 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Propagation Score (λmax)
              </span>
              <span className="text-[10px] text-emerald-400">Espectral</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {mathResult.lambdaMax.toFixed(2)}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Densidade Matriz: {mathResult.matrixDensity}
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none p-2">
              <Activity className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1520px] w-full mx-auto space-y-6">
        {/* VIEW 1: DASHBOARD (Exact composition of Image 1 & 2) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (3 cols): CVSS Speedometer & Breakdown */}
              <div className="lg:col-span-3 space-y-6">
                <CvssGauge ativos={ativos} />
                <div className="p-4 bg-[#0f172a]/90 backdrop-blur border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                  <div className="text-slate-300 font-bold flex items-center justify-between">
                    <span>Fatores de Exposição:</span>
                    <span className="text-cyan-400">POO</span>
                  </div>
                  <div className="space-y-1 text-slate-400 text-[11px]">
                    <div className="flex justify-between">
                      <span>Servidor</span>
                      <strong className="text-slate-200">1.5x</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Banco de Dados</span>
                      <strong className="text-slate-200">1.5x</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Notebook</span>
                      <strong className="text-slate-200">1.0x</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Roteadores</span>
                      <strong className="text-slate-200">1.0x</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column (6 cols): Topology Graph */}
              <div className="lg:col-span-6">
                <TopologyGraph
                  ativos={ativos}
                  onSelectAtivo={(a) => {
                    setSelectedAtivoForDetails(a);
                    setIsDetailsModalOpen(true);
                  }}
                  onOpenConnectModal={() => {
                    setSelectedAtivoForConnect(ativos[0] || null);
                    setIsConnectModalOpen(true);
                  }}
                />
              </div>

              {/* Right Column (3 cols): Highest Risk Assets & Flow */}
              <div className="lg:col-span-3">
                <HighestRiskAssets
                  ativos={ativos}
                  onSelectAtivo={(a) => {
                    setSelectedAtivoForDetails(a);
                    setIsDetailsModalOpen(true);
                  }}
                />
              </div>
            </div>

            {/* Bottom Row: IT Asset Inventory & Vulnerability Table */}
            <div>
              <AssetTable
                ativos={ativos}
                onSelectAtivo={(a) => {
                  setSelectedAtivoForDetails(a);
                  setIsDetailsModalOpen(true);
                }}
                onOpenNewModal={() => {
                  setEditingAtivo(null);
                  setIsAssetModalOpen(true);
                }}
                onOpenEditModal={(a) => {
                  setEditingAtivo(a);
                  setIsAssetModalOpen(true);
                }}
                onOpenCveModal={(a) => {
                  setSelectedAtivoForCve(a);
                  setIsCveModalOpen(true);
                }}
                onOpenConnectModal={(a) => {
                  setSelectedAtivoForConnect(a);
                  setIsConnectModalOpen(true);
                }}
                onDeleteAtivo={handleDeleteAtivo}
                onAnalisarRiscos={() => triggerRecalculate(ativos, alpha)}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: INVENTÁRIO COMPLETO */}
        {activeTab === 'inventario' && (
          <div className="space-y-6">
            <AssetTable
              ativos={ativos}
              onSelectAtivo={(a) => {
                setSelectedAtivoForDetails(a);
                setIsDetailsModalOpen(true);
              }}
              onOpenNewModal={() => {
                setEditingAtivo(null);
                setIsAssetModalOpen(true);
              }}
              onOpenEditModal={(a) => {
                setEditingAtivo(a);
                setIsAssetModalOpen(true);
              }}
              onOpenCveModal={(a) => {
                setSelectedAtivoForCve(a);
                setIsCveModalOpen(true);
              }}
              onOpenConnectModal={(a) => {
                setSelectedAtivoForConnect(a);
                setIsConnectModalOpen(true);
              }}
              onDeleteAtivo={handleDeleteAtivo}
              onAnalisarRiscos={() => triggerRecalculate(ativos, alpha)}
            />
          </div>
        )}

        {/* VIEW 3: MOTOR MATEMÁTICO & HEATMAP */}
        {activeTab === 'motor' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <RiskMatrixHeatmap
                  ativos={ativos}
                  mathResult={mathResult}
                  alpha={alpha}
                  onAlphaChange={(newAlpha) => {
                    setAlpha(newAlpha);
                    triggerRecalculate(ativos, newAlpha);
                  }}
                />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
                  <h4 className="text-sm font-bold text-cyan-400">
                    Propagação Linear em Grafo
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    O motor calcula o risco de cada ativo <span className="text-cyan-300">xᵢ</span> combinando seu risco intrínseco <span className="text-rose-400">bᵢ</span> (soma de CVSS × fator de exposição) com o risco herdado das máquinas conectadas através da matriz de adjacência <span className="text-amber-400">A</span>.
                  </p>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] space-y-1">
                    <div>• <strong>x</strong> = Vetor de Riscos Finais</div>
                    <div>• <strong>b</strong> = Vetor de Riscos Próprios</div>
                    <div>• <strong>A</strong> = Matriz de Conexões de Rede</div>
                    <div>• <strong>α</strong> = Velocidade/Atenuação ({alpha.toFixed(2)})</div>
                  </div>
                  <button
                    onClick={handleResetData}
                    className="w-full py-2 px-3 text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  >
                    Restaurar Rede Padrão (simulador.py)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SIMULADOR NMAP SCAN */}
        {activeTab === 'nmap' && (
          <div className="space-y-6">
            <NmapSimulator
              ativos={ativos}
              onRecalculateRisks={() => triggerRecalculate(ativos, alpha)}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto px-6 py-4 bg-[#070b12] border-t border-slate-800/80 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <JesterLogo size="sm" glow={false} />
          <span className="text-slate-300 font-bold">JESTER RISK PROPAGATE</span>
          <span>· Baseado no motor de propagação matricial POO &amp; NVD NIST</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Ativos: {ativos.length}</span>
          <span>·</span>
          <span>Vulnerabilidades: {totalVulns}</span>
          <span>·</span>
          <span>Status: Sistema Operacional</span>
        </div>
      </footer>

      {/* MODALS */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSave={handleSaveAtivo}
        initialAtivo={editingAtivo}
        existingIds={ativos.map(a => a.id_ativo)}
      />

      <CveModal
        isOpen={isCveModalOpen}
        onClose={() => setIsCveModalOpen(false)}
        ativo={selectedAtivoForCve}
        onAddVulnerabilidade={handleAddVulnerabilidade}
      />

      <ConnectionModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        ativoOrigem={selectedAtivoForConnect}
        todosAtivos={ativos}
        onAddConexao={handleAddConexao}
        onRemoveConexao={handleRemoveConexao}
      />

      <AssetDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        ativo={selectedAtivoForDetails}
        todosAtivos={ativos}
        onOpenEditModal={(a) => {
          setEditingAtivo(a);
          setIsAssetModalOpen(true);
        }}
        onOpenCveModal={(a) => {
          setSelectedAtivoForCve(a);
          setIsCveModalOpen(true);
        }}
        onOpenConnectModal={(a) => {
          setSelectedAtivoForConnect(a);
          setIsConnectModalOpen(true);
        }}
        onRemoveVuln={(ativoId, vulnId) => handleRemoveVulnerabilidade(ativoId, vulnId)}
        onDisconnect={(ativoId, conexaoId) => handleRemoveConexao(ativoId, conexaoId)}
      />
    </div>
  );
}
