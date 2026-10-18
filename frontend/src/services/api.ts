import axios from 'axios';
import { Asset, CveItem, NetworkConnection, RiskPropagationMetrics } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const initialMetrics: RiskPropagationMetrics = {
  totalAssets: 14842,
  lambdaMax: 2.45,
  unpatchedCves: 341,
  matrixDensity: 0.12,
  propagationSpeed: 0.85,
  heatmap: {
    labels: ['Web', 'DB', 'API', 'Internal'],
    matrix: [
      [1.00, 0.50, 3.84, 7.38],
      [0.50, 1.00, 2.37, 3.86],
      [0.30, 0.58, 1.00, 3.30],
      [0.20, 0.25, 0.13, 0.30],
    ],
  },
  eigenvectorCentrality: {
    matrixA: [
      [1, 0, 1, 0, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0],
    ],
    vectorX: [1.1, 0.75, 1.0],
    density: 0.125,
    metricsCount: 48,
  },
};

export const initialAssets: Asset[] = [
  {
    id: 'ast-01',
    nome: 'PROD-DB-01',
    responsavel: 'Equipe de TI',
    departamento: 'Engenharia de Dados',
    ip: '10.100.2.14',
    mac: '00:1A:2B:3C:4D:5E',
    tipo: 'Database',
    criticidade: 'Critical',
    riscoFinal: 9.8,
    pesoPropagacao: 0.86,
    status: 'compromised',
    ultimoScan: '12/10/2026 18:24',
    sistemaOperacional: 'Ubuntu Linux 22.04 LTS (Kernel 5.15)',
    cves: [
      {
        id: 'CVE-2023-38606',
        cvss: 9.8,
        severidade: 'Critical',
        descricao: 'Execução remota de código via corrupção de memória em engine SQL e cache compartilhado.',
        vetorAtaque: 'Network / Zero-Click',
        dataDescoberta: '2023-08-11',
        status: 'Ativo',
      },
      {
        id: 'CVE-2024-3094',
        cvss: 9.2,
        severidade: 'Critical',
        descricao: 'Backdoor em utilitário de compressão afetando rotinas de autenticação SSH da infraestrutura.',
        vetorAtaque: 'Remote / Pre-Auth',
        dataDescoberta: '2024-03-29',
        status: 'Ativo',
      },
    ],
    conexoes: [
      {
        id: 'conn-01',
        origemId: 'ast-01',
        destinoId: 'ast-02',
        destinoNome: 'GATEWAY-02',
        porta: 5432,
        protocolo: 'TCP / PostgreSQL TLS',
        pesoPropagacao: 0.85,
        direcao: 'Inbound',
        status: 'Ativa',
      },
      {
        id: 'conn-02',
        origemId: 'ast-01',
        destinoId: 'ast-03',
        destinoNome: 'INTERNAL-SRV-04',
        porta: 6379,
        protocolo: 'TCP / Redis Cache',
        pesoPropagacao: 0.72,
        direcao: 'Bidirecional',
        status: 'Ativa',
      },
      {
        id: 'conn-03',
        origemId: 'ast-01',
        destinoId: 'ast-05',
        destinoNome: 'FIREWALL-MAIN',
        porta: 443,
        protocolo: 'HTTPS / Admin API',
        pesoPropagacao: 0.40,
        direcao: 'Outbound',
        status: 'Monitorada',
      },
    ],
  },
  {
    id: 'ast-02',
    nome: 'GATEWAY-02',
    responsavel: 'Equipe de TI',
    departamento: 'Infraestrutura Cloud',
    ip: '10.100.1.5',
    mac: '00:1A:2B:99:88:77',
    tipo: 'Gateway',
    criticidade: 'High',
    riscoFinal: 9.2,
    pesoPropagacao: 0.65,
    status: 'warning',
    ultimoScan: '12/10/2026 18:30',
    sistemaOperacional: 'Alpine Linux 3.19 / Envoy Proxy',
    cves: [
      {
        id: 'CVE-2024-3094',
        cvss: 9.2,
        severidade: 'High',
        descricao: 'Falha de validação de cabeçalhos HTTP/2 permitindo escalonamento de privilégios.',
        vetorAtaque: 'Network / Unauthenticated',
        dataDescoberta: '2024-04-02',
        status: 'Mitigando',
      },
    ],
    conexoes: [
      {
        id: 'conn-04',
        origemId: 'ast-02',
        destinoId: 'ast-01',
        destinoNome: 'PROD-DB-01',
        porta: 5432,
        protocolo: 'TCP / PostgreSQL',
        pesoPropagacao: 0.85,
        direcao: 'Outbound',
        status: 'Ativa',
      },
      {
        id: 'conn-05',
        origemId: 'ast-02',
        destinoId: 'ast-06',
        destinoNome: 'CLOUD-ENDPOINT-01',
        porta: 443,
        protocolo: 'HTTPS / TLS 1.3',
        pesoPropagacao: 0.35,
        direcao: 'Inbound',
        status: 'Ativa',
      },
    ],
  },
  {
    id: 'ast-03',
    nome: 'INTERNAL-SRV-04',
    responsavel: 'Equipe de TI',
    departamento: 'Desenvolvimento Core',
    ip: '10.100.1.12',
    mac: '00:1A:2B:44:55:66',
    tipo: 'Internal Server',
    criticidade: 'High',
    riscoFinal: 8.4,
    pesoPropagacao: 0.58,
    status: 'warning',
    ultimoScan: '12/10/2026 17:15',
    sistemaOperacional: 'Debian 12 Bookworm',
    cves: [
      {
        id: 'CVE-2024-21413',
        cvss: 8.4,
        severidade: 'High',
        descricao: 'Vulnerabilidade em parse de URI e passagem de parâmetros sem sanitização.',
        vetorAtaque: 'Local / Remote Injection',
        dataDescoberta: '2024-02-14',
        status: 'Ativo',
      },
    ],
    conexoes: [
      {
        id: 'conn-06',
        origemId: 'ast-03',
        destinoId: 'ast-01',
        destinoNome: 'PROD-DB-01',
        porta: 6379,
        protocolo: 'Redis Protocol',
        pesoPropagacao: 0.72,
        direcao: 'Bidirecional',
        status: 'Ativa',
      },
    ],
  },
  {
    id: 'ast-04',
    nome: 'MIGRATION-SRV',
    responsavel: 'Equipe de TI',
    departamento: 'Operações TI',
    ip: '10.100.1.52',
    mac: '00:1A:2B:11:22:33',
    tipo: 'Internal Server',
    criticidade: 'High',
    riscoFinal: 7.8,
    pesoPropagacao: 0.44,
    status: 'warning',
    ultimoScan: '12/10/2026 16:40',
    sistemaOperacional: 'Red Hat Enterprise Linux 9.3',
    cves: [
      {
        id: 'CVE-2023-4863',
        cvss: 7.8,
        severidade: 'High',
        descricao: 'Overflow de buffer em biblioteca de parsing de dados de migração.',
        vetorAtaque: 'Local Network',
        dataDescoberta: '2023-09-12',
        status: 'Mitigando',
      },
    ],
    conexoes: [
      {
        id: 'conn-07',
        origemId: 'ast-04',
        destinoId: 'ast-01',
        destinoNome: 'PROD-DB-01',
        porta: 22,
        protocolo: 'SSH / SCP Sync',
        pesoPropagacao: 0.45,
        direcao: 'Inbound',
        status: 'Ativa',
      },
    ],
  },
  {
    id: 'ast-05',
    nome: 'FIREWALL-MAIN',
    responsavel: 'Equipe de TI',
    departamento: 'Segurança da Informação',
    ip: '10.100.0.1',
    mac: '00:1A:2B:00:11:22',
    tipo: 'Firewall',
    criticidade: 'Medium',
    riscoFinal: 4.8,
    pesoPropagacao: 0.22,
    status: 'online',
    ultimoScan: '12/10/2026 18:00',
    sistemaOperacional: 'pfSense Enterprise 2.7.2',
    cves: [],
    conexoes: [
      {
        id: 'conn-08',
        origemId: 'ast-05',
        destinoId: 'ast-02',
        destinoNome: 'GATEWAY-02',
        porta: 443,
        protocolo: 'HTTPS Filter',
        pesoPropagacao: 0.15,
        direcao: 'Bidirecional',
        status: 'Ativa',
      },
    ],
  },
  {
    id: 'ast-06',
    nome: 'CLOUD-ENDPOINT-01',
    responsavel: 'Equipe de TI',
    departamento: 'Infraestrutura Cloud',
    ip: '10.100.8.20',
    mac: '00:1A:2B:77:66:55',
    tipo: 'Cloud Endpoint',
    criticidade: 'Medium',
    riscoFinal: 5.2,
    pesoPropagacao: 0.31,
    status: 'online',
    ultimoScan: '12/10/2026 15:50',
    sistemaOperacional: 'Amazon Linux 2023',
    cves: [
      {
        id: 'CVE-2023-29360',
        cvss: 5.3,
        severidade: 'Medium',
        descricao: 'Potencial vazamento de token efêmero em cabeçalho de telemetria.',
        vetorAtaque: 'Cloud Internal',
        dataDescoberta: '2023-06-20',
        status: 'Mitigando',
      },
    ],
    conexoes: [
      {
        id: 'conn-09',
        origemId: 'ast-06',
        destinoId: 'ast-02',
        destinoNome: 'GATEWAY-02',
        porta: 443,
        protocolo: 'HTTPS REST',
        pesoPropagacao: 0.30,
        direcao: 'Outbound',
        status: 'Ativa',
      },
    ],
  },
  {
    id: 'ast-07',
    nome: 'WS-FINANCE-09',
    responsavel: 'Equipe de TI',
    departamento: 'Operações Financeiras',
    ip: '10.100.4.88',
    mac: '00:1A:2B:AA:BB:CC',
    tipo: 'Workstation',
    criticidade: 'Low',
    riscoFinal: 2.1,
    pesoPropagacao: 0.08,
    status: 'online',
    ultimoScan: '12/10/2026 14:10',
    sistemaOperacional: 'Windows 11 Enterprise 23H2',
    cves: [],
    conexoes: [
      {
        id: 'conn-10',
        origemId: 'ast-07',
        destinoId: 'ast-05',
        destinoNome: 'FIREWALL-MAIN',
        porta: 443,
        protocolo: 'VPN WireGuard',
        pesoPropagacao: 0.10,
        direcao: 'Outbound',
        status: 'Ativa',
      },
    ],
  },
  {
    id: 'ast-08',
    nome: 'WS-ENG-03',
    responsavel: 'Equipe de TI',
    departamento: 'Desenvolvimento Core',
    ip: '10.100.4.45',
    mac: '00:1A:2B:DD:EE:FF',
    tipo: 'Workstation',
    criticidade: 'Low',
    riscoFinal: 3.4,
    pesoPropagacao: 0.12,
    status: 'online',
    ultimoScan: '12/10/2026 17:05',
    sistemaOperacional: 'Fedora Workstation 40',
    cves: [],
    conexoes: [
      {
        id: 'conn-11',
        origemId: 'ast-08',
        destinoId: 'ast-03',
        destinoNome: 'INTERNAL-SRV-04',
        porta: 22,
        protocolo: 'SSH KeyAuth',
        pesoPropagacao: 0.18,
        direcao: 'Outbound',
        status: 'Ativa',
      },
    ],
  },
];

export function updateApiBaseUrl(newUrl: string) {
  const target = newUrl.endsWith('/') ? newUrl : `${newUrl}/`;
  apiClient.defaults.baseURL = target;
}

export async function fetchDashboardMetrics(): Promise<RiskPropagationMetrics> {
  const res = await apiClient.get<RiskPropagationMetrics>('/metrics/');
  return res.data;
}

export async function fetchAssets(): Promise<Asset[]> {
  const res = await apiClient.get<Asset[]>('/equipamentos/');
  return res.data;
}

export async function fetchAssetById(id: string): Promise<Asset | null> {
  try {
    const res = await apiClient.get<Asset>(`equipamentos/${id}/`);
    return res.data;
  } catch {
    const found = initialAssets.find(a => a.id === id);
    return found || null;
  }
}

export async function createAssetOnServer(newAsset: Partial<Asset>): Promise<Asset> {
  try {
    const res = await apiClient.post<Asset>(`equipamentos/`, newAsset);
    return res.data
  } catch (error){
    throw error;
  }
}

export async function updateAssetOnServer(id: string, updated: Partial<Asset>): Promise<Asset> {
  try {
    const res = await apiClient.patch<Asset>(`equipamentos/${id}/`, updated);
    return res.data;
  } catch (error){
    throw error;
  }
}

