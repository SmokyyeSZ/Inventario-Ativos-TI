import numpy as np
from .models import Equipamento, ConexaoRede

class MotorMatematico:
    def __init__(self):
        self.fatores_exposicao = {
            'CRITICAL':2.0,
            'HIGH': 1.5,
            'MEDIUM': 1.0,
            'LOW': 0.5
        }

    def calcular_risco_rede(self):
        ativos = list(Equipamento.objects.all())
        n = len(ativos)

        if n == 0:
            return None

        matriz_A = np.zeros((n,n))
        vetor_b = np.zeros(n)

        id_para_indice = {ativo.id: indice for indice, ativo in enumerate(ativos)}

        for i, ativo in enumerate(ativos):
            score_total = sum(vuln.score for vuln in ativo.vulnerabilidades.all() if vuln.status != 'Corrigido')

            expo = self.fatores_exposicao.get(ativo.criticidade.upper(), 1.0)

            risco_proprio = score_total * expo
            vetor_b[i] = risco_proprio

            for conexao in ativo.conexoes_origem.all():
                if conexao.status == 'Bloqueada':
                    continue
                elif conexao.destino.id in id_para_indice:
                    j = id_para_indice[conexao.destino.id]
                    peso = conexao.peso_propagacao
                    if conexao.direcao == 'Bidirecional':
                        matriz_A[i][j] = peso
                        matriz_A[j][i] = peso
                    elif conexao.direcao == 'Inbound':
                        matriz_A[j][i] = peso
                    else:
                        matriz_A[i][j] = peso

        mi = np.eye(n)
        det = np.linalg.det(mi - matriz_A)

        if np.isclose(det, 0):
            print("A matriz não é invertível")
            return None

        solve = np.linalg.solve(mi - matriz_A, vetor_b)

        for i, ativo in enumerate(ativos):
            ativo.risco_proprio = round(float(vetor_b[i]), 2)
            ativo.risco_final = round(float(solve[i]), 2)
            ativo.peso_propagacao = round(float(np.max(matriz_A[i])) if np.any(matriz_A[i] > 0) else 0.0, 2)
            ativo.save()

        return True