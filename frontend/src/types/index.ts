export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface CveItem {
  id: string;
  cvss: number;
  severidade: SeverityLevel;
  descricao: string;
  vetorAtaque: string;
  dataDescoberta: string;
  status: 'Ativo' | 'Mitigando' | 'Corrigido';
}

export interface NetworkConnection {
  id: string;
  origemId: string;
  destinoId: string;
  destinoNome: string;
  porta: number;
  protocolo: string;
  pesoPropagacao: number;
  direcao: 'Inbound' | 'Outbound' | 'Bidirecional';
  status: 'Ativa' | 'Bloqueada' | 'Monitorada';
}

export interface Asset {
  id: string;
  nome: string;
  responsavel: string;
  departamento: string;
  ip: string;
  mac: string;
  tipo: 'Database' | 'Gateway' | 'Internal Server' | 'Workstation' | 'Cloud Endpoint' | 'Firewall';
  criticidade: SeverityLevel;
  riscoFinal: number;
  cves: CveItem[];
  conexoes: NetworkConnection[];
  pesoPropagacao: number;
  status: 'online' | 'warning' | 'compromised' | 'isolated';
  ultimoScan: string;
  sistemaOperacional: string;
}

export interface RiskPropagationMetrics {
  totalAssets: number;
  lambdaMax: number;
  unpatchedCves: number;
  matrixDensity: number;
  propagationSpeed: number;
  heatmap: {
    labels: string[];
    matrix: number[][];
  };
  eigenvectorCentrality: {
    matrixA: number[][];
    vectorX: number[];
    density: number;
    metricsCount: number;
  };
}

export type ActiveTab = 'dashboard' | 'inventory' | 'details' | 'topology';
