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

class Ativo:
    """Representa um ativo de TI e armazena suas propriedades."""
    def __init__(self, id_ativo, nome, departamento, tipo, severidade, status):
        self.id_ativo = id_ativo
        self.nome = nome
        self.departamento = departamento
        self.tipo = tipo
        self.severidade = severidade
        self.status = status

    def to_dict(self):
        return {
            "nome": self.nome,
            "departamento": self.departamento,
            "tipo": self.tipo,
            "severidade": self.severidade,
            "status": self.status
        }