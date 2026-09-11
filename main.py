"""
========================= Índice =========================

[BLOCO: Imports]

[BLOCO: Enum          ]
    [SEÇÃO: ID        ]
    [SEÇÃO: Severidade]

[BLOCO: Base de Dados    ]
    [SEÇÃO: ...]
    [SEÇÃO: ...]

"""

#[------------------------ ------------------------]
#|                  BLOCO: Imports                 |
#[------------------------ ------------------------]

from enum import Enum
import json
import os

#[------------------------ ------------------------]
#|                  BLOCO: Enum                    |
#[------------------------ ------------------------]

#[                  SEÇÃO: ID                      ]

class TipoAtivo(Enum):
    NOTEBOOK = 1
    SERVIDOR = 2
    ROTEADORES = 3
    BANCO_DE_DADOS = 4

#[                  SEÇÃO: Severidade              ]

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

#[------------------------ ------------------------]
#|          BLOCO: Persistencia de dados           |
#[------------------------ ------------------------]

#[             SEÇÃO: Variaveis_dados              ]

ARQUIVO_DB = "inventario.json"

#[               SEÇÃO: Funções_dados              ]

def carregar_dados():
    try:
        with open(ARQUIVO_DB, 'r', encoding='utf-8') as arquivo:
            dados = json.load(arquivo)
            print("Dados carregados com sucesso.")
            return dados
    except FileNotFoundError:
        print("Nenhum arquivo de base encontrado. Iniciando inventário vazio.")
        return {}

def salvar_dados(dados):
    try:
        with open(ARQUIVO_DB, 'w', encoding='utf-8') as arquivo:
            json.dump(dados, arquivo, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Erro ao salvar os dados: {e}")

#[------------------------ ------------------------]
#|               BLOCO: Base de Dados              |
#[------------------------ ------------------------]

inventario = carregar_dados()