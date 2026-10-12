import React, { useState } from 'react';
import { Equipamento } from '../types/inventory';
import { Terminal, Play, CheckCircle2, RefreshCw } from 'lucide-react';

interface NmapSimulatorProps {
  ativos: Equipamento[];
  onRecalculateRisks: () => void;
}

export const NmapSimulator: React.FC<NmapSimulatorProps> = ({
  ativos,
  onRecalculateRisks,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanFinished, setScanFinished] = useState(false);

  const startScan = async () => {
    setIsScanning(true);
    setScanFinished(false);
    setLogs([]);

    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);

    const initialLogs = [
      `Starting Nmap 7.01 ( https://nmap.org ) at ${formattedDate} UTC`,
      `Scanning target subnet 192.168.1.0/24 & 10.100.0.0/16...`,
      `Initiating ARP Ping Scan & SYN Stealth Scan across ${ativos.length} network hosts...`,
    ];
    setLogs(initialLogs);

    // Simular output progressivo
    let latency = 0.088;
    for (let i = 0; i < ativos.length; i++) {
      await new Promise((r) => setTimeout(r, 260));
      const ativo = ativos[i];
      latency += 0.003;
      const latStr = latency.toFixed(3);

      const hostLog = [
        `Nmap scan report for ${ativo.nome} (${ativo.ip || `10.100.${ativo.id_ativo}.1`})`,
        `Host is up (${latStr}s latency). Device Class: ${ativo.tipo}`,
      ];

      if (ativo.conexoes && ativo.conexoes.length > 0) {
        hostLog.push(`[+] Descoberta rota de conexão para IDs: [ ${ativo.conexoes.join(', ')} ]`);
      } else {
        hostLog.push(`[-] Nenhuma rota de propagação de saída detectada.`);
      }

      const vulnCount = ativo.vulnerabilidades.length;
      if (vulnCount > 0) {
        const cves = ativo.vulnerabilidades.map(v => v.cve_code || 'VULN').join(', ');
        hostLog.push(`[!] VULNERABILIDADES ATIVAS (${vulnCount}): ${cves}`);
      }

      setLogs((prev) => [...prev, ...hostLog]);
    }

    await new Promise((r) => setTimeout(r, 300));
    setLogs((prev) => [
      ...prev,
      `------------------------------------------------------------`,
      `Iniciando Motor Matemático: Resolvendo sistema linear (I - A) * x = b...`,
    ]);

    // Recalcular riscos
    onRecalculateRisks();

    await new Promise((r) => setTimeout(r, 400));
    const finalReport = ativos.map(
      (a) => `> Risco final calculado para ${a.nome} (ID ${a.id_ativo}): ${a.risco_final.toFixed(2)}`
    );

    setLogs((prev) => [
      ...prev,
      ...finalReport,
      `Nmap done: ${ativos.length} IP addresses scanned in ${((latency * 10) + 0.4).toFixed(2)} seconds.`,
      `[SUCESSO] Varredura e propagação matricial concluídas com sucesso.`,
    ]);

    setIsScanning(false);
    setScanFinished(true);
  };

  return (
    <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Terminal Titlebar */}
      <div className="px-4 py-3 bg-[#0d1527] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-200">
            Nmap Network Topology &amp; Risk Scanner Console
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            simulador.py
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startScan}
            disabled={isScanning}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              isScanning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Escaneando...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Executar Scan Nmap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 bg-[#080d1a] select-text">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Terminal className="w-8 h-8 opacity-40 text-cyan-400" />
            <p>Clique em "Executar Scan Nmap" para simular a varredura da topologia de rede.</p>
            <p className="text-[11px] text-slate-400">
              O scanner auditará conexões, portas e acionará o motor de propagação matricial.
            </p>
          </div>
        ) : (
          logs.map((log, index) => {
            const isSuccess = log.includes('[SUCESSO]') || log.includes('Nmap done');
            const isVuln = log.includes('[!] VULNERABILIDADES');
            const isConn = log.includes('[+] Descoberta rota');
            const isHeader = log.includes('Nmap scan report') || log.includes('Starting Nmap');
            const isMath = log.includes('Risco final calculado') || log.includes('Motor Matemático');

            return (
              <div
                key={index}
                className={`${
                  isSuccess
                    ? 'text-emerald-400 font-bold'
                    : isVuln
                    ? 'text-rose-400 font-semibold'
                    : isConn
                    ? 'text-cyan-300'
                    : isHeader
                    ? 'text-yellow-300 font-bold'
                    : isMath
                    ? 'text-amber-300'
                    : 'text-slate-300'
                }`}
              >
                {log}
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-2 bg-[#0d1527] border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-400 animate-pulse' : scanFinished ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          Status: {isScanning ? 'Varrendo hosts da topologia...' : scanFinished ? 'Varredura Completa' : 'Pronto'}
        </span>
        <span>Ativos no Inventário: {ativos.length}</span>
      </div>
    </div>
  );
};
