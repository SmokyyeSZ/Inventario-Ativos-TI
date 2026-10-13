import React, { useState } from 'react';
import { X, Network, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSaveUrl: (newUrl: string) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose, currentUrl, onSaveUrl }) => {
  const [url, setUrl] = useState(currentUrl);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Verificando conexão com o endpoint Django...');
    try {
      const target = url.endsWith('/') ? url : `${url}/`;
      await axios.get(`${target}metrics/`, { timeout: 3000 });
      setStatus('success');
      setMessage('Conexão estabelecida com sucesso com o backend Python/Django!');
    } catch {
      setStatus('failed');
      setMessage('Não foi possível conectar a este endpoint no momento. O frontend continuará operando normalmente em modo de interface.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(url.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0b101b] border border-blue-500/30 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.2)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1424]">
          <div className="flex items-center gap-3">
            <Network className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white tracking-wide">Configuração do Backend REST (Django)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              URL Base da API REST Python/Django
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8000/api"
              className="w-full px-3 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-3.5 bg-[#060911] rounded-lg border border-slate-800 text-xs font-mono space-y-1.5 text-slate-400">
            <p className="text-slate-300 font-semibold">Rotas REST consumidas pelo frontend:</p>
            <p>• <span className="text-cyan-400">GET</span> /metrics/ - Métricas e matrizes de risco</p>
            <p>• <span className="text-cyan-400">GET/POST</span> /assets/ - Lista e criação de ativos</p>
            <p>• <span className="text-amber-400">POST/DEL</span> /assets/:id/cves/ - Vínculo de CVEs</p>
            <p>• <span className="text-rose-400">POST</span> /assets/:id/ping/ - Teste de conexão</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={testConnection}
              disabled={status === 'testing'}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === 'testing' ? 'animate-spin' : ''}`} />
              Testar Conexão REST
            </button>
            {status === 'success' && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <CheckCircle className="w-3.5 h-3.5" /> Online
              </span>
            )}
            {status === 'failed' && (
              <span className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                <AlertCircle className="w-3.5 h-3.5" /> Standby local
              </span>
            )}
          </div>

          {message && (
            <p className="text-xs text-slate-400">{message}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all cursor-pointer"
            >
              Salvar Configuração
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
