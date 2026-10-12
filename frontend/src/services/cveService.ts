import { SeveridadeVulnerabilidade } from '../types/inventory';

export const CVE_REGEX = /^CVE-(?:1999|20[0-2][0-6])-\d{4,}$/i;

export function validarFormatoCve(cveId: string): boolean {
  return CVE_REGEX.test(cveId.trim().toUpperCase());
}

export function converterSeveridadeCvss(severidadeCvss?: string): SeveridadeVulnerabilidade {
  if (!severidadeCvss) return 'MEDIA';
  const s = severidadeCvss.toUpperCase();
  if (s === 'CRITICAL' || s === 'CRITICA') return 'CRITICA';
  if (s === 'HIGH' || s === 'ALTA') return 'ALTA';
  if (s === 'MEDIUM' || s === 'MEDIA') return 'MEDIA';
  if (s === 'LOW' || s === 'BAIXA') return 'BAIXA';
  return 'NENHUMA';
}

export function calcularSeveridadePorScore(score: number): SeveridadeVulnerabilidade {
  if (score === 0) return 'NENHUMA';
  if (score <= 3.9) return 'BAIXA';
  if (score <= 6.9) return 'MEDIA';
  if (score <= 8.9) return 'ALTA';
  return 'CRITICA';
}

export interface CveApiResult {
  cveId: string;
  descricao: string;
  score: number;
  severidade: SeveridadeVulnerabilidade;
  categoria: string;
  source: 'NVD_API' | 'OFFLINE_CACHE';
}

const KNOWN_CVE_CACHE: Record<string, Omit<CveApiResult, 'source'>> = {
  'CVE-2024-3094': {
    cveId: 'CVE-2024-3094',
    descricao: 'Malicious code in upstream tarballs of xz-utils from versions 5.6.0 and 5.6.1 compromising sshd authentication.',
    score: 10.0,
    severidade: 'CRITICA',
    categoria: 'Supply Chain / Backdoor',
  },
  'CVE-2023-38606': {
    cveId: 'CVE-2023-38606',
    descricao: 'An app may be able to modify sensitive kernel state via physical memory hardware register bypass.',
    score: 9.8,
    severidade: 'CRITICA',
    categoria: 'Privilege Escalation / Kernel',
  },
  'CVE-2022-22965': {
    cveId: 'CVE-2022-22965',
    descricao: 'Spring Framework RCE via Data Binding (Spring4Shell) allowing unauthenticated remote code execution.',
    score: 9.8,
    severidade: 'CRITICA',
    categoria: 'Remote Code Execution',
  },
  'CVE-2021-44228': {
    cveId: 'CVE-2021-44228',
    descricao: 'Apache Log4j2 JNDI features used in configuration and messages allowing arbitrary LDAP lookup code execution (Log4Shell).',
    score: 10.0,
    severidade: 'CRITICA',
    categoria: 'Remote Code Execution',
  },
  'CVE-2024-1086': {
    cveId: 'CVE-2024-1086',
    descricao: 'Linux kernel Netfilter nf_tables use-after-free leading to local privilege escalation.',
    score: 7.8,
    severidade: 'ALTA',
    categoria: 'Local Privilege Escalation',
  },
  'CVE-2023-36884': {
    cveId: 'CVE-2023-36884',
    descricao: 'Office and Windows HTML Remote Code Execution Vulnerability targeted in targeted spear-phishing campaigns.',
    score: 8.3,
    severidade: 'ALTA',
    categoria: 'Phishing / RCE',
  },
  'CVE-2024-21413': {
    cveId: 'CVE-2024-21413',
    descricao: 'Microsoft Outlook Remote Code Execution Vulnerability (Moniker Link Bug) bypassing Protected View.',
    score: 9.8,
    severidade: 'CRITICA',
    categoria: 'Protocol Handler RCE',
  },
};

/**
 * Consulta a API NVD NIST com timeout e fallback caso haja rate limit (403/429) ou CORS
 */
export async function buscarCveNvd(cveId: string): Promise<CveApiResult> {
  const cveUpper = cveId.trim().toUpperCase();

  // Verificar cache local primeiro para agilidade
  if (KNOWN_CVE_CACHE[cveUpper]) {
    return {
      ...KNOWN_CVE_CACHE[cveUpper],
      source: 'OFFLINE_CACHE',
    };
  }

  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cveUpper)}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.vulnerabilities && data.vulnerabilities.length > 0) {
        const item = data.vulnerabilities[0].cve;
        const descricao = item.descriptions?.[0]?.value || 'Descrição indisponível no registro NVD.';
        
        let score = 5.0;
        let baseSeverity = 'MEDIUM';

        // Tentar CVSS v3.1 ou v3.0
        const metricV31 = item.metrics?.cvssMetricV31?.[0]?.cvssData;
        const metricV30 = item.metrics?.cvssMetricV30?.[0]?.cvssData;
        const metricV2 = item.metrics?.cvssMetricV2?.[0]?.cvssData;

        if (metricV31) {
          score = metricV31.baseScore;
          baseSeverity = metricV31.baseSeverity;
        } else if (metricV30) {
          score = metricV30.baseScore;
          baseSeverity = metricV30.baseSeverity;
        } else if (metricV2) {
          score = metricV2.baseScore;
          baseSeverity = score >= 7 ? 'HIGH' : score >= 4 ? 'MEDIUM' : 'LOW';
        }

        return {
          cveId: cveUpper,
          descricao,
          score,
          severidade: converterSeveridadeCvss(baseSeverity),
          categoria: 'Vulnerabilidade NVD NIST',
          source: 'NVD_API',
        };
      }
    }
  } catch {
    // Fallback silencioso para geração padrão quando a rede ou rate-limit do NIST barrar
  }

  // Se não foi encontrado ou a API estiver fora do ar, retornar molde inicial editável
  return {
    cveId: cveUpper,
    descricao: `Vulnerabilidade registrada para ${cveUpper}. Detalhes pendentes de validação técnica.`,
    score: 7.5,
    severidade: 'ALTA',
    categoria: 'Falha de Segurança Geral',
    source: 'OFFLINE_CACHE',
  };
}
