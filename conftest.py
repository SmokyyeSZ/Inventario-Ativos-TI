"""
Configuração e Relatório Amigável do Pytest — JESTER RISK
Compatível com Windows e Linux, exibindo em linguagem clara e direta
o que cada teste valida sem alterar o banco de dados real (db.sqlite3).
"""

import os
import sys
import time
import platform

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def _ativar_ansi_nativo_windows():
    if os.name != "nt":
        return
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        for handle_id in (-11, -12):
            handle = kernel32.GetStdHandle(handle_id)
            mode = ctypes.c_ulong()
            if kernel32.GetConsoleMode(handle, ctypes.byref(mode)):
                kernel32.SetConsoleMode(handle, mode.value | 0x0004)
    except Exception:
        os.system("")


_ativar_ansi_nativo_windows()

C_RESET = "\033[0m"
C_BOLD = "\033[1m"
C_DIM = "\033[2m"
C_CYAN = "\033[96m"
C_GREEN = "\033[92m"
C_YELLOW = "\033[93m"
C_RED = "\033[91m"
C_WHITE = "\033[97m"


DESCRICAO_TESTES = {
    # MÓDULO 1: POO, Herança e Factory
    "test_01_polimorfismo_fatores_exposicao": (
        "MÓDULO 1 :: POO, Herança Multi-Tabela e Polimorfismo",
        "Polimorfismo nos Tipos de Equipamentos (fator_exposicao)",
        "Verifica se cada subclasse (Servidor, Database, CloudEndpoint = 1.5x; Gateway = 1.0x; Firewall, Workstation = 0.5x) aplica seu multiplicador de risco próprio.",
    ),
    "test_02_factory_equipamento_mapeamento_dinamico": (
        "MÓDULO 1 :: POO, Herança Multi-Tabela e Polimorfismo",
        "Padrão Factory (Factory_equipamento)",
        "Garante que a fábrica instancia automaticamente a subclasse correta a partir do JSON enviado pelo React e limpa campos Many-to-Many.",
    ),
    "test_03_unicidade_conexao_rede": (
        "MÓDULO 1 :: POO, Herança Multi-Tabela e Polimorfismo",
        "Integridade do Grafo (unique_together em ConexaoRede)",
        "Impede a criação de conexões duplicadas entre o mesmo par (origem, destino) no banco de dados.",
    ),
    # MÓDULO 2: Motor Matemático (NumPy)
    "test_04_motor_rede_vazia": (
        "MÓDULO 2 :: Motor Matemático de Propagação Espectral (NumPy)",
        "Segurança em Rede Vazia (0 Ativos)",
        "Confirma que calcular_risco_rede() retorna None sem erros quando não existem equipamentos cadastrados.",
    ),
    "test_05_calculo_risco_proprio_ponderado_por_exposicao": (
        "MÓDULO 2 :: Motor Matemático de Propagação Espectral (NumPy)",
        "Cálculo do Risco Intrínseco (b = Σ CVSS × Exposição)",
        "Comprova que a mesma CVE gera risco próprio de 12.0 em um Servidor (1.5x) e 4.0 em um Firewall (0.5x).",
    ),
    "test_06_vulnerabilidade_corrigida_ignorada_no_calculo": (
        "MÓDULO 2 :: Motor Matemático de Propagação Espectral (NumPy)",
        "Ignorar Vulnerabilidades com Status 'Corrigido'",
        "Verifica que falhas já corrigidas permanecem no histórico do ativo, mas não entram no cálculo de risco atual.",
    ),
    "test_07_propagacao_direcional_outbound_inbound_bidirecional": (
        "MÓDULO 2 :: Motor Matemático de Propagação Espectral (NumPy)",
        "Resolução Exata do Sistema Linear (I - A)·x = b",
        "Valida a propagação lateral de risco via np.linalg.solve para conexões Outbound, Inbound e Bidirecional.",
    ),
    "test_08_isolamento_firewall_conexao_bloqueada": (
        "MÓDULO 2 :: Motor Matemático de Propagação Espectral (NumPy)",
        "Contenção de Incidente (Status 'Bloqueada')",
        "Garante que conexões marcadas como 'Bloqueada' têm peso zerado na matriz A, interrompendo o contágio lateral.",
    ),
    "test_09_deteccao_matriz_singular_nao_invertivel": (
        "MÓDULO 2 :: Motor Matemático de Propagação Espectral (NumPy)",
        "Detecção de Matriz Singular (det(I - A) = 0)",
        "Comprova que o motor detecta determinantes iguais a zero e retorna None antes de causar erro numérico.",
    ),
    # MÓDULO 3: Comunicação Django REST <-> React (Conexões)
    "test_10_api_adicionar_conexao_valida_201_created": (
        "MÓDULO 3 :: Comunicação Django REST ↔ React & Transações",
        "Adicionar Conexão Válida (POST 201 Created + CamelCase)",
        "Simula o React enviando uma conexão válida em camelCase e verifica o retorno 201 e o recálculo da rede.",
    ),
    "test_11_api_adicionar_conexao_matriz_nao_invertivel_400_e_rollback": (
        "MÓDULO 3 :: Comunicação Django REST ↔ React & Transações",
        "Bloquear Nova Conexão com Matriz Não Invertível (POST 400 + Rollback)",
        "Garante que quando calcular_risco_rede() retorna None, a API barra o 201, devolve {'erro': 'Matriz de dependências não invertível'} com status 400 e desfaz a gravação no SQLite.",
    ),
    "test_12_api_patch_conexao_matriz_nao_invertivel_400_e_rollback": (
        "MÓDULO 3 :: Comunicação Django REST ↔ React & Transações",
        "Bloquear Edição de Conexão para Peso Inválido (PATCH 400 + Rollback)",
        "Garante que editar uma conexão existente para um peso que torne a matriz singular também retorna 400 e preserva o peso antigo.",
    ),
    "test_13_api_deletar_conexao_recalcula_malha": (
        "MÓDULO 3 :: Comunicação Django REST ↔ React & Transações",
        "Remover Conexão (DELETE 204) e Recalcular Risco",
        "Verifica que excluir uma conexão remove a aresta do banco e reduz imediatamente o risco propagado nos ativos vizinhos.",
    ),
    "test_14_serializacao_bidirecional_camel_case_para_react": (
        "MÓDULO 3 :: Comunicação Django REST ↔ React & Transações",
        "Espelhamento Outbound ↔ Inbound no Serializer",
        "Confirma que uma conexão Outbound criada em A aparece automaticamente como Inbound ao consultar o ativo B.",
    ),
    # MÓDULO 4: CRUD Completo de Ativos (Criar, Listar, Atualizar, Deletar)
    "test_15_crud_criar_ativos_todos_os_tipos": (
        "MÓDULO 4 :: Ciclo de Vida de Ativos (Criar, Atualizar e Deletar)",
        "Criar Ativos via API (POST /api/equipamentos/)",
        "Testa a criação de ativos pela API validando persistência de IP, MAC, SO, departamento, fator de exposição e vínculo automático ao usuário logado.",
    ),
    "test_16_crud_atualizar_ativo_e_recalculo_automatico": (
        "MÓDULO 4 :: Ciclo de Vida de Ativos (Criar, Atualizar e Deletar)",
        "Atualizar Ativo via API (PATCH /api/equipamentos/<id>/)",
        "Atualiza nome, IP, SO e muda o tipo de Workstation (0.5x) para Servidor (1.5x), comprovando que o risco final triplica automaticamente.",
    ),
    "test_17_crud_deletar_ativo_e_limpeza_em_cascata": (
        "MÓDULO 4 :: Ciclo de Vida de Ativos (Criar, Atualizar e Deletar)",
        "Deletar Ativo via API (DELETE /api/equipamentos/<id>/)",
        "Remove um ativo infectado da rede e comprova que suas conexões são apagadas em cascata e o risco dos vizinhos é recalculado para zero.",
    ),
    # MÓDULO 5: Usuários, Autenticação JWT e Permissões
    "test_18_bloqueio_acesso_anonimo_sem_jwt": (
        "MÓDULO 5 :: Usuários, Autenticação JWT e Hierarquia de Permissões",
        "Bloqueio de Requisições Anônimas (401 Unauthorized)",
        "Verifica que chamadas sem token JWT são recusadas em todos os endpoints protegidos.",
    ),
    "test_19_fluxo_completo_login_falha_e_refresh_jwt": (
        "MÓDULO 5 :: Usuários, Autenticação JWT e Hierarquia de Permissões",
        "Login JWT Válido (200), Senha Incorreta (401) e Refresh Token",
        "Testa login com credenciais corretas, rejeição de senha incorreta e renovação de sessão via /api/token/refresh/.",
    ),
    "test_20_atribuicao_responsavel_por_username_id_e_invalido": (
        "MÓDULO 5 :: Usuários, Autenticação JWT e Hierarquia de Permissões",
        "Campo ResponsavelField (Busca por Username, ID e Erro para Inexistente)",
        "Valida que o serializer aceita vincular ativos pelo nome de usuário, pelo ID numérico ou retorna erro 400 se o usuário não existir.",
    ),
    "test_21_isolamento_de_ativos_entre_analistas_comuns": (
        "MÓDULO 5 :: Usuários, Autenticação JWT e Hierarquia de Permissões",
        "Isolamento entre Usuários Comuns (Multi-Tenancy)",
        "Comprova que um analista comum não consegue listar, visualizar, editar, deletar nem criar conexões nos ativos de outro analista.",
    ),
    "test_22_visao_global_superusuario_soc_admin": (
        "MÓDULO 5 :: Usuários, Autenticação JWT e Hierarquia de Permissões",
        "Permissão Global do Superusuário (Conta Admin / Professor Igor)",
        "Garante que contas com is_superuser=True visualizam e gerenciam os ativos de todos os usuários do sistema.",
    ),
    # MÓDULO 6: CVEs (NIST NVD v2.0 & Fallback) + Dashboard & Ping
    "test_23_enriquecimento_cve_nist_nvd_online_mockado": (
        "MÓDULO 6 :: NIST NVD v2.0, Dashboard Espectral e Diagnóstico",
        "Consulta Automática NIST NVD v2.0 (CVSS v3.1)",
        "Simula o retorno oficial da API do NIST (ex.: Log4Shell nota 10.0), salva a CVE no banco e recalcula o risco do ativo.",
    ),
    "test_24_resiliencia_fallback_manual_quando_nist_offline": (
        "MÓDULO 6 :: NIST NVD v2.0, Dashboard Espectral e Diagnóstico",
        "Fallback Manual quando a API do NIST está Offline",
        "Simula queda de internet na consulta ao NIST e comprova que o cadastro usa os dados enviados pelo formulário sem falhar.",
    ),
    "test_25_remocao_cve_e_descontaminacao_de_risco": (
        "MÓDULO 6 :: NIST NVD v2.0, Dashboard Espectral e Diagnóstico",
        "Desvincular CVE de um Ativo (DELETE)",
        "Remove uma vulnerabilidade vinculada e verifica que o risco do equipamento cai imediatamente.",
    ),
    "test_26_dashboard_metricas_espectrais_lambda_max_e_densidade": (
        "MÓDULO 6 :: NIST NVD v2.0, Dashboard Espectral e Diagnóstico",
        "Métricas Espectrais do Dashboard (λmax, Densidade e Heatmap)",
        "Valida os cálculos de autovalor dominante (λmax), densidade da matriz A e mapa de calor em /api/metrics/.",
    ),
    "test_27_dashboard_rede_vazia_e_diagnostico_ping": (
        "MÓDULO 6 :: NIST NVD v2.0, Dashboard Espectral e Diagnóstico",
        "Dashboard com 0 Ativos e Diagnóstico de Ping/Portas",
        "Verifica o estado inicial zerado do Dashboard e a descoberta de portas abertas no endpoint /ping/.",
    ),
    # MÓDULO 7: Infraestrutura Docker & Deploy
    "test_28_docker_arquivos_e_configuracao_containers": (
        "MÓDULO 7 :: Validação da Infraestrutura Docker & Deploy",
        "Auditoria do Dockerfile (Backend/Frontend) e docker-compose.yml",
        "Verifica a existência e integridade dos Dockerfiles, exposição da porta 2215, Gunicorn e build multi-stage Node -> Nginx.",
    ),
    "test_29_docker_entrypoint_seed_professor_igor_e_nginx_proxy": (
        "MÓDULO 7 :: Validação da Infraestrutura Docker & Deploy",
        "Validação do entrypoint.sh (Superusuário 'igor') e Reverse Proxy Nginx",
        "Confirma que o entrypoint.sh aplica migrações, cria o superusuário 'igor' automaticamente e que o nginx.conf redireciona /api/ para http://backend:2215.",
    ),
    "test_30_docker_execucao_seed_entrypoint_idempotente": (
        "MÓDULO 7 :: Validação da Infraestrutura Docker & Deploy",
        "Execução Real e Idempotente do Script de Seed do entrypoint.sh",
        "Extrai e executa o código Python do entrypoint.sh duas vezes seguidas, provando que o superusuário 'igor' é criado no primeiro boot do container e não gera erro de duplicidade nos reinícios seguintes.",
    ),
}


_ultimo_modulo = None
_resultados = []
_inicio = 0.0


def pytest_configure(config):
    from django.conf import settings
    if settings.configured:
        settings.PASSWORD_HASHERS = [
            "django.contrib.auth.hashers.MD5PasswordHasher",
        ]


def pytest_report_teststatus(report, config):
    if report.when == "call":
        return report.outcome, "", ""
    return None


def pytest_sessionstart(session):
    global _inicio, _ultimo_modulo, _resultados
    _inicio = time.time()
    _ultimo_modulo = None
    _resultados = []

    so_atual = f"{platform.system()} {platform.release()} ({platform.machine()})"
    py_ver = platform.python_version()

    print(f"\n  {C_CYAN}{C_BOLD}=============================================================================={C_RESET}")
    print(f"  {C_WHITE}{C_BOLD}🛡️  JESTER RISK — SUÍTE DE AUDITORIA AUTOMATIZADA (PYTEST){C_RESET}")
    print(f"  {C_CYAN}{C_BOLD}=============================================================================={C_RESET}")
    print(f"  {C_CYAN}Ambiente :{C_RESET} {C_WHITE}{so_atual} | Python {py_ver}{C_RESET}")
    print(f"  {C_CYAN}Banco SQL:{C_RESET} {C_WHITE}SQLite Efêmero em Memória (seu db.sqlite3 real permanece intacto){C_RESET}")
    print(f"  {C_DIM}------------------------------------------------------------------------------{C_RESET}")


def pytest_runtest_logreport(report):
    global _ultimo_modulo
    if report.when != "call":
        return

    nome_teste = report.nodeid.split("::")[-1]
    info = DESCRICAO_TESTES.get(nome_teste)
    _resultados.append((nome_teste, report.outcome, report.duration))

    if info:
        modulo, titulo, explicacao = info
        if modulo != _ultimo_modulo:
            _ultimo_modulo = modulo
            print(f"\n  {C_YELLOW}{C_BOLD}[ {modulo} ]{C_RESET}")
            print(f"  {C_DIM}{'─' * 78}{C_RESET}")

        badge = (
            f"{C_GREEN}{C_BOLD}[ PASSOU ({report.duration * 1000:.0f}ms) ]{C_RESET}"
            if report.outcome == "passed"
            else f"{C_RED}{C_BOLD}[ FALHOU ]{C_RESET}"
        )
        print(f"  {badge} {C_WHITE}{C_BOLD}{titulo}{C_RESET}")
        print(f"     {C_DIM}↳ O que faz:{C_RESET} {C_WHITE}{explicacao}{C_RESET}")
    else:
        badge = f"{C_GREEN}[ PASSOU ]{C_RESET}" if report.outcome == "passed" else f"{C_RED}[ FALHOU ]{C_RESET}"
        print(f"  {badge} {nome_teste}")


def pytest_terminal_summary(terminalreporter, exitstatus, config):
    duracao = time.time() - _inicio
    total = len(_resultados)
    passaram = sum(1 for _, outcome, _ in _resultados if outcome == "passed")
    falharam = total - passaram

    print(f"\n  {C_CYAN}{C_BOLD}=============================================================================={C_RESET}")
    if falharam == 0 and total > 0:
        print(
            f"  {C_GREEN}{C_BOLD}✔ RESULTADO FINAL: {passaram}/{total} TESTES APROVADOS COM SUCESSO "
            f"({duracao:.2f}s){C_RESET}"
        )
    else:
        print(
            f"  {C_RED}{C_BOLD}✖ RESULTADO FINAL: {passaram}/{total} passaram, {falharam} falharam "
            f"({duracao:.2f}s){C_RESET}"
        )
    print(f"  {C_CYAN}{C_BOLD}=============================================================================={C_RESET}\n")
