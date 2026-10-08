"""
========================= Índice =========================

[BLOCO: Imports]

[BLOCO: Inventario]

[BLOCO: Utils/validações]

[BLOCO: CRUD]
    [SEÇÃO: Cadastro Ativos]
    [SEÇÃO: Consultar Ativos]
    [SEÇÃO: Listar Ativos]
    [SEÇÃO: Atualizar Ativos]
    [SEÇÃO: Excluir Ativos]

"""

#[------------------------ ------------------------]
#|                 BLOCO: Imports                  |
#[------------------------ ------------------------]
try:
    import msvcrt
    import os
    sistema_windows = True
except ImportError:
    sistema_windows = False
import os
from motor_matematico import fabrica_de_ativos, MotorMatematico
from cve_service import validar_formato_cve, ver_CVE
from modelos import TipoAtivo, SeveridadeVulnerabilidade, StatusTratamento, Equipamentos, Vulnerabilidade, Notebook, BancoDeDados, Roteadores, Servidor 
from gerenciador import InventarioManager
import re

#[------------------------ ------------------------]
#|               BLOCO: Inventario                 |
#[------------------------ ------------------------]

gerenciador = InventarioManager()

#[------------------------ ------------------------]
#|             BLOCO: Utils/Validações             |
#[------------------------ ------------------------]

def validar_id(id_procurado):
    val_id = next((eq for eq in gerenciador.inventario if eq.get('id_ativo') == id_procurado), None)
    if val_id:
        return True

    return False

def ler_inteiro(mensagem):
    while True:
        try:
            return int(input(mensagem))
        except ValueError:
            print("\033[31m[ERRO] Digite apenas números inteiros.\033[0m")

def ler_texto(mensagem):
    while True:
        texto = input(mensagem).strip()
        if texto:
            return texto
        print("\033[31m[ERRO] Este campo não pode ficar vazio. Digite algum valor.\033[0m")

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

def pegar_tecla():
    if sistema_windows:
        return msvcrt.getch()
    else:
        import sys, tty, termios
        fd = sys.stdin.fileno()
        config_antiga = termios.tcgetattr(fd)
        try:
            tty.setraw(sys.stdin.fileno())
            tecla = sys.stdin.read(1)
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, config_antiga)
        return tecla.encode('utf-8')

#[------------------------ ------------------------]
#|                   BLOCO: CRUD                   |
#[------------------------ ------------------------]


#[              SEÇÃO: Cadastro Ativos             ]

def cadastrar_ativos():
    print("\n--- [ Módulo de Cadastro ] ---")
    id_ativo = str(ler_inteiro("\033[36mDigite o ID do ativo (número): \033[0m"))
    
    if validar_id(id_ativo):
        print(f"\n\033[31m[ERRO] Já existe um ativo cadastrado com o ID {id_ativo}\033[0m")
        return

    nome_ativo = ler_texto("\033[36mDigite o nome ou hostname do ativo: \033[0m")
    responsavel = ler_texto("\033[36mDigite o nome do responsável: \033[0m")
    departamento = ler_texto("\033[36mDigite o departamento/setor: \033[0m")
    tipo = ler_enum(TipoAtivo, "\033[36mSelecione o Tipo de Ativo:\033[0m")

    novo_ativo = fabrica_de_ativos[tipo](id_ativo, nome_ativo, responsavel, departamento)
    
    print("\nDeseja registrar uma vulnerabilidade inicial para este ativo?")
    print("1 - Sim\n2 - Não")
    op = ler_inteiro("\033[36mEscolha: \033[0m")
    
    if op == 1:
        vuln = criar_vuln_para_ativo()
        novo_ativo.adicionar_vulnerabilidade(vuln)
    gerenciador.adicionar_ativo(novo_ativo)
    gerenciador.salvar_dados()
    print("\n\033[32m[SUCESSO] Ativo cadastrado com sucesso!\033[0m")

#[              SEÇÃO: Consultar Ativos            ]

def consultar_ativo():
    if not gerenciador.inventario:
        print("\033[31m[ERRO] O inventário está vazio.\033[0m")
        return

    print("\n--- [ Módulo de Consulta ] ---")
    termo = ler_texto("\033[36mDigite o ID ou Nome/Hostname do ativo: \033[0m").lower()

    encontrado = False
    for ativo_dict in gerenciador.inventario:
        if ativo_dict['id_ativo'] == termo or ativo_dict['nome'].lower() == termo:
            print(f"\n\033[32m[ENCONTRADO] ID: {ativo_dict['id_ativo']}\033[0m")
            print(f"Nome: {ativo_dict['nome']}")
            print(f"Responsável: {ativo_dict.get('responsavel', 'Não informado')}")
            print(f"Departamento: {ativo_dict['departamento']}")
            print(f"Tipo: {ativo_dict['tipo']}")
            print(f"Total de Vulnerabilidades: {len(ativo_dict['vulnerabilidades'])}")
            encontrado = True
            break
            
    if not encontrado:
        print(f"\n\033[33m[AVISO] Nenhum ativo encontrado com ID ou Nome '{termo}'.\033[0m")

#[              SEÇÃO: Listar Ativos               ]

def listar_ativos():
    atualizar_riscos_rede()

    if not gerenciador.inventario:
        print("\033[31m[ERRO] O inventário está vazio.\033[0m")
        return

    print("\n--- [ ATIVOS CADASTRADOS ] ---")
    for ativo_dict in gerenciador.inventario:
        print("~" * 60)
        print(f"id_ativo: {ativo_dict['id_ativo']:<5} | Nome: {ativo_dict['nome']:<15} | Tipo: {ativo_dict['tipo']:<15} | Vulns: {len(ativo_dict['vulnerabilidades']):<5} | Risco final: {ativo_dict['risco_final']} | Risco proprio: {ativo_dict['risco_proprio']}")
    print("~" * 60)

#[              SEÇÃO: Atualizar Ativos            ]

def atualizar_ativo():
    if not gerenciador.inventario:
        print("\033[31m[ERRO] O inventário está vazio.\033[0m")
        return
        
    print("\n--- [ Módulo de Atualização ] ---")
    info_id = str(ler_inteiro("\033[36mDigite o ID do ativo para atualizar: \033[0m"))
    ativo = gerenciador.buscar_ativo_por_id(info_id)
    if ativo:
        print("-" * 50)
        print("Escolha o que deseja modificar:\n 1 - Nome\n 2 - Responsável\n 3 - Departamento\n 4 - Tipo\n 5 - Voltar")
        print("-" * 50)
        escolha = ler_inteiro("\033[36mDigite a opção: \033[0m")

        match escolha:
            case 1:
                n_nome = input("\033[36mNovo nome (ou aperte ENTER para cancelar): \033[0m").strip()
                if n_nome: ativo['nome'] = n_nome
            case 2: # <-- BLOCO NOVO
                n_resp = input("\033[36mNovo responsável (ou aperte ENTER para cancelar): \033[0m").strip()
                if n_resp: ativo["responsavel"] = n_resp
            case 3: # (O antigo case 2 virou 3)
                n_dep = input("\033[36mNovo departamento (ou aperte ENTER para cancelar): \033[0m").strip()
                if n_dep: ativo["departamento"] = n_dep
            case 4: # (O antigo case 3 virou 4)
                n_tipo = ler_enum(TipoAtivo, "\033[36mNovo Tipo:\033[0m")
                ativo["tipo"] = n_tipo
            case 5:
                print("Voltando ao menu inicial...")
                return
            case _:
                print("\033[31m[ERRO] Opção inválida.\033[0m")
                return

        gerenciador.salvar_dados()
        print("\n\033[32m[SUCESSO] Ativo atualizado com sucesso!\033[0m")
    else:
        print(f"\n\033[33m[AVISO] ID {info_id} não existe.\033[0m")

#[              SEÇÃO: Excluir Ativos              ]

def excluir_ativo():
    if not gerenciador.inventario:
        print("\033[31m[ERRO] O inventário está vazio.\033[0m")
        return

    info_id = str(ler_inteiro("\033[36mDigite o ID do ativo que deseja excluir: \033[0m"))
    ativo = gerenciador.buscar_ativo_por_id(info_id)
    if ativo:
        es = ler_inteiro("\033[33m[AVISO] O ativo e suas vulnerabilidades serão excluídos. 1 - Confirmar ou 2 - Cancelar: \033[0m")
        if es == 1:
            gerenciador.inventario[info_id].remove(ativo)
            gerenciador.salvar_dados()
            print("\n\033[32m[SUCESSO] Ativo excluído com sucesso.\033[0m")
        else:
            print("\n\033[36mOperação cancelada.\033[0m")
    else:
        print(f"\n\033[33m[AVISO] ID {info_id} não existe.\033[0m")

#[------------------------ ------------------------]
#|             BLOCO: Vulnerabilidad               |
#[------------------------ ------------------------]

def gerenciar_vulnerabilidades():
    if not gerenciador.inventario:
        print("\033[31m[ERRO] O inventário está vazio. Cadastre um ativo primeiro.\033[0m")
        return

    print("\n--- [ Gestão de Vulnerabilidades ] ---")
    info_id = str(ler_inteiro("\033[36mDigite o ID do ativo para gerenciar vulnerabilidades: \033[0m"))
    ativo = gerenciador.buscar_ativo_por_id(info_id)
    if not ativo:
        print(f"\n\033[33m[AVISO] ID {info_id} não existe.\033[0m")
        return
    
    print(f"\nAtivo Selecionado: {ativo['nome']}")
    print("1 - Cadastrar nova vulnerabilidade")
    print("2 - Visualizar vulnerabilidades")
    print("3 - Excluir vulnerabilidade")
    print("4 - Voltar ao Menu inicial")
    opcao = ler_inteiro("\033[36mEscolha a opção: \033[0m")

    match opcao:
        case 1:
            vuln = criar_vuln_para_ativo()
            ativo["vulnerabilidades"].append(vuln.to_dict())
            gerenciador.salvar_dados()
        case 2:
            if not ativo["vulnerabilidades"]:
                print("\n\033[33m[AVISO] O ativo está sem vulnerabilidades registradas.\033[0m")
            else:
                print(f"\n--- Vulnerabilidades de {ativo['nome']} ---")
                for i, vuln in enumerate(ativo["vulnerabilidades"], 1):
                    print(f"[{i}] Descrição: {vuln['descricao']}\n\nCategoria: {vuln['categoria']}")
                    print(f"Severidade: {vuln['severidade']}\nStatus: {vuln['status']}")
                    print("-" * 40)

        case 3:
            if not ativo["vulnerabilidades"]:
                print("\n\033[33m[AVISO] O ativo está sem vulnerabilidades registradas.\033[0m")
            else:
                print(f"\n--- Vulnerabilidades de {ativo['nome']} ---")
                for i, vuln in enumerate(ativo["vulnerabilidades"], 1):
                    print(f"[{i}] Descrição: {vuln['descricao']} | Categoria: {vuln['categoria']}")
                    print(f"    Severidade: {vuln['severidade']} | Status: {vuln['status']}")
                    print("-" * 40)

                while True:
                    escolha = ler_inteiro("Informe o numero da vulnerabilidade que deseja excluir ou 0 caso queira sair: ")

                    if 1 <= escolha <= len(ativo["vulnerabilidades"]):
                        ativo["vulnerabilidades"].pop(escolha -1)
                        print("\n\033[32m[SUCESSO] Vulnerabilidade excluida com sucesso!\033[0m")
                        gerenciador.salvar_dados()
                        break

                    elif escolha == 0:
                        print("Voltando ao menu...")
                        break

                    else:
                        print("\033[31m[ERRO] Valor invalido!\033[0m")

        case 4:
            print("Voltando ao Menu inicial...")
            return
        case _: 
            print("\033[31m[ERRO] Opção inválida.\033[0m")

def criar_vuln_para_ativo():
        dados_api = ver_CVE()
        if dados_api:
            desc = dados_api["vulnerabilities"][0]["cve"]["descriptions"][0]["value"]
            cat = ler_texto("\033[36mCategoria (ex: Falha de Configuração): \033[0m")
            try:
                sev_api = dados_api["vulnerabilities"][0]["cve"]["metrics"]["cvssMetricV31"][0]["cvssData"]["baseSeverity"]
                score_api = dados_api["vulnerabilities"][0]["cve"]["metrics"]["cvssMetricV31"][0]["cvssData"]["baseScore"]
            except (KeyError, IndexError):
                sev_api = "DESCONHECIDO"
                score_api = 0.0
            stat = ler_enum(StatusTratamento, "\033[36mStatus de Tratamento:\033[0m")
            match sev_api:
                case "LOW":
                    sev = SeveridadeVulnerabilidade.BAIXA.name
                case "MEDIUM":
                    sev = SeveridadeVulnerabilidade.MEDIA.name
                case "HIGH":
                    sev = SeveridadeVulnerabilidade.ALTA.name
                case "CRITICAL":
                    sev = SeveridadeVulnerabilidade.CRITICA.name
                case _:
                    print("\n\033[33m[AVISO] Não foi possível localizar a severidade da vulnerabilidade. Por favor, informe manualmente:\033[0m")
                    sev = ler_enum(SeveridadeVulnerabilidade, "\033[36mSeveridade:\033[0m")

            nova_vuln = Vulnerabilidade(desc, cat, sev, stat, score_api)
            print("\n\033[32m[SUCESSO] Vulnerabilidade cadastrada com sucesso!\033[0m")
            return nova_vuln

        else:
            desc = ler_texto("\033[36mDescrição da vulnerabilidade: \033[0m")
            cat = ler_texto("\033[36mCategoria (ex: Falha de Configuração): \033[0m")
            sev = ler_enum(SeveridadeVulnerabilidade, "\033[36mSeveridade:\033[0m")
            stat = ler_enum(StatusTratamento, "\033[36mStatus de Tratamento:\033[0m")
            score_api = 0.0

            nova_vuln = Vulnerabilidade(desc, cat, sev, stat, score_api)
            print("\n\033[32m[SUCESSO] Vulnerabilidade cadastrada com sucesso!\033[0m")
            return nova_vuln

def atualizar_riscos_rede():
    mm = MotorMatematico()
    solve = mm.calcular_risco_final()
    if solve is not None:
        for indice, ativo in enumerate(gerenciador.inventario):
            ativo['risco_final'] = round(float(solve[indice]), 2)
            ativo['risco_proprio'] = round(float(mm.montar_formula(ativo['id_ativo'])), 2)
        gerenciador.salvar_dados()
    else:
        return None
