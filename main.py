"""
========================= Índice =========================

[BLOCO: Imports]

[BLOCO: Enum          ]
    [SEÇÃO: ID        ]
    [SEÇÃO: Severidade]

[BLOCO: Persistencia de dados]
    [SEÇÃO: Variaveis_dados  ]
    [SEÇÃO: Funções_dados    ]
    
[BLOCO: Crud, Validações e Interface]
    [SEÇÃO: Operações CRUD          ]
    [SEÇÃO: DEF_validações          ]
    [SEÇÃO: Interface               ]

[BLOCO: Base de Dados]

[BLOCO: Iniciar]

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
            print("\033[32m[SUCESSO] Dados carregados com sucesso.\033[0m")
            return dados
    except FileNotFoundError:
        print("\033[33m[AVISO] Nenhum arquivo de base encontrado. Iniciando inventário vazio.\033[0m")
        return {}

def salvar_dados(dados):
    #Recebe um parametro e salva ele dentro do nosso "banco de dados" (json)
    try:
        with open(ARQUIVO_DB, 'w', encoding='utf-8') as arquivo:
            json.dump(dados, arquivo, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"\033[31m[ERRO] Erro ao salvar os dados: {e}\033[0m")

#[------------------------ ------------------------]
#|       BLOCO: Crud, Validações e Interface       |
#[------------------------ ------------------------]

#[            SEÇÃO: Operações CRUD                ]

def cadastrar_ativos():
    """
    Coleta dados do usuário, verifica duplicidade de ID e adiciona um novo ativo.
    """
    print("\n--- [ Módulo de cadastro ] ---")

    id_ativo = str(ler_inteiro("\033[36mDigite o ID do ativo (número): \033[0m"))

    if id_ativo in inventario:
        print(f"\n\033[31m[ERRO] Já existe um ativo cadastrado com o ID {id_ativo}\033[0m")
        return

    nome_ativo = input("\033[36mDigite o nome do ativo (ex: Servidor Web, Notebook Dell): \033[0m").strip()
    departamento = input("\033[36mDigite o departamento (ex: RH, TI, Financeiro): \033[0m").strip()

    tipo = ler_enum(TipoAtivo, "\033[36mSelecione o Tipo de Ativo:\033[0m")
    severidade = ler_enum(SeveridadeVulnerabilidade, "\033[36mSelecione a severidade da vulnerabilidade:\033[0m")
    status = ler_enum(StatusTratamento, "\033[36mSelecione o Status do Tratamento:\033[0m")

    inventario[id_ativo] = {
        "nome": nome_ativo,
        "departamento": departamento,
        "tipo": tipo,
        "severidade": severidade,
        "status": status
    }

    salvar_dados(inventario)
    print("\033[32m[SUCESSO] Ativo cadastrado com sucesso!\033[0m")
        

def consultar_ativo():
    """
    Recebe um ID como parametro, busca e mostra o ativo ao qual o ID faz referencia
    """
    if not inventario:
        print("\033[31m[ERRO] O inventario não existe ou não foi carregado corretamente.\033[0m")
        return

    info_id = str(ler_inteiro("\033[36mDigite o ID do ativo (número): \033[0m"))

    if info_id in inventario:
        print(f"\n\033[32m[ENCONTRADO] Informações do ID:\033[0m")
        for chave, valor in inventario[info_id].items():
            print(f"{chave}: {valor}")
        print("")
    else:
        print(f"\033[33m[AVISO] O ID {info_id} não existe em nosso banco de dados.\033[0m")
        return
    

def listar_ativos():
    """
    Devolve ao usuario a lista dos ativos cadastrados em um formato mais resumido pra evitar poluir a tela
    """
    if not inventario:
        print("\033[31m[ERRO] O inventario não existe ou não foi carregado corretamente.\033[0m")
        return

    print("\n--- ATIVOS CADASTRADOS ---")

    for chave, valor in inventario.items():
        print("~" * 50)
        print(f"ID: {chave} | Nome: {valor['nome']} | Departamento: {valor['departamento']} | Tipo: {valor['tipo']}\nSeveridade: {valor['severidade']} | Status: {valor['status']}")
        print("~" * 50)

def atualizar_ativo():
    """
    Acessa um ativo atravez do ID digitado pelo usuario e modifica os valores que o usuario quiser
    """
    if not inventario:
        print("\033[31m[ERRO] O inventario não existe ou está vazio.\033[0m")
        return

    info_id = str(ler_inteiro("\033[36mDigite o ID do ativo para atualizar (número): \033[0m"))

    if info_id in inventario:
        print(f"\n\033[32m[ENCONTRADO] Informações atuais do ID:\033[0m")
        for chave, valor in inventario[info_id].items():
            print(f"{chave}: {valor}")

        print("-" * 50)
        print("Escolha o que deseja modificar:\n 1 - Nome\n 2 - Departamento\n 3 - Tipo\n 4 - Severidade\n 5 - Status")
        print("-" * 50)

        escolha = ler_inteiro("\033[36mDigite o número da opção desejada: \033[0m")

        match escolha:
            case 1:
                n_nome = input("\033[36mDigite o novo nome do ativo: \033[0m").strip()
                if not n_nome:
                    print("\033[33m[AVISO] Input vazio, operação cancelada.\033[0m")
                    return
                inventario[info_id]["nome"] = n_nome
            case 2:
                n_departamento = input("\033[36mDigite o novo departamento: \033[0m").strip()
                if not n_departamento:
                    print("\033[33m[AVISO] Input vazio, operação cancelada.\033[0m")
                    return
                inventario[info_id]["departamento"] = n_departamento
            case 3:
                n_tipo = ler_enum(TipoAtivo, "\033[36mSelecione o novo Tipo de Ativo:\033[0m")
                inventario[info_id]["tipo"] = n_tipo
            case 4:
                n_severidade = ler_enum(SeveridadeVulnerabilidade, "\033[36mSelecione a nova severidade:\033[0m")
                inventario[info_id]["severidade"] = n_severidade
            case 5:
                n_status = ler_enum(StatusTratamento, "\033[36mSelecione o novo status:\033[0m")
                inventario[info_id]["status"] = n_status
            case _:
                print("\033[31m[ERRO] Opção de modificação inválida.\033[0m")
                return

        # Chamada crucial para salvar a alteração no arquivo JSON!
        salvar_dados(inventario)
        print("\033[32m[SUCESSO] Ativo atualizado com sucesso!\033[0m")

    else:
        print(f"\033[33m[AVISO] O ID {info_id} não existe em nosso banco de dados.\033[0m")
        return

#[             SEÇÃO: DEF_validações               ]

def ler_inteiro(mensagem):
    """
    Solicita uma entrada do usuário até que um número inteiro válido seja digitado.
    """
    while True:
        try:
            valor = int(input(mensagem))
            return valor
        except ValueError:
            print("\033[31m[ERRO] Digite apenas números inteiros.\033[0m")

def ler_enum(classe_enum, mensagem):
    """
    Exibe as opções de um Enum dinamicamente e obriga o usuario a escolher um valor válido.
    """
    while True:
        print(f"\n{mensagem}")
        for item in classe_enum:
            print(f"{item.value} - {item.name}")

        escolha = ler_inteiro("\033[36mEscolha o numero da opção: \033[0m")

        try:
            return classe_enum(escolha).name
        except ValueError:
            print("\033[31m[ERRO] Opção inválida. Escolha um dos números da lista.\033[0m")

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
        
        opcao = ler_inteiro("\033[36mDigite o numero da opção desejada: \033[0m")

        match opcao:
            case 1:
                cadastrar_ativos()
            case 2:
                consultar_ativo()
            case 3:
                listar_ativos()
            case 4:
                atualizar_ativo()
            case 5:
                print("\n\033[33m[Módulo de Exclusão em construção...]\033[0m")
            case 0:
                print("\n\033[32mEncerrando o sistema. Até logo!\033[0m")
                break
            case _:
                print("\033[31m[ERRO] Opção inválida. Escolha um número do menu.\033[0m")

#[------------------------ ------------------------]
#|               BLOCO: Base de Dados              |
#[------------------------ ------------------------]

inventario = carregar_dados()

#[------------------------ ------------------------]
#|             BLOCO: Iniciar Programa             |
#[------------------------ ------------------------]

if __name__ == "__main__":
    menu_principal()