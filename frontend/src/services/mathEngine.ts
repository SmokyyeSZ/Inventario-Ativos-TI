import { Equipamento, TipoAtivo } from '../types/inventory';

export const FATORES_EXPOSICAO: Record<TipoAtivo, number> = {
  SERVIDOR: 1.5,
  BANCO_DE_DADOS: 1.5,
  NOTEBOOK: 1.0,
  ROTEADORES: 1.0,
};

/**
 * Resolve sistema linear (M * x = b) usando Eliminação Gaussiana com Pivoteamento Parcial
 */
function solveLinearSystem(M: number[][], b: number[]): number[] | null {
  const n = b.length;
  if (n === 0) return [];
  
  // Clonar matriz e vetor para não alterar os originais
  const A: number[][] = M.map(row => [...row]);
  const x: number[] = [...b];

  for (let i = 0; i < n; i++) {
    // Encontrar linha pivô
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }

    // Trocar linhas se necessário
    if (maxRow !== i) {
      [A[i], A[maxRow]] = [A[maxRow], A[i]];
      [x[i], x[maxRow]] = [x[maxRow], x[i]];
    }

    // Verificar se pivô é próximo de zero (matriz singular)
    if (Math.abs(A[i][i]) < 1e-9) {
      A[i][i] = 1e-6; // Estabilização numérica suave
    }

    // Eliminação para linhas abaixo
    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      x[k] -= factor * x[i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
    }
  }

  // Substituição regressiva
  const solution = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += A[i][j] * solution[j];
    }
    solution[i] = (x[i] - sum) / A[i][i];
  }

  return solution;
}

/**
 * Estima o maior autovalor (lambda_max) via método das potências
 */
function estimateMaxEigenvalue(A: number[][], iterations = 20): number {
  const n = A.length;
  if (n === 0) return 0;
  let v = new Array(n).fill(1 / Math.sqrt(n));

  for (let iter = 0; iter < iterations; iter++) {
    const Av = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        Av[i] += A[i][j] * v[j];
      }
    }
    const norm = Math.sqrt(Av.reduce((acc, val) => acc + val * val, 0));
    if (norm < 1e-9) return 0;
    v = Av.map(val => val / norm);
  }

  // Rayleigh quotient
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    let Avi = 0;
    for (let j = 0; j < n; j++) {
      Avi += A[i][j] * v[j];
    }
    numerator += v[i] * Avi;
    denominator += v[i] * v[i];
  }

  return denominator > 0 ? Math.max(0, numerator / denominator) : 0;
}

export interface NetworkRiskCalculationResult {
  ativosAtualizados: Equipamento[];
  matrizA: number[][];
  vetorB: number[];
  vetorX: number[];
  alpha: number;
  lambdaMax: number;
  matrixDensity: number;
  totalRiskB: number;
  totalRiskFinal: number;
  amplificationFactor: number;
}

/**
 * Executa o cálculo exato do motor matemático de propagação de risco:
 * (I - alpha * A) * x = b  =>  x = (I - alpha * A)^-1 * b
 */
export function calcularRiscoRede(ativos: Equipamento[], alpha = 0.5): NetworkRiskCalculationResult {
  const n = ativos.length;
  if (n === 0) {
    return {
      ativosAtualizados: [],
      matrizA: [],
      vetorB: [],
      vetorX: [],
      alpha,
      lambdaMax: 0,
      matrixDensity: 0,
      totalRiskB: 0,
      totalRiskFinal: 0,
      amplificationFactor: 1,
    };
  }

  const idParaIndice: Record<string, number> = {};
  ativos.forEach((ativo, idx) => {
    idParaIndice[ativo.id_ativo] = idx;
  });

  // 1. Cálculo do Vetor b (Risco Próprio)
  const vetorB = new Array(n).fill(0);
  ativos.forEach((ativo, i) => {
    const scoreTotal = ativo.vulnerabilidades.reduce((acc, v) => acc + (v.score || 0), 0);
    const fatorExpo = FATORES_EXPOSICAO[ativo.tipo] || 1.0;
    const riscoProprio = parseFloat((scoreTotal * fatorExpo).toFixed(2));
    vetorB[i] = riscoProprio;
  });

  // 2. Cálculo da Matriz de Adjacência A (Conexões)
  const matrizA: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  let totalEdges = 0;

  ativos.forEach((ativo, i) => {
    (ativo.conexoes || []).forEach(targetId => {
      if (idParaIndice[targetId] !== undefined) {
        const j = idParaIndice[targetId];
        matrizA[i][j] = 1;
        totalEdges++;
      }
    });
  });

  // 3. Montar matriz M = (I - alpha * A)
  const M: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      const identidade = i === j ? 1 : 0;
      return identidade - alpha * matrizA[i][j];
    })
  );

  // 4. Resolver (I - alpha * A) * x = b
  let solucao = solveLinearSystem(M, vetorB);
  if (!solucao) {
    // Fallback gracioso com propagação atenuada de 1 salto
    solucao = vetorB.map((b_i, i) => {
      let propagation = 0;
      for (let j = 0; j < n; j++) {
        propagation += matrizA[i][j] * (vetorB[j] * alpha);
      }
      return b_i + propagation;
    });
  }

  // Arredondar valores
  const vetorX = solucao.map(val => Math.max(0, parseFloat(val.toFixed(2))));

  // 5. Atualizar ativos com risco_proprio e risco_final
  const ativosAtualizados = ativos.map((ativo, idx) => ({
    ...ativo,
    risco_proprio: vetorB[idx],
    risco_final: vetorX[idx],
  }));

  const lambdaMax = parseFloat(estimateMaxEigenvalue(matrizA).toFixed(2));
  const matrixDensity = n > 1 ? parseFloat((totalEdges / (n * (n - 1))).toFixed(3)) : 0;
  const totalRiskB = parseFloat(vetorB.reduce((a, b) => a + b, 0).toFixed(2));
  const totalRiskFinal = parseFloat(vetorX.reduce((a, b) => a + b, 0).toFixed(2));
  const amplificationFactor = totalRiskB > 0 ? parseFloat((totalRiskFinal / totalRiskB).toFixed(2)) : 1.0;

  return {
    ativosAtualizados,
    matrizA,
    vetorB,
    vetorX,
    alpha,
    lambdaMax,
    matrixDensity,
    totalRiskB,
    totalRiskFinal,
    amplificationFactor,
  };
}
