"""
========================= Índice =========================

[BLOCO: Imports]

[BLOCO: Enum          ]
    [SEÇÃO: ID        ]
    [SEÇÃO: Severidade]

[BLOCO: Persistencia de dados]
    [SEÇÃO: Variaveis_dados  ]
    [SEÇÃO: Funções_dados    ]

[BLOCO: Base de Dados]

[BLOCO: Crud, Validações e Interface]
    [SEÇÃO: DEF_validações          ]
    [SEÇÃO: Interface               ]

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

    #Carrega o arquivo json e o salva em uma variavel pra podermos manipular os dados.

    try:
        with open(ARQUIVO_DB, 'r', encoding='utf-8') as arquivo:
            dados = json.load(arquivo)
            print("Dados carregados com sucesso.")
            return dados
    except FileNotFoundError:
        print("Nenhum arquivo de base encontrado. Iniciando inventário vazio.")
        return {}

def salvar_dados(dados):

    #Recebe um parametro e salva ele dentro do nosso "banco de dados" (json)

    try:
        with open(ARQUIVO_DB, 'w', encoding='utf-8') as arquivo:
            json.dump(dados, arquivo, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Erro ao salvar os dados: {e}")

#[------------------------ ------------------------]
#|               BLOCO: Base de Dados              |
#[------------------------ ------------------------]

inventario = carregar_dados()

#[------------------------ ------------------------]
#|       BLOCO: Crud, Validações e Interface       |
#[------------------------ ------------------------]

#[            SEÇÃO: Operações CRUD                ]

def cadastrar_ativos():
    """
    Coleta dados do usuário, verifica duplicidade de ID e adiciona um novo ativo.
    """
    print("\n--- [ Módulo de cadastro ] ---")

    #Lemos como inteiro com nossas funções para barrar letras.
    #Mas  convertemos para string(str) para usar como chave segura no dicionário/JSON.
    id_ativo = str(ler_inteiro("Digite o ID do ativo (número): "))

    #Aqui vou verificar se a chave ja existe no "banco de dados" local
    if id_ativo in inventario:
        print(f"\nErro: Já existe um ativo cadastrado com o ID {id_ativo}")
        return

    nome_ativo = input("Digite o nome do ativo (ex: Servidor Web, Notebook Dell): ")
    departamento = input("Digite o departamento (ex: RH, TI, Financeiro): ")

    #Capturando os enums com validação a prova de falhas
    tipo = ler_enum(TipoAtivo, "Selecione o Tipo de Ativo:")
    severidade = ler_enum(SeveridadeVulnerabilidade, "Selecione a severidade da vulnerabilidade:")
    status = ler_enum(StatusTratamento, "Selecione o Status do Tratamento")




    #Aqui vou criar o registro do ativo no dicionário global
    inventario[id_ativo] = {
        "nome": nome_ativo,
        "departamento": departamento,
        "tipo": tipo,
        "severidade": severidade,
        "status": status
    }

    #persiste a alteração no arquivo JSON imediatamente
    salvar_dados(inventario)
    print("Ativo cadastrado com sucesso!")
        


#[             SEÇÃO: DEF_validações               ]

def ler_inteiro(menssagem):
    """
    Solicita uma entrada do usuário até que um número inteiro válido seja digitado.
    """
    while True:
        try:
            valor = int(input(menssagem))
            return valor
        except ValueError:
            print("Erro: Digite apenas números inteiros.")

def ler_enum(classe_enum, mensagem):
    """
    Exibe as opções de um Enum dinamicamente e obriga o usuario a escolher um valor válido.
    """

    while True:
        print(f"{mensagem}")
        #O loop for varre a classe Enum e imprime "1 - NOTEBOOK", "2 - SERVIDOR", etc.
        for item in classe_enum:
            print(f"{item.value} - {item.name}")

        escolha = ler_inteiro("Escolhas o numero da opção: ")

        try:
            #Tenta instanciar o Enum com o número digitado e retorna o nome da opção
            return classe_enum(escolha).name
        except ValueError:
            print("Erro: Opção inválida; Escolha um dos numeros da lista.")

#[                 SEÇÃO: Interface                ]

def menu_principal():
    """
    Exibe o menu principal do sistema e gerencia a navegação entre as funcionalidades CRUD.
    """
    while True:
        print("\n--- Sistema de Inventário de Ativos de TI ---")
        print("1 - Cadastrar Ativo")
        print("2 - Consultar Ativo")
        print("3 - Listar Todos os Ativos")
        print("4 - Atualizar Ativo")
        print("5 - Excluir Ativo")
        print("0 - Sair")
        print("---------------------------------------------")
        
        opcao = ler_inteiro("Digite o numero da opção desejada: ")

        match opcao:
            case 1:
                cadastrar_ativos()
            case 2:
                print("\n[Módulo de Consulta em construção...]")
            case 3:
                print("\n[Módulo de Listagem em construção...]")
            case 4:
                print("\n[Módulo de Atualização em construção...]")
            case 5:
                print("\n[Módulo de Exclusão em construção...]")
            case 0:
                print("\nEncerrando o sistema. Até logo!")
                break
            case _:
                print("\nErro: Opção inválida. Escolha um número do menu.")


if __name__ == "__main__":
    menu_principal()