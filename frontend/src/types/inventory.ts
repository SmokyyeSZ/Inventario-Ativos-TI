export type TipoAtivo = 'NOTEBOOK' | 'SERVIDOR' | 'ROTEADORES' | 'BANCO_DE_DADOS';

export type SeveridadeVulnerabilidade = 'NENHUMA' | 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type StatusTratamento = 'ABERTO' | 'EM_TRATAMENTO' | 'CORRIGIDA' | 'RISCO_ACEITO';

export interface Vulnerabilidade {
  id: string;
  descricao: string;
  categoria: string;
  severidade: SeveridadeVulnerabilidade;
  status: StatusTratamento;
  score: number; // CVSS 0.0 - 10.0
  cve_code?: string;
}

export interface Equipamento {
  id_ativo: string;
  nome: string;
  responsavel: string;
  departamento: string;
  tipo: TipoAtivo;
  vulnerabilidades: Vulnerabilidade[];
  conexoes: string[]; // IDs dos ativos para onde o risco se propaga
  risco_proprio: number; // b_i = sum(score) * fator_exposicao
  risco_final: number; // x_i calculado via (I - alpha*A)^-1 * b
  ip?: string;
  // Posição no grafo de topologia (opcional para persistência no canvas)
  x?: number;
  y?: number;
}

export interface NmapScanResult {
  timestamp: string;
  target: string;
  hosts: {
    id: string;
    nome: string;
    tipo: TipoAtivo;
    ip: string;
    latency: number;
    conexoes: string[];
    risco_final: number;
    portas_abertas: string[];
  }[];
  total_tempo: string;
}
