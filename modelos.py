from enum import Enum

class TipoAtivo(Enum):
    NOTEBOOK = 1
    SERVIDOR = 2
    ROTEADORES = 3
    BANCO_DE_DADOS = 4

class SeveridadeVulnerabilidade(Enum):
    BAIXA = 1
    MEDIA = 2
    ALTA = 3
    CRITICA = 4

class StatusTratamento(Enum):
    ABERTO = 1
    EM_TRATAMENTO = 2
    CORRIGIDA = 3
    RISCO_ACEITO = 4

class Vulnerabilidade:
    """Representa uma vulnerabilidade associada a um ativo de TI."""
    def __init__(self, descricao, categoria, severidade, status):
        self.descricao = descricao
        self.categoria = categoria
        self.severidade = severidade
        self.status = status

    def to_dict(self):
        return {
            "descricao": self.descricao,
            "categoria": self.categoria,
            "severidade": self.severidade,
            "status": self.status
        }

class Ativo:
    """Representa um ativo de TI e armazena suas propriedades e vulnerabilidades."""
    def __init__(self, id_ativo, nome,responsavel, departamento, tipo):
        self.id_ativo = id_ativo
        self.nome = nome
        self.responsavel = responsavel
        self.departamento = departamento
        self.tipo = tipo
        self.vulnerabilidades = [] # Lista inicial vazia de vulnerabilidades

    def adicionar_vulnerabilidade(self, vulnerabilidade: Vulnerabilidade):
        self.vulnerabilidades.append(vulnerabilidade)

    def to_dict(self):
        return {
            "nome": self.nome,
            "responsavel": self.responsavel,
            "departamento": self.departamento,
            "tipo": self.tipo,
            "vulnerabilidades": [vuln.to_dict() for vuln in self.vulnerabilidades]
        }