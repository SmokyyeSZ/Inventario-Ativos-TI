import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Asset,
  CveItem,
  NetworkConnection,
  RiskPropagationMetrics
} from './types';
import {
  initialAssets,
  initialMetrics,
  fetchDashboardMetrics,
  fetchAssets,
  updateAssetOnServer,
  deleteAssetOnServer,
  linkCveToAssetOnServer,
  unlinkCveOnServer,
  addConnectionOnServer,
  deleteConnectionOnServer
} from './services/api';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AssetInventoryTable } from './components/AssetInventoryTable';
import { EquipmentDetails } from './components/EquipmentDetails';
import { EditAssetModal } from './components/EditAssetModal';
import { LinkCveModal } from './components/LinkCveModal';
import { ConnectTerminalModal } from './components/ConnectTerminalModal';
import { AddAssetModal } from './components/AddAssetModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import { createAssetOnServer } from './services/api';
import { updateApiBaseUrl } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [metrics, setMetrics] = useState<RiskPropagationMetrics>(initialMetrics);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(initialAssets[0]);
  const [propagationSpeed, setPropagationSpeed] = useState<number>(initialMetrics.propagationSpeed);
  const [apiUrl, setApiUrl] = useState<string>(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkCveModalOpen, setIsLinkCveModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isApiConfigModalOpen, setIsApiConfigModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (keepSelectedId?: string) => {
    setIsRefreshing(true);
    setErrorMessage('');
    try {
      const [fetchedMetrics, fetchedAssets] = await Promise.all([
        fetchDashboardMetrics(),
        fetchAssets(),
      ]);
      setMetrics(fetchedMetrics);
      setAssets(fetchedAssets);
      if (fetchedAssets.length > 0) {
        const targetId = keepSelectedId ?? selectedAsset?.id;
        const found = fetchedAssets.find((a) => String(a.id) === String(targetId));
        setSelectedAsset(found || fetchedAssets[0]);
      } else {
        setSelectedAsset(null as unknown as Asset);
      }
    } catch {
      setErrorMessage('Falha ao conectar com o servidor Django. Verifique se a API está online.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setActiveTab('details');
  };

  const handleSaveAsset = async (updatedFields: Partial<Asset>) => {
    await updateAssetOnServer(selectedAsset.id, updatedFields);
    await loadData(selectedAsset.id);
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (!window.confirm(`Tem certeza que deseja apagar o ativo "${asset.nome}"?`)) return;
    await deleteAssetOnServer(asset.id);
    await loadData();
  };

  const handleLinkCve = async (cve: CveItem) => {
    await linkCveToAssetOnServer(selectedAsset.id, cve);
    await loadData(selectedAsset.id);
  };

  const handleUnlinkCve = async (cveId: string) => {
    await unlinkCveOnServer(selectedAsset.id, cveId);
    await loadData(selectedAsset.id);
  };

  const handleAddConnection = async (conn: NetworkConnection) => {
    await addConnectionOnServer(selectedAsset.id, conn);
    await loadData(selectedAsset.id);
  };

  const handleDeleteConnection = async (connId: string) => {
    await deleteConnectionOnServer(selectedAsset.id, connId);
    await loadData(selectedAsset.id);
  };

  const handleAddAsset = async (newAsset: Asset) => {
    const created = await createAssetOnServer(newAsset);
    await loadData(created.id);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenApiConfig={() => setIsApiConfigModalOpen(true)}
        onRefreshData={() => loadData()}
        isRefreshing={isRefreshing}
        selectedAssetNome={selectedAsset?.nome}
      />


    <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 lg:p-8">
      {errorMessage ? (
        
        <div className="flex flex-col items-center justify-center p-12 border border-rose-500/40 bg-[#0b101b] rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.15)] text-center min-h-[50vh]">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-4 border border-rose-500/50">
            <span className="text-rose-500 text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-white mb-2">Conexão com o Servidor Perdida</h2>
          <p className="text-sm font-mono text-rose-400 mb-6">{errorMessage}</p>
          <button 
            onClick={() => loadData()}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold font-mono text-xs rounded-lg transition-colors cursor-pointer"
          >
            Tentar Reconectar
          </button>
        </div>

      ) : (
        
        <>
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              assets={assets}
              onSelectAsset={handleSelectAsset}
              selectedAssetId={selectedAsset?.id}
              propagationSpeed={propagationSpeed}
              onPropagationSpeedChange={setPropagationSpeed}
              onGoToInventory={() => setActiveTab('inventory')}
            />
          )}

          {activeTab === 'inventory' && (
            <AssetInventoryTable
              assets={assets}
              onSelectAsset={handleSelectAsset}
              onEditAsset={(asset) => {
                setSelectedAsset(asset);
                setIsEditModalOpen(true);
              }}
              onConnectAsset={(asset) => {
                setSelectedAsset(asset);
                setIsConnectModalOpen(true);
              }}
              onDeleteAsset={handleDeleteAsset}
              onOpenAddModal={() => setIsAddAssetModalOpen(true)}
            />
          )}

          {activeTab === 'details' && selectedAsset && (
            <EquipmentDetails
              asset={selectedAsset}
              allAssets={assets}
              onSelectAnotherAsset={setSelectedAsset}
              onOpenEdit={() => setIsEditModalOpen(true)}
              onOpenLinkCve={() => setIsLinkCveModalOpen(true)}
              onOpenConnect={() => setIsConnectModalOpen(true)}
              onUnlinkCve={handleUnlinkCve}
              onAddConnection={handleAddConnection}
              onDeleteConnection={handleDeleteConnection}
            />
          )}
        </>
      )}
      </main>

      <footer className="border-t border-slate-900 bg-[#05080e] px-4 lg:px-8 py-4 text-xs font-mono text-slate-500">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-semibold">JESTER SECURITY INTELLIGENCE</span>
            <span>·</span>
            <span>REST API Endpoint: {apiUrl}</span>
          </div>
          <div>
            <span>Modelo Espectral: Matriz Adjacente de Markov & Autovalor Máximo (λmax)</span>
          </div>
        </div>
      </footer>

      {selectedAsset && (
        <>
        {isEditModalOpen && (
          <EditAssetModal
            asset={selectedAsset}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveAsset}
          />
        )}

          <LinkCveModal
            assetName={selectedAsset.nome}
            isOpen={isLinkCveModalOpen}
            onClose={() => setIsLinkCveModalOpen(false)}
            onLink={handleLinkCve}
          />

          <ConnectTerminalModal
            asset={selectedAsset}
            isOpen={isConnectModalOpen}
            onClose={() => setIsConnectModalOpen(false)}
          />
        </>
      )}

      <AddAssetModal
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
        onAdd={handleAddAsset}
      />

      <ApiConfigModal
        isOpen={isApiConfigModalOpen}
        onClose={() => setIsApiConfigModalOpen(false)}
        currentUrl={apiUrl}
        onSaveUrl={(newUrl) => {
          updateApiBaseUrl(newUrl)
          setApiUrl(newUrl)
        }
        }
      />
    </div>
  );
};

export default App;