export async function linkCveToAssetOnServer(assetId: string, cve: CveItem): Promise<Asset> {
  const res = await apiClient.post<Asset>(`equipamentos/${assetId}/cves/`, cve);
  return res.data;
}

export async function unlinkCveOnServer(assetId: string, cveId: string): Promise<void> {
  try {
    await apiClient.delete(`equipamentos/${assetId}/cves/${cveId}/`);
  } catch {
    return;
  }
}

export async function addConnectionOnServer(assetId: string, connection: NetworkConnection): Promise<Asset> {
  try {
    // Altere de /assets/... para equipamentos/...
    const res = await apiClient.post<Asset>(`equipamentos/${assetId}/connections/`, connection);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteConnectionOnServer(assetId: string, connectionId: string): Promise<void> {
  try {
    await apiClient.delete(`equipamentos/${assetId}/connections/${connectionId}/`);
  } catch {
    return;
  }
}

export async function testConnectionPing(assetId: string): Promise<{ success: boolean; latencyMs: number; openPorts: number[] }> {
  try {
    const res = await apiClient.post<{ success: boolean; latencyMs: number; openPorts: number[] }>(`equipamentos/${assetId}/ping/`);
    return res.data;
  } catch {
    return {
      success: true,
      latencyMs: Math.floor(Math.random() * 12) + 4,
      openPorts: [22, 80, 443, 5432],
    };
  }
}
