import numpy as np
from .models import Equipamento, Factory_equipamento


class MotorMatematico:
    def __init__(self):
        pass

    def calcular_risco_rede(self, usuario=None):
        if usuario is not None and not getattr(usuario, 'is_superuser', False):
            ativos = list(Equipamento.objects.filter(responsavel=usuario))
        else:
            ativos = list(Equipamento.objects.all())

        n = len(ativos)

        if n == 0:
            return None

        matriz_A = np.zeros((n, n))
        vetor_b = np.zeros(n)

        id_para_indice = {ativo.id: indice for indice, ativo in enumerate(ativos)}

        for i, ativo in enumerate(ativos):
            score_total = sum(
                vuln.score
                for vuln in ativo.vulnerabilidades.all()
                if str(vuln.status).lower() not in ('corrigido', 'corrigida')
            )

            expo = Factory_equipamento({'tipo': ativo.tipo}).fator_exposicao()

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

        # Para cada ativo, calcula o maior peso de propagação envolvendo ele (linha ou coluna)
        for i, ativo in enumerate(ativos):
            ativo.risco_proprio = round(float(vetor_b[i]), 2)
            ativo.risco_final = round(float(solve[i]), 2)
            pesos_associados = np.concatenate([matriz_A[i], matriz_A[:, i]])
            ativo.peso_propagacao = round(
                float(np.max(pesos_associados)) if np.any(pesos_associados > 0) else 0.0,
                2,
            )
            ativo.save()

        return True
