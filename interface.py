import os
from modelos import TipoAtivo, SeveridadeVulnerabilidade, StatusTratamento, Ativo
from gerenciador import InventarioManager

# Instância do gerenciador para uso das telas
gerenciador = InventarioManager()

# --- UTILS E VALIDAÇÕES ---

def ler_inteiro(mensagem):
    while True:
        try:
            return int(input(mensagem))
        except ValueError:
            print("\033[31m[ERRO] Digite apenas números inteiros.\033[0m")

def ler_enum(classe_enum, mensagem):
    while True:
        print(f"\n{mensagem}")
        for item in classe_enum:
            print(f"{item.value} - {item.name}")

        escolha = ler_inteiro("\033[36mEscolha o numero da opção: \033[0m")
        try:
            return classe_enum(escolha).name
        except ValueError:
            print("\033[31m[ERRO] Opção inválida. Escolha um dos números da lista.\033[0m")

def limpar_tela():
    os.system('cls' if os.name == 'nt' else 'clear')

def pausar():
    input("\n\033[36mPressione ENTER para continuar...\033[0m")

# --- MÓDULOS CRUD ---

def cadastrar_ativos():
    print("\n--- [ Módulo de Cadastro ] ---")
    id_ativo = str(ler_inteiro("\033[36mDigite o ID do ativo (número): \033[0m"))
    nome_ativo = input("\033[36mDigite o nome do ativo (ex: Servidor Web, Notebook Dell): \033[0m").strip()
    departamento = input("\033[36mDigite o departamento (ex: RH, TI, Financeiro): \033[0m").strip()

    tipo = ler_enum(TipoAtivo, "\033[36mSelecione o Tipo de Ativo:\033[0m")
    severidade = ler_enum(SeveridadeVulnerabilidade, "\033[36mSelecione a severidade da vulnerabilidade:\033[0m")
    status = ler_enum(StatusTratamento, "\033[36mSelecione o Status do Tratamento:\033[0m")

    novo_ativo = Ativo(id_ativo, nome_ativo, departamento, tipo, severidade, status)
    sucesso = gerenciador.adicionar_ativo(novo_ativo)

    if sucesso:
        print("\n\033[32m[SUCESSO] Ativo cadastrado com sucesso!\033[0m")
    else:
        print(f"\n\033[31m[ERRO] Já existe um ativo cadastrado com o ID {id_ativo}\033[0m")

def consultar_ativo():
    if not gerenciador.inventario:
        print("\033[31m[ERRO] O inventario não existe ou não foi carregado corretamente.\033[0m")
        return

    print("\n--- [ Módulo de Consulta ] ---")
    info_id = str(ler_inteiro("\033[36mDigite o ID do ativo (número): \033[0m"))

    if info_id in gerenciador.inventario:
        print(f"\n\033[32m[ENCONTRADO] Informações do ID:\033[0m")
        for chave, valor in gerenciador.inventario[info_id].items():
            print(f"{chave.capitalize()}: {valor}")
        print("")
    else:
        print(f"\n\033[33m[AVISO] O ID {info_id} não existe em nosso banco de dados.\033[0m")

def listar_ativos():
    if not gerenciador.inventario:
        print("\033[31m[ERRO] O inventario não existe ou não foi carregado corretamente.\033[0m")
        return

    print("\n--- [ ATIVOS CADASTRADOS ] ---")
    for chave, valor in gerenciador.inventario.items():
        print("~" * 60)
        print(f"ID: {chave} | Nome: {valor['nome']} | Departamento: {valor['departamento']} | Tipo: {valor['tipo']}\nSeveridade: {valor['severidade']} | Status: {valor['status']}")
    print("~" * 60)

def atualizar_ativo():
    if not gerenciador.inventario:
        print("\033[31m[ERRO] O inventario não existe ou está vazio.\033[0m")
        return
        
    print("\n--- [ Módulo de Atualização ] ---")
    info_id = str(ler_inteiro("\033[36mDigite o ID do ativo para atualizar (número): \033[0m"))

    if info_id in gerenciador.inventario:
        print(f"\n\033[32m[ENCONTRADO] Informações atuais do ID:\033[0m")
        for chave, valor in gerenciador.inventario[info_id].items():
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
                gerenciador.inventario[info_id]["nome"] = n_nome
            case 2:
                n_departamento = input("\033[36mDigite o novo departamento: \033[0m").strip()
                if not n_departamento:
                    print("\033[33m[AVISO] Input vazio, operação cancelada.\033[0m")
                    return
                gerenciador.inventario[info_id]["departamento"] = n_departamento
            case 3:
                n_tipo = ler_enum(TipoAtivo, "\033[36mSelecione o novo Tipo de Ativo:\033[0m")
                gerenciador.inventario[info_id]["tipo"] = n_tipo
            case 4:
                n_severidade = ler_enum(SeveridadeVulnerabilidade, "\033[36mSelecione a nova severidade:\033[0m")
                gerenciador.inventario[info_id]["severidade"] = n_severidade
            case 5:
                n_status = ler_enum(StatusTratamento, "\033[36mSelecione o novo status:\033[0m")
                gerenciador.inventario[info_id]["status"] = n_status
            case _:
                print("\033[31m[ERRO] Opção de modificação inválida.\033[0m")
                return

        gerenciador.salvar_dados()
        print("\n\033[32m[SUCESSO] Ativo atualizado com sucesso!\033[0m")
    else:
        print(f"\n\033[33m[AVISO] O ID {info_id} não existe em nosso banco de dados.\033[0m")

def excluir_ativo():
    if not gerenciador.inventario:
        print("\033[31m[ERRO] O inventario não existe ou está vazio.\033[0m")
        return

    print("\n--- [ Módulo de Exclusão ] ---")
    info_id = str(ler_inteiro("\033[36mDigite o ID do ativo que deseja excluir: \033[0m"))

    if info_id in gerenciador.inventario:
        print(f"\n\033[32m[ENCONTRADO] Informações atuais do ID:\033[0m")
        for chave, valor in gerenciador.inventario[info_id].items():
            print(f"{chave}: {valor}")

        print("\nEscolha:\n 1 - Excluir ativo\n 2 - Voltar\n")
        opcao = ler_inteiro("\033[36mDigite o numero da opção desejada: \033[0m")

        match opcao:
            case 1:
                es = ler_inteiro("\033[33m[AVISO] O ativo será excluído para sempre. Escolha -> 1 - Confirmar Exclusão ou 2 - Cancelar: \033[0m")
                if es == 1:
                    del gerenciador.inventario[info_id]
                    gerenciador.salvar_dados()
                    print("\n\033[32m[SUCESSO] Ativo excluído com sucesso.\033[0m")
                else:
                    print("\n\033[36mOperação cancelada. Voltando ao menu...\033[0m")
            case 2:
                print("\n\033[36mVoltando ao menu inicial...\033[0m")
    else:
        print(f"\n\033[33m[AVISO] O ID {info_id} não existe em nosso banco de dados.\033[0m")