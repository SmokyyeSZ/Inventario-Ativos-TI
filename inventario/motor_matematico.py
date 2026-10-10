import numpy as np
from .models import Equipamento

class MotorMatematico:
    def __init__(self):
        self.fatores_exposicao = {
            'SERVIDOR':1.5,
            'BANCO_DE_DADOS': 1.5,
            'NOTEBOOK': 1.0,
            'ROTEADORES': 1.0
        }

    def calcular_risco_rede(self):
        ativos = list(Equipamento.objects.all())
        n = len(ativos)

        if n == 0:
            return None

        matriz_A = np.zeros((n,n))
        vetor_b = np.zeros(n)

        id_para_indice = {ativo.id_ativo: indice for indice, ativo in enumerate(ativos)}

        for i, ativo in enumerate(ativos):
            #--- CÁLCULO DO VETOR B (Risco proprio) ---#
            score_total = sum(vuln.score for vuln in ativo.vulnerabilidades.all())

            expo = self.fatores_exposicao.get(ativo.tipo.upper(), 1.0)

            risco_proprio = score_total * expo
            vetor_b[i] = risco_proprio

            #--- CÁLCULO DA MATRIZ A (Conexões) ---#

            for conexao in ativo.conexoes.all():
                if conexao.id_ativo in id_para_indice:
                    j = id_para_indice[conexao.id_ativo]
                    matriz_A[i][j] = 1

        mi = np.eye(n)
        det = np.linalg.det(mi - matriz_A)

        if np.isclose(det, 0):
            print("A matriz não é invertível")
            return None

        solve = np.linalg.solve(mi - matriz_A, vetor_b)

        for i, ativo in enumerate(ativos):
            ativo.risco_proprio = round(float(vetor_b[i]), 2)
            ativo.risco_final = round(float(solve[i]), 2)
            ativo.save()

        return True