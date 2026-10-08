"""
========================= Índice =========================

[BLOCO: Imports]

[BLOCO: Enums]

[BLOCO: Moldes POO]

"""

#[------------------------ ------------------------]
#|                 BLOCO: Imports                  |
#[------------------------ ------------------------]


from enum import Enum

#[------------------------ ------------------------]
#|                  BLOCO: Enums                   |
#[------------------------ ------------------------]

class TipoAtivo(Enum):
    NOTEBOOK = 1
    SERVIDOR = 2
    ROTEADORES = 3
    BANCO_DE_DADOS = 4

class SeveridadeVulnerabilidade(Enum):
    NENHUMA = 0
    BAIXA = 1
    MEDIA = 2
    ALTA = 3
    CRITICA = 4

class StatusTratamento(Enum):
    ABERTO = 1
    EM_TRATAMENTO = 2
    CORRIGIDA = 3
    RISCO_ACEITO = 4

#[------------------------ ------------------------]
#|                 BLOCO: Moldes POO                  |
#[------------------------ ------------------------]

class Vulnerabilidade:
    """Representa uma vulnerabilidade associada a um ativo de TI."""
    def __init__(self, descricao, categoria, severidade, status, score):
        self.descricao = descricao
        self.categoria = categoria
        self.severidade = severidade
        self.status = status
        self.score = score
        

    def to_dict(self):
        return {
            "descricao": self.descricao,
            "categoria": self.categoria,
            "severidade": self.severidade,
            "status": self.status,
            "score": self.score
        }
    def definir_severidade(self, score):
        if score == 0:
            return SeveridadeVulnerabilidade.NENHUMA.name
        elif score <= 3.9:
            return SeveridadeVulnerabilidade.BAIXA.name
        elif score <= 6.9:
            return SeveridadeVulnerabilidade.MEDIA.name
        elif score <= 8.9:
            return SeveridadeVulnerabilidade.ALTA.name
        elif score <= 10:
            return SeveridadeVulnerabilidade.CRITICA.name
        
class Equipamentos:
    """Representa um ativo de TI e armazena suas propriedades e vulnerabilidades."""
    def __init__(self, id_ativo, nome,responsavel, departamento, tipo):
        self.id_ativo = id_ativo
        self.nome = nome
        self.responsavel = responsavel
        self.departamento = departamento
        self.tipo = tipo
        self.vulnerabilidades = []
        self.conexoes = []
        self.risco_proprio = 0.0
        self.risco_final = 0.0

    def adicionar_vulnerabilidade(self, vulnerabilidade: Vulnerabilidade):
        self.vulnerabilidades.append(vulnerabilidade)

    def to_dict(self):
        return {
            "id_ativo": self.id_ativo,
            "nome": self.nome,
            "responsavel": self.responsavel,
            "departamento": self.departamento,
            "tipo": self.tipo.name,
            "vulnerabilidades": [vuln.to_dict() for vuln in self.vulnerabilidades],
            "conexoes": self.conexoes,
            "risco_final": self.risco_final,
            "risco_proprio": self.risco_proprio
        }

class Servidor(Equipamentos):
    def __init__(self, id_ativo, nome, responsavel, departamento):
        super().__init__(id_ativo, nome, responsavel, departamento, TipoAtivo.SERVIDOR)

    def obter_fator_exposicao(self):
        return 1.5

class Notebook(Equipamentos):
    def __init__(self, id_ativo, nome, responsavel, departamento):
        super().__init__(id_ativo, nome, responsavel, departamento, TipoAtivo.NOTEBOOK)
    def obter_fator_exposicao(self):
        return 1.0

class BancoDeDados(Equipamentos):
    def __init__(self, id_ativo, nome, responsavel, departamento):
        super().__init__(id_ativo, nome, responsavel, departamento, TipoAtivo.BANCO_DE_DADOS)
    def obter_fator_exposicao(self):
        return 1.5

class Roteadores(Equipamentos):
    def __init__(self, id_ativo, nome, responsavel, departamento):
        super().__init__(id_ativo, nome, responsavel, departamento, TipoAtivo.ROTEADORES)
    def obter_fator_exposicao(self):
        return 1.0
