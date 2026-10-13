import React, { useState, useEffect, useRef } from 'react';
import { X, Terminal as TerminalIcon, Radio, RefreshCw, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Asset } from '../types';
import { testConnectionPing } from '../services/api';

interface ConnectTerminalModalProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectTerminalModal: React.FC<ConnectTerminalModalProps> = ({ asset, isOpen, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [pingStats, setPingStats] = useState<{ latencyMs: number; openPorts: number[] }>({
    latencyMs: 8,
    openPorts: [22, 443, 5432],
  });
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLogs([
        `[SOC-NET] Iniciando handshake seguro para o nó ${asset.nome} (${asset.ip})...`,
        `[SOC-NET] Protocolo: TLS 1.3 / SSH-RSA 4096-bit hardlink...`,
        `[SOC-NET] Autenticado com sucesso via certificado de infraestrutura.`,
        `[SYS-INFO] Host: ${asset.nome} | OS: ${asset.sistemaOperacional}`,
        `[SECURITY] Nível de Risco Ativo: ${asset.riscoFinal} (${asset.criticidade.toUpperCase()})`,
        `[PROMPT] Digite um comando ou utilize os testes rápidos abaixo.`,
      ]);
      setIsConnected(true);
      testConnectionPing(asset.id).then((res) => {
        setPingStats({ latencyMs: res.latencyMs, openPorts: res.openPorts });
      });
    }
  }, [isOpen, asset]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen) return null;

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmd = command.trim();
    const newLogs = [...logs, `sec-operator@jester-console:~$ ${cmd}`];

    if (cmd.toLowerCase() === 'clear') {
      setLogs([]);
      setCommand('');
      return;
    } else if (cmd.toLowerCase() === 'help') {
      newLogs.push(
        'Comandos disponíveis:',
        '  ping              - Medir tempo de resposta ICMP',
        '  netstat           - Listar portas e conexões ativas',
        '  risk-eval         - Calcular propagação de risco local',
        '  isolate           - Enviar sinal de contenção de rede',
        '  clear             - Limpar console'
      );
    } else if (cmd.toLowerCase() === 'ping') {
      newLogs.push(
        `64 bytes de ${asset.ip}: icmp_seq=1 ttl=64 time=${pingStats.latencyMs}.2 ms`,
        `64 bytes de ${asset.ip}: icmp_seq=2 ttl=64 time=${pingStats.latencyMs - 1}.8 ms`,
        `--- estatísticas de ping para ${asset.ip} ---`,
        `2 pacotes transmitidos, 2 recebidos, 0% perda de pacotes`
      );
    } else if (cmd.toLowerCase() === 'netstat') {
      newLogs.push(
        'Conexões estabelecidas:',
        `  TCP ${asset.ip}:5432 -> ESTABLISHED`,
        `  TCP ${asset.ip}:22   -> LISTEN (SSH Remote)`,
        `  TCP ${asset.ip}:443  -> ESTABLISHED (Encrypted)`
      );
    } else if (cmd.toLowerCase() === 'risk-eval') {
      newLogs.push(
        `[CÁLCULO EIGENVECTOR] Matriz de Adjacência: A[${asset.nome}]`,
        `[SCORE LOCAL] Risco calculado: ${asset.riscoFinal} / 10.0`,
        `[PROPAGAÇÃO λmax] Fator de contaminação estimada: ${(asset.pesoPropagacao * 100).toFixed(0)}%`
      );
    } else if (cmd.toLowerCase() === 'isolate') {
      newLogs.push(
        `[FIREWALL ALERT] Sinal de contenção acionado para ${asset.ip}.`,
        `[FIREWALL ALERT] Regras de quarentena aplicadas com sucesso.`
      );
    } else {
      newLogs.push(`sh: comando desconhecido: "${cmd}". Digite 'help' para ajuda.`);
    }

    setLogs(newLogs);
    setCommand('');
  };

  const runQuickAction = (actionName: string) => {
    if (actionName === 'ping') {
      setLogs((prev) => [
        ...prev,
        `sec-operator@jester-console:~$ ping ${asset.ip}`,
        `PING ${asset.ip} 56(84) bytes de dados.`,
        `64 bytes de ${asset.ip}: icmp_seq=1 ttl=64 time=${pingStats.latencyMs}.4 ms`,
        `RTT médio: ${pingStats.latencyMs}ms | Conectividade 100% OK`,
      ]);
    } else if (actionName === 'ports') {
      setLogs((prev) => [
        ...prev,
        `sec-operator@jester-console:~$ nmap -sS -T4 ${asset.ip}`,
        `Varredura concluída em 0.42s`,
        `PORTA    ESTADO  SERVIÇO`,
        `22/tcp   aberta  ssh (OpenSSH 8.9p1)`,
        `443/tcp  aberta  https (TLS 1.3)`,
        `5432/tcp aberta  postgresql (15.4)`,
      ]);
    } else if (actionName === 'cve-audit') {
      setLogs((prev) => [
        ...prev,
        `sec-operator@jester-console:~$ jester-audit --target ${asset.nome}`,
        `[AUDIT] Total de CVEs mapeadas: ${asset.cves.length}`,
        ...asset.cves.map((c) => `  * ${c.id} (CVSS ${c.cvss}) - ${c.status}`),
        `[AUDIT] Status de propagação: Crítico`,
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-[#070b13] border border-cyan-500/40 rounded-xl shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-[#0a1120]">
          <div className="flex items-center gap-3">
            <TerminalIcon className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">{asset.nome}</span>
                <span className="text-xs font-mono text-cyan-400">({asset.ip})</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Conectado
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-6 py-2.5 bg-[#05080f] border-b border-slate-800/80 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span>Latência: <strong className="text-cyan-300 tabular-nums">{pingStats.latencyMs} ms</strong></span>
            <span>Portas Abertas: <strong className="text-slate-200">22, 443, 5432</strong></span>
            <span>Terminal: <strong className="text-slate-200">SSH TTY-0</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => runQuickAction('ping')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors text-xs"
            >
              Testar Ping
            </button>
            <button
              onClick={() => runQuickAction('ports')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-xs"
            >
              Escanear Portas
            </button>
            <button
              onClick={() => runQuickAction('cve-audit')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 transition-colors text-xs"
            >
              Auditar CVEs
            </button>
          </div>
        </div>

        <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-slate-200 space-y-1.5 bg-[#05080f] min-h-[300px]">
          {logs.map((log, index) => {
            const isCommand = log.startsWith('sec-operator');
            const isAlert = log.includes('[SECURITY]') || log.includes('[FIREWALL') || log.includes('Crítico');
            const isSuccess = log.includes('sucesso') || log.includes('Conectado');
            return (
              <div
                key={index}
                className={`${
                  isCommand
                    ? 'text-cyan-400 font-semibold'
                    : isAlert
                    ? 'text-rose-400'
                    : isSuccess
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                {log}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>

        <form onSubmit={handleSendCommand} className="p-3 bg-[#0a1120] border-t border-slate-800 flex items-center gap-2">
          <span className="font-mono text-xs text-cyan-400 pl-2">sec-operator@jester:~$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Digite comando (ex: help, ping, netstat, risk-eval, clear)..."
            className="flex-1 bg-transparent border-0 text-slate-100 text-xs font-mono focus:outline-none placeholder-slate-600"
          />
          <button
            type="submit"
            className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
