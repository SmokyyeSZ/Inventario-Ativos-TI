from gerenciador import InventarioManager
from modelos import Equipamentos, Notebook, Roteadores, BancoDeDados, Servidor
import numpy as np

fabrica_de_ativos = {
    "NOTEBOOK": Notebook,
    "SERVIDOR": Servidor,
    "BANCO_DE_DADOS": BancoDeDados,
    "ROTEADORES": Roteadores
}

gerenciador = InventarioManager()

class MotorMatematico:
    def __init__(self):
        pass
    def montar_formula(self, info_id):
        cont = 0
        ativo = gerenciador.buscar_ativo_por_id(info_id)
        if ativo:
            for vuln in ativo['vulnerabilidades']:
                cont += vuln['score']

            eq_real = ativo['tipo']

            equipamento_real = fabrica_de_ativos[eq_real](ativo['id_ativo'], ativo['nome'], ativo['responsavel'], ativo['departamento'])
            expo = equipamento_real.obter_fator_exposicao()

            risco_individual = cont * expo
            return risco_individual

    def gerar_vetor_b(self):
        vetor = []
        for ativo_dict in gerenciador.inventario:
            vetor.append(self.montar_formula(ativo_dict['id_ativo']))
        return vetor

    def matriz_A(self):
        N = len(gerenciador.inventario)
        matriz_zeros = np.zeros((N,N))
        return matriz_zeros

    def gerar_matriza_A(self):
        id_para_indices = {}
        for indice, ativo_dict in enumerate(gerenciador.inventario):
            id_para_indices[ativo_dict['id_ativo']] = indice

        matriz_rede = self.matriz_A()

        for ativo in gerenciador.inventario:
            linha = id_para_indices[ ativo['id_ativo']]

            for id_conexao in ativo['conexoes']:
                coluna = id_para_indices[id_conexao]
                matriz_rede[linha][coluna] = 1

        return matriz_rede

    def calcular_risco_final(self):
        A = self.gerar_matriza_A()
        b = self.gerar_vetor_b()
        n = len(gerenciador.inventario)

        mi = np.eye(n)

        solve = np.linalg.solve(mi - A, b)
        prova_real = (mi - A) @ solve
        if np.allclose(prova_real, b):
            return solve
        else:
            print("O calculo falhou")
