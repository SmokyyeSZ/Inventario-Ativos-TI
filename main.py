from interface import (
    cadastrar_ativos,
    consultar_ativo,
    listar_ativos,
    atualizar_ativo,
    excluir_ativo,
    gerenciar_vulnerabilidades, # <-- IMPORT NOVO
    ler_inteiro,
    limpar_tela,
    pausar
)

def menu_principal():
    pausar() 
    while True:
        limpar_tela()
        print("\n--- Sistema de Inventário de Ativos de TI ---")
        print("1 - Cadastrar Ativo")
        print("2 - Consultar Ativo")
        print("3 - Listar Todos os Ativos")
        print("4 - Atualizar Ativo")
        print("5 - Excluir Ativo")
        print("6 - Gerenciar Vulnerabilidades") # <-- OPÇÃO NOVA
        print("0 - Sair")
        print("---------------------------------------------")
        
        opcao = ler_inteiro("\033[36mDigite o numero da opção desejada: \033[0m")
        limpar_tela()

        match opcao:
            case 1:
                cadastrar_ativos()
                pausar()
            case 2:
                consultar_ativo()
                pausar()
            case 3:
                listar_ativos()
                pausar()
            case 4:
                atualizar_ativo()
                pausar()
            case 5:
                excluir_ativo()
                pausar()
            case 6:
                gerenciar_vulnerabilidades() # <-- CHAMA A FUNÇÃO NOVA
                pausar()
            case 0:
                print("\n\033[32mEncerrando o sistema. Até logo!\033[0m")
                break
            case _:
                print("\033[31m[ERRO] Opção inválida. Escolha um número do menu.\033[0m")
                pausar()

if __name__ == "__main__":
    menu_principal()