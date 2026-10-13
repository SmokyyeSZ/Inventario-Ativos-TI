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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkCveModalOpen, setIsLinkCveModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isApiConfigModalOpen, setIsApiConfigModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [fetchedMetrics, fetchedAssets] = await Promise.all([
        fetchDashboardMetrics(),
        fetchAssets(),
      ]);
      setMetrics(fetchedMetrics);
      setAssets(fetchedAssets);
      if (fetchedAssets.length > 0) {
        setSelectedAsset(fetchedAssets[0]);
      }
    } catch {
      setMetrics(initialMetrics);
      setAssets(initialAssets);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setActiveTab('details');
  };

  const handleSaveAsset = async (updatedFields: Partial<Asset>) => {
    const updated = await updateAssetOnServer(selectedAsset.id, updatedFields);
    setAssets((prev) => prev.map((a) => (a.id === selectedAsset.id ? { ...a, ...updated } : a)));
    setSelectedAsset((prev) => ({ ...prev, ...updated }));
  };

  const handleLinkCve = async (cve: CveItem) => {
    const updated = await linkCveToAssetOnServer(selectedAsset.id, cve);
    setAssets((prev) => prev.map((a) => (a.id === selectedAsset.id ? updated : a)));
    setSelectedAsset(updated);
  };

  const handleUnlinkCve = async (cveId: string) => {
    await unlinkCveOnServer(selectedAsset.id, cveId);
    const updatedCves = selectedAsset.cves.filter((c) => c.id !== cveId);
    const updatedAsset = { ...selectedAsset, cves: updatedCves };
    setAssets((prev) => prev.map((a) => (a.id === selectedAsset.id ? updatedAsset : a)));
    setSelectedAsset(updatedAsset);
  };

  const handleAddConnection = async (conn: NetworkConnection) => {
    const updated = await addConnectionOnServer(selectedAsset.id, conn);
    setAssets((prev) => prev.map((a) => (a.id === selectedAsset.id ? updated : a)));
    setSelectedAsset(updated);
  };

  const handleDeleteConnection = async (connId: string) => {
    await deleteConnectionOnServer(selectedAsset.id, connId);
    const updatedConns = selectedAsset.conexoes.filter((c) => c.id !== connId);
    const updatedAsset = { ...selectedAsset, conexoes: updatedConns };
    setAssets((prev) => prev.map((a) => (a.id === selectedAsset.id ? updatedAsset : a)));
    setSelectedAsset(updatedAsset);
  };

  const handleAddAsset = (newAsset: Asset) => {
    setAssets((prev) => [newAsset, ...prev]);
    setSelectedAsset(newAsset);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenApiConfig={() => setIsApiConfigModalOpen(true)}
        onRefreshData={loadData}
        isRefreshing={isRefreshing}
        selectedAssetNome={selectedAsset?.nome}
      />

      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 lg:p-8">
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
        onSaveUrl={(newUrl) => setApiUrl(newUrl)}
      />
    </div>
  );
};

export default App;
