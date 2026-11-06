"""
Suíte Completa de Testes Automatizados — JESTER RISK (30 Testes em 7 Módulos)
Compatível com Pytest (pytest-django) e Django Test Runner (manage.py test)
em Windows e Linux.
"""

import shutil
import subprocess
from pathlib import Path
from unittest.mock import patch, MagicMock

import numpy as np
from django.conf import settings
from django.test import TestCase, override_settings
from django.db import IntegrityError, transaction
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from .models import (
    Equipamento,
    Servidor,
    Firewall,
    Database,
    Gateway,
    Workstation,
    CloudEndpoint,
    Factory_equipamento,
    Vulnerabilidade,
    ConexaoRede,
)
from .motor_matematico import MotorMatematico
from .serializers import EquipamentoSerializers


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class JesterRiskFullTestSuite(TestCase):
    """
    Suíte end-to-end cobrindo:
    1. POO, Herança Multi-Tabela e Factory Pattern
    2. Motor Matemático Espectral (NumPy)
    3. Comunicação Django REST <-> React e Rollback Transacional
    4. Ciclo Completo CRUD de Ativos (Criar, Atualizar e Deletar)
    5. Usuários, Autenticação JWT, ResponsavelField e Hierarquia de Contas
    6. NIST NVD API v2.0, Fallback Offline, Dashboard Espectral e Ping
    7. Infraestrutura Docker (Dockerfile, docker-compose.yml, entrypoint.sh e Nginx)
    """

    @classmethod
    def setUpTestData(cls):
        cls.user_analista = User.objects.create_user(
            username="analista_soc", password="StrongPassword123!"
        )
        cls.user_outro = User.objects.create_user(
            username="analista_externo", password="StrongPassword123!"
        )
        cls.user_admin = User.objects.create_superuser(
            username="igor",
            email="igor@faculdade.edu.br",
            password="senha123",
        )

    def setUp(self):
        self.client = APIClient()

    # =========================================================================
    # MÓDULO 1: POO, Herança Multi-Tabela e Polimorfismo
    # =========================================================================

    def test_01_polimorfismo_fatores_exposicao(self):
        """Verifica que cada subclasse retorna seu fator_exposicao() polimórfico."""
        srv = Servidor.objects.create(nome="SRV-01", departamento="Core", tipo="Servidor")
        db = Database.objects.create(nome="DB-01", departamento="Dados", tipo="Database")
        cloud = CloudEndpoint.objects.create(nome="AWS-01", departamento="Cloud", tipo="CloudEndpoint")
        gw = Gateway.objects.create(nome="GW-01", departamento="Rede", tipo="Gateway")
        fw = Firewall.objects.create(nome="FW-01", departamento="Sec", tipo="Firewall")
        ws = Workstation.objects.create(nome="WS-01", departamento="RH", tipo="Workstation")
        generico = Equipamento.objects.create(nome="GEN-01", departamento="TI", tipo="Equipamento")

        self.assertEqual(srv.fator_exposicao(), 1.5)
        self.assertEqual(db.fator_exposicao(), 1.5)
        self.assertEqual(cloud.fator_exposicao(), 1.5)
        self.assertEqual(gw.fator_exposicao(), 1.0)
        self.assertEqual(generico.fator_exposicao(), 1.0)
        self.assertEqual(fw.fator_exposicao(), 0.5)
        self.assertEqual(ws.fator_exposicao(), 0.5)

    def test_02_factory_equipamento_mapeamento_dinamico(self):
        """Testa a Factory_equipamento com nomes em PT/EN e limpeza de campos M2M."""
        inst_srv = Factory_equipamento({
            "nome": "App-Server",
            "departamento": "Engenharia",
            "tipo": "Internal Server",
            "vulnerabilidades": ["lixo_m2m"],
            "conexoes": ["lixo_m2m"],
        })
        inst_cloud = Factory_equipamento({
            "nome": "Edge-API",
            "departamento": "Cloud",
            "tipo": "Cloud Endpoint",
        })
        inst_fw = Factory_equipamento({
            "nome": "Perimeter-FW",
            "departamento": "SecOps",
            "tipo": "Firewall",
        })
        inst_fallback = Factory_equipamento({
            "nome": "IoT-Sensor",
            "departamento": "Lab",
            "tipo": "TipoDesconhecido",
        })

        self.assertIsInstance(inst_srv, Servidor)
        self.assertEqual(inst_srv.fator_exposicao(), 1.5)
        self.assertIsInstance(inst_cloud, CloudEndpoint)
        self.assertEqual(inst_cloud.fator_exposicao(), 1.5)
        self.assertIsInstance(inst_fw, Firewall)
        self.assertEqual(inst_fw.fator_exposicao(), 0.5)
        self.assertIsInstance(inst_fallback, Equipamento)
        self.assertEqual(inst_fallback.fator_exposicao(), 1.0)

    def test_03_unicidade_conexao_rede(self):
        """Garante que unique_together=('origem', 'destino') bloqueia arestas duplicadas."""
        a = Equipamento.objects.create(nome="Node-A", departamento="TI", tipo="Servidor")
        b = Equipamento.objects.create(nome="Node-B", departamento="TI", tipo="Database")
        ConexaoRede.objects.create(origem=a, destino=b, peso_propagacao=0.2)

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                ConexaoRede.objects.create(origem=a, destino=b, peso_propagacao=0.5)

    # =========================================================================
    # MÓDULO 2: Motor Matemático de Propagação Espectral (NumPy)
    # =========================================================================

    def test_04_motor_rede_vazia(self):
        """Garante que calcular_risco_rede() retorna None quando não há ativos."""
        Equipamento.objects.all().delete()
        resultado = MotorMatematico().calcular_risco_rede()
        self.assertIsNone(resultado)

    def test_05_calculo_risco_proprio_ponderado_por_exposicao(self):
        """Verifica b_i = (soma CVSS ativas) * fator_exposicao(tipo)."""
        cve = Vulnerabilidade.objects.create(
            cve_code="CVE-2025-1001",
            descricao="RCE Crítico",
            categoria="Cibersegurança",
            severidade="High",
            status="Ativa",
            score=8.0,
        )
        srv = Servidor.objects.create(nome="SRV-Crit", departamento="TI", tipo="Servidor")
        fw = Firewall.objects.create(nome="FW-Hard", departamento="TI", tipo="Firewall")
        srv.vulnerabilidades.add(cve)
        fw.vulnerabilidades.add(cve)

        self.assertTrue(MotorMatematico().calcular_risco_rede())
        srv.refresh_from_db()
        fw.refresh_from_db()

        self.assertAlmostEqual(srv.risco_proprio, 12.0, places=2)
        self.assertAlmostEqual(srv.risco_final, 12.0, places=2)
        self.assertAlmostEqual(fw.risco_proprio, 4.0, places=2)
        self.assertAlmostEqual(fw.risco_final, 4.0, places=2)

    def test_06_vulnerabilidade_corrigida_ignorada_no_calculo(self):
        """Verifica que vulnerabilidades com status='Corrigido' não inflam o risco."""
        cve_ativa = Vulnerabilidade.objects.create(
            cve_code="CVE-2025-2001",
            descricao="Ativa",
            categoria="Sec",
            severidade="High",
            status="Ativa",
            score=6.0,
        )
        cve_corrigida = Vulnerabilidade.objects.create(
            cve_code="CVE-2025-2002",
            descricao="Mitigada",
            categoria="Sec",
            severidade="Critical",
            status="Corrigido",
            score=10.0,
        )
        gw = Gateway.objects.create(nome="GW-Edge", departamento="Rede", tipo="Gateway")
        gw.vulnerabilidades.add(cve_ativa, cve_corrigida)

        MotorMatematico().calcular_risco_rede()
        gw.refresh_from_db()

        self.assertAlmostEqual(gw.risco_proprio, 6.0, places=2)
        self.assertAlmostEqual(gw.risco_final, 6.0, places=2)

    def test_07_propagacao_direcional_outbound_inbound_bidirecional(self):
        """Compara a solução de (I - A)x = b com o valor analítico exato."""
        n1 = Gateway.objects.create(nome="N1", departamento="TI", tipo="Gateway")
        n2 = Gateway.objects.create(nome="N2", departamento="TI", tipo="Gateway")
        cve = Vulnerabilidade.objects.create(
            cve_code="CVE-2025-3001",
            descricao="Falha Base",
            categoria="Sec",
            severidade="Critical",
            status="Ativa",
            score=10.0,
        )
        n2.vulnerabilidades.add(cve)

        conn = ConexaoRede.objects.create(
            origem=n1, destino=n2, peso_propagacao=0.5, direcao="Outbound", status="Ativa"
        )
        MotorMatematico().calcular_risco_rede()
        n1.refresh_from_db()
        n2.refresh_from_db()
        self.assertAlmostEqual(n1.risco_final, 5.0, places=2)
        self.assertAlmostEqual(n2.risco_final, 10.0, places=2)

        conn.direcao = "Bidirecional"
        conn.save()
        MotorMatematico().calcular_risco_rede()
        n1.refresh_from_db()
        n2.refresh_from_db()
        self.assertAlmostEqual(n1.risco_final, 6.67, places=2)
        self.assertAlmostEqual(n2.risco_final, 13.33, places=2)

    def test_08_isolamento_firewall_conexao_bloqueada(self):
        """Garante que conexões com status='Bloqueada' cortam a propagação lateral."""
        n1 = Gateway.objects.create(nome="Alvo-Limpo", departamento="TI", tipo="Gateway")
        n2 = Gateway.objects.create(nome="Host-Infectado", departamento="TI", tipo="Gateway")
        cve = Vulnerabilidade.objects.create(
            cve_code="CVE-2025-4001",
            descricao="Worm",
            categoria="Sec",
            severidade="Critical",
            status="Ativa",
            score=9.0,
        )
        n2.vulnerabilidades.add(cve)
        conn = ConexaoRede.objects.create(
            origem=n1, destino=n2, peso_propagacao=0.5, direcao="Bidirecional", status="Ativa"
        )

        MotorMatematico().calcular_risco_rede()
        n1.refresh_from_db()
        self.assertGreater(n1.risco_final, 0.0)

        conn.status = "Bloqueada"
        conn.save()
        MotorMatematico().calcular_risco_rede()
        n1.refresh_from_db()
        self.assertAlmostEqual(n1.risco_final, 0.0, places=2)

    def test_09_deteccao_matriz_singular_nao_invertivel(self):
        """Verifica que det(I - A) == 0 faz calcular_risco_rede() retornar None."""
        n1 = Gateway.objects.create(nome="Loop-A", departamento="TI", tipo="Gateway")
        n2 = Gateway.objects.create(nome="Loop-B", departamento="TI", tipo="Gateway")
        ConexaoRede.objects.create(
            origem=n1, destino=n2, peso_propagacao=1.0, direcao="Bidirecional", status="Ativa"
        )

        resultado = MotorMatematico().calcular_risco_rede()
        self.assertIsNone(resultado)

    # =========================================================================
    # MÓDULO 3: Comunicação Django REST <-> React & Transações Atômicas
    # =========================================================================

    def test_10_api_adicionar_conexao_valida_201_created(self):
        """Testa POST /api/equipamentos/<pk>/connections/ com payload camelCase válido."""
        self.client.force_authenticate(user=self.user_analista)
        origem = Equipamento.objects.create(
            nome="SRV-Web", responsavel=self.user_analista, departamento="TI", tipo="Servidor"
        )
        destino = Equipamento.objects.create(
            nome="DB-Core", responsavel=self.user_analista, departamento="TI", tipo="Database"
        )

        payload = {
            "destinoId": destino.id,
            "pesoPropagacao": 0.3,
            "porta": 5432,
            "protocolo": "PostgreSQL / TLS",
            "direcao": "Bidirecional",
            "status": "Ativa",
        }
        response = self.client.post(
            f"/api/equipamentos/{origem.id}/connections/", payload, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ConexaoRede.objects.count(), 1)
        self.assertEqual(len(response.data["conexoes"]), 1)
        self.assertEqual(response.data["conexoes"][0]["porta"], 5432)

    def test_11_api_adicionar_conexao_matriz_nao_invertivel_400_e_rollback(self):
        """
        Garante que em AdicionarConexaoAPI, se motor.calcular_risco_rede() retornar None:
        1) Não chega no 201_CREATED
        2) Retorna {"erro": "Matriz de dependências não invertível"} com HTTP_400_BAD_REQUEST
        3) Faz rollback da conexão inválida no banco de dados
        """
        self.client.force_authenticate(user=self.user_analista)
        origem = Equipamento.objects.create(
            nome="Node-Alpha", responsavel=self.user_analista, departamento="TI", tipo="Servidor"
        )
        destino = Equipamento.objects.create(
            nome="Node-Beta", responsavel=self.user_analista, departamento="TI", tipo="Servidor"
        )

        payload = {
            "destinoId": destino.id,
            "pesoPropagacao": 1.0,
            "porta": 443,
            "protocolo": "HTTPS",
            "direcao": "Bidirecional",
            "status": "Ativa",
        }
        response = self.client.post(
            f"/api/equipamentos/{origem.id}/connections/", payload, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(dict(response.data), {"erro": "Matriz de dependências não invertível"})
        self.assertEqual(ConexaoRede.objects.count(), 0)

    def test_12_api_patch_conexao_matriz_nao_invertivel_400_e_rollback(self):
        """Garante que editar uma conexão existente para peso singular retorna 400 e preserva o peso antigo."""
        self.client.force_authenticate(user=self.user_analista)
        origem = Equipamento.objects.create(
            nome="SRV-1", responsavel=self.user_analista, departamento="TI", tipo="Servidor"
        )
        destino = Equipamento.objects.create(
            nome="SRV-2", responsavel=self.user_analista, departamento="TI", tipo="Servidor"
        )
        conn = ConexaoRede.objects.create(
            origem=origem, destino=destino, peso_propagacao=0.25, direcao="Bidirecional", status="Ativa"
        )

        response = self.client.patch(
            f"/api/equipamentos/{origem.id}/connections/{conn.id}/",
            {"pesoPropagacao": 1.0},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(dict(response.data), {"erro": "Matriz de dependências não invertível"})
        conn.refresh_from_db()
        self.assertAlmostEqual(conn.peso_propagacao, 0.25, places=2)

    def test_13_api_deletar_conexao_recalcula_malha(self):
        """Testa DELETE /api/equipamentos/<pk>/connections/<id>/ e recálculo imediato."""
        self.client.force_authenticate(user=self.user_analista)
        n1 = Equipamento.objects.create(
            nome="Host-A", responsavel=self.user_analista, departamento="TI", tipo="Gateway"
        )
        n2 = Equipamento.objects.create(
            nome="Host-B", responsavel=self.user_analista, departamento="TI", tipo="Gateway"
        )
        cve = Vulnerabilidade.objects.create(
            cve_code="CVE-2025-5001",
            descricao="Falha",
            categoria="Sec",
            severidade="High",
            status="Ativa",
            score=8.0,
        )
        n2.vulnerabilidades.add(cve)
        conn = ConexaoRede.objects.create(
            origem=n1, destino=n2, peso_propagacao=0.5, direcao="Bidirecional", status="Ativa"
        )
        MotorMatematico().calcular_risco_rede()
        n1.refresh_from_db()
        self.assertGreater(n1.risco_final, 0.0)

        response = self.client.delete(
            f"/api/equipamentos/{n1.id}/connections/{conn.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        n1.refresh_from_db()
        self.assertAlmostEqual(n1.risco_final, 0.0, places=2)

    def test_14_serializacao_bidirecional_camel_case_para_react(self):
        """Verifica que o destino enxerga uma conexão Outbound da origem como Inbound."""
        n1 = Equipamento.objects.create(nome="Origem", departamento="TI", tipo="Servidor")
        n2 = Equipamento.objects.create(nome="Destino", departamento="TI", tipo="Database")
        ConexaoRede.objects.create(
            origem=n1, destino=n2, porta=3306, protocolo="MySQL", peso_propagacao=0.4, direcao="Outbound"
        )

        dados_n1 = EquipamentoSerializers(n1).data
        dados_n2 = EquipamentoSerializers(n2).data

        self.assertEqual(dados_n1["conexoes"][0]["direcao"], "Outbound")
        self.assertEqual(dados_n1["conexoes"][0]["destino_nome"], "Destino")
        self.assertEqual(dados_n2["conexoes"][0]["direcao"], "Inbound")
        self.assertEqual(dados_n2["conexoes"][0]["destino_nome"], "Origem")

    # =========================================================================
    # MÓDULO 4: Ciclo de Vida de Ativos (Criar, Atualizar e Deletar)
    # =========================================================================

    def test_15_crud_criar_ativos_todos_os_tipos(self):
        """Testa criação de ativos via POST /api/equipamentos/ e atribuição automática de responsável."""
        self.client.force_authenticate(user=self.user_analista)

        res = self.client.post(
            "/api/equipamentos/",
            {
                "nome": "SRV-Producao-01",
                "departamento": "Infraestrutura",
                "tipo": "Servidor",
                "ip": "192.168.10.50",
                "mac": "00:1B:44:11:3A:B7",
                "sistemaOperacional": "Debian 12 Bookworm",
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["nome"], "SRV-Producao-01")
        self.assertEqual(res.data["responsavel"], "analista_soc")
        self.assertEqual(res.data["fator_exposicao"], 1.5)
        self.assertTrue(Servidor.objects.filter(nome="SRV-Producao-01").exists())

    def test_16_crud_atualizar_ativo_e_recalculo_automatico(self):
        """Testa atualização de ativo via PATCH /api/equipamentos/<id>/ e recálculo de risco."""
        self.client.force_authenticate(user=self.user_analista)
        ws = Workstation.objects.create(
            nome="WS-Antiga",
            responsavel=self.user_analista,
            departamento="Suporte",
            tipo="Workstation",
            ip="10.0.0.10",
        )
        vuln = Vulnerabilidade.objects.create(
            cve_code="CVE-2025-8888",
            descricao="Privilege Escalation",
            categoria="Sec",
            severidade="Critical",
            status="Ativa",
            score=10.0,
        )
        ws.vulnerabilidades.add(vuln)
        MotorMatematico().calcular_risco_rede()
        ws.refresh_from_db()
        self.assertAlmostEqual(ws.risco_final, 5.0, places=2)  # 10.0 * 0.5x = 5.0

        # Atualiza nome, IP, SO e promove de Workstation (0.5x) para Servidor (1.5x)
        res_patch = self.client.patch(
            f"/api/equipamentos/{ws.id}/",
            {
                "nome": "SRV-Promovido",
                "ip": "10.0.0.99",
                "sistemaOperacional": "Red Hat Enterprise Linux 9",
                "tipo": "Servidor",
            },
            format="json",
        )
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(res_patch.data["nome"], "SRV-Promovido")
        self.assertEqual(res_patch.data["ip"], "10.0.0.99")
        self.assertAlmostEqual(float(res_patch.data["risco_final"]), 15.0, places=2)  # 10.0 * 1.5x = 15.0

    def test_17_crud_deletar_ativo_e_limpeza_em_cascata(self):
        """Testa deleção de ativo via DELETE /api/equipamentos/<id>/ e descontaminação dos vizinhos."""
        self.client.force_authenticate(user=self.user_analista)
        infectado = Gateway.objects.create(
            nome="GW-Infectado", responsavel=self.user_analista, departamento="TI", tipo="Gateway"
        )
        vizinho = Gateway.objects.create(
            nome="GW-Vizinho", responsavel=self.user_analista, departamento="TI", tipo="Gateway"
        )
        vuln = Vulnerabilidade.objects.create(
            cve_code="CVE-2025-9000",
            descricao="RCE",
            categoria="Sec",
            severidade="Critical",
            status="Ativa",
            score=10.0,
        )
        infectado.vulnerabilidades.add(vuln)
        ConexaoRede.objects.create(
            origem=vizinho, destino=infectado, peso_propagacao=0.5, direcao="Bidirecional", status="Ativa"
        )
        MotorMatematico().calcular_risco_rede()
        vizinho.refresh_from_db()
        self.assertGreater(vizinho.risco_final, 0.0)

        # Deleta o ativo infectado -> conexão some em cascata e risco do vizinho zera!
        res_del = self.client.delete(f"/api/equipamentos/{infectado.id}/")
        self.assertEqual(res_del.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Equipamento.objects.filter(pk=infectado.id).exists())
        self.assertEqual(ConexaoRede.objects.count(), 0)

        vizinho.refresh_from_db()
        self.assertAlmostEqual(vizinho.risco_final, 0.0, places=2)

    # =========================================================================
    # MÓDULO 5: Usuários, Autenticação JWT e Hierarquia de Permissões
    # =========================================================================

    def test_18_bloqueio_acesso_anonimo_sem_jwt(self):
        """Garante que requisições sem cabeçalho Bearer JWT recebem 401 Unauthorized."""
        r1 = self.client.get("/api/equipamentos/")
        r2 = self.client.get("/api/metrics/")
        r3 = self.client.post("/api/equipamentos/1/connections/", {})

        self.assertEqual(r1.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(r2.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(r3.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_19_fluxo_completo_login_falha_e_refresh_jwt(self):
        """Testa login válido (200), senha incorreta (401) e renovação em /api/token/refresh/."""
        res_falha = self.client.post(
            "/api/token/",
            {"username": "analista_soc", "password": "SenhaErrada999"},
            format="json",
        )
        self.assertEqual(res_falha.status_code, status.HTTP_401_UNAUTHORIZED)

        res_login = self.client.post(
            "/api/token/",
            {"username": "analista_soc", "password": "StrongPassword123!"},
            format="json",
        )
        self.assertEqual(res_login.status_code, status.HTTP_200_OK)
        self.assertIn("access", res_login.data)
        self.assertIn("refresh", res_login.data)

        res_refresh = self.client.post(
            "/api/token/refresh/",
            {"refresh": res_login.data["refresh"]},
            format="json",
        )
        self.assertEqual(res_refresh.status_code, status.HTTP_200_OK)
        self.assertIn("access", res_refresh.data)

    def test_20_atribuicao_responsavel_por_username_id_e_invalido(self):
        """Testa o ResponsavelField atribuindo por username, por ID numérico e barrando usuário inexistente."""
        self.client.force_authenticate(user=self.user_admin)

        # 1. Por username ('analista_externo')
        r_user = self.client.post(
            "/api/equipamentos/",
            {"nome": "Ativo-Por-Nome", "departamento": "TI", "tipo": "Servidor", "responsavel": "analista_externo"},
            format="json",
        )
        self.assertEqual(r_user.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r_user.data["responsavel"], "analista_externo")

        # 2. Por ID numérico
        r_id = self.client.post(
            "/api/equipamentos/",
            {"nome": "Ativo-Por-ID", "departamento": "TI", "tipo": "Servidor", "responsavel": str(self.user_analista.id)},
            format="json",
        )
        self.assertEqual(r_id.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r_id.data["responsavel"], "analista_soc")

        # 3. Usuário inexistente -> 400 Bad Request
        r_invalido = self.client.post(
            "/api/equipamentos/",
            {"nome": "Ativo-Fantasma", "departamento": "TI", "tipo": "Servidor", "responsavel": "usuario_que_nao_existe"},
            format="json",
        )
        self.assertEqual(r_invalido.status_code, status.HTTP_400_BAD_REQUEST)

    def test_21_isolamento_de_ativos_entre_analistas_comuns(self):
        """Garante que um analista comum não enxerga, não edita e não deleta ativos de outro analista."""
        ativo_outro = Equipamento.objects.create(
            nome="Cofre-Externo", responsavel=self.user_outro, departamento="Sec", tipo="Database"
        )
        meu_ativo = Equipamento.objects.create(
            nome="Meu-Servidor", responsavel=self.user_analista, departamento="TI", tipo="Servidor"
        )

        self.client.force_authenticate(user=self.user_analista)
        res_lista = self.client.get("/api/equipamentos/")
        ids_retornados = [int(item["id"]) for item in res_lista.data]

        self.assertIn(meu_ativo.id, ids_retornados)
        self.assertNotIn(ativo_outro.id, ids_retornados)

        self.assertEqual(
            self.client.get(f"/api/equipamentos/{ativo_outro.id}/").status_code,
            status.HTTP_404_NOT_FOUND,
        )
        self.assertEqual(
            self.client.patch(f"/api/equipamentos/{ativo_outro.id}/", {"nome": "Hack"}).status_code,
            status.HTTP_404_NOT_FOUND,
        )
        self.assertEqual(
            self.client.delete(f"/api/equipamentos/{ativo_outro.id}/").status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_22_visao_global_superusuario_soc_admin(self):
        """Valida que o superusuário ('igor') enxerga e edita ativos de todos os usuários."""
        a1 = Equipamento.objects.create(
            nome="Ativo-Analista-1", responsavel=self.user_analista, departamento="A", tipo="Servidor"
        )
        a2 = Equipamento.objects.create(
            nome="Ativo-Analista-2", responsavel=self.user_outro, departamento="B", tipo="Database"
        )

        self.client.force_authenticate(user=self.user_admin)
        res = self.client.get("/api/equipamentos/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)

        res_patch = self.client.patch(
            f"/api/equipamentos/{a1.id}/", {"departamento": "Auditado-Pelo-Admin"}, format="json"
        )
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)

    # =========================================================================
    # MÓDULO 6: NIST NVD v2.0, Dashboard Espectral e Diagnóstico
    # =========================================================================

    @patch("inventario.cve_service.requests.get")
    def test_23_enriquecimento_cve_nist_nvd_online_mockado(self, mock_get):
        """Simula resposta oficial da API NIST NVD v2.0 e verifica cálculo automático."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "vulnerabilities": [
                {
                    "cve": {
                        "descriptions": [{"value": "Apache Log4j2 JNDI RCE (Log4Shell)."}],
                        "published": "2021-12-10T10:15:00.000",
                        "metrics": {
                            "cvssMetricV31": [
                                {
                                    "cvssData": {
                                        "baseScore": 10.0,
                                        "baseSeverity": "CRITICAL",
                                        "attackVector": "NETWORK",
                                    }
                                }
                            ]
                        },
                    }
                }
            ]
        }
        mock_get.return_value = mock_response

        self.client.force_authenticate(user=self.user_analista)
        srv = Servidor.objects.create(
            nome="SRV-Java", responsavel=self.user_analista, departamento="Core", tipo="Servidor"
        )

        res = self.client.post(
            f"/api/equipamentos/{srv.id}/cves/",
            {"id": "CVE-2021-44228"},
            format="json",
        )

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        srv.refresh_from_db()
        self.assertAlmostEqual(srv.risco_proprio, 15.0, places=2)
        self.assertAlmostEqual(srv.risco_final, 15.0, places=2)

    @patch("inventario.cve_service.requests.get", side_effect=Exception("NIST Timeout / Offline"))
    def test_24_resiliencia_fallback_manual_quando_nist_offline(self, _mock_get):
        """Garante que se a internet/NIST falhar, os dados manuais do formulário são salvos."""
        self.client.force_authenticate(user=self.user_analista)
        ws = Workstation.objects.create(
            nome="WS-Dev", responsavel=self.user_analista, departamento="Dev", tipo="Workstation"
        )

        payload_manual = {
            "id": "CVE-2026-9999",
            "cvss": 8.0,
            "severidade": "High",
            "descricao": "Zero-day interno registrado em ambiente air-gapped.",
            "vetorAtaque": "Local / Privilege Escalation",
            "dataDescoberta": "2026-11-06",
            "status": "Ativa",
        }
        res = self.client.post(
            f"/api/equipamentos/{ws.id}/cves/", payload_manual, format="json"
        )

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        ws.refresh_from_db()
        self.assertAlmostEqual(ws.risco_proprio, 4.0, places=2)

    def test_25_remocao_cve_e_descontaminacao_de_risco(self):
        """Testa DELETE /api/equipamentos/<pk>/cves/<cve_code>/ e redução imediata do risco."""
        self.client.force_authenticate(user=self.user_analista)
        srv = Servidor.objects.create(
            nome="SRV-Patch", responsavel=self.user_analista, departamento="TI", tipo="Servidor"
        )
        vuln = Vulnerabilidade.objects.create(
            cve_code="CVE-2024-3094",
            descricao="XZ Backdoor",
            categoria="Sec",
            severidade="Critical",
            status="Ativa",
            score=9.8,
        )
        srv.vulnerabilidades.add(vuln)
        MotorMatematico().calcular_risco_rede()

        res = self.client.delete(f"/api/equipamentos/{srv.id}/cves/CVE-2024-3094/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        srv.refresh_from_db()
        self.assertAlmostEqual(srv.risco_final, 0.0, places=2)

    def test_26_dashboard_metricas_espectrais_lambda_max_e_densidade(self):
        """Valida cálculo de λmax (autovalor dominante), densidade e matriz de calor."""
        self.client.force_authenticate(user=self.user_analista)
        a1 = Servidor.objects.create(
            nome="A1", responsavel=self.user_analista, departamento="TI", tipo="Servidor"
        )
        a2 = Database.objects.create(
            nome="A2", responsavel=self.user_analista, departamento="TI", tipo="Database"
        )
        vuln = Vulnerabilidade.objects.create(
            cve_code="CVE-2025-7777",
            descricao="SQLi",
            categoria="Sec",
            severidade="High",
            status="Ativa",
            score=7.5,
        )
        a1.vulnerabilidades.add(vuln)
        ConexaoRede.objects.create(
            origem=a1, destino=a2, peso_propagacao=0.4, direcao="Bidirecional", status="Ativa"
        )
        MotorMatematico().calcular_risco_rede()

        res = self.client.get("/api/metrics/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["total_assets"], 2)
        self.assertAlmostEqual(res.data["lambda_max"], 0.4, places=2)
        self.assertAlmostEqual(res.data["matrix_density"], 0.5, places=2)
        self.assertEqual(res.data["unpatched_cves"], 1)
        self.assertEqual(res.data["heatmap"]["labels"], ["A1", "A2"])

    def test_27_dashboard_rede_vazia_e_diagnostico_ping(self):
        """Valida /api/metrics/ sem ativos e descoberta de portas no /ping/."""
        self.client.force_authenticate(user=self.user_analista)
        res_vazio = self.client.get("/api/metrics/")
        self.assertEqual(res_vazio.status_code, status.HTTP_200_OK)
        self.assertEqual(res_vazio.data["total_assets"], 0)

        a1 = Equipamento.objects.create(
            nome="Host-Ping", responsavel=self.user_analista, departamento="TI", tipo="Servidor"
        )
        a2 = Equipamento.objects.create(
            nome="Host-Dest", responsavel=self.user_analista, departamento="TI", tipo="Database"
        )
        res_default = self.client.post(f"/api/equipamentos/{a1.id}/ping/")
        self.assertEqual(res_default.data["open_ports"], [22, 80, 443])

        ConexaoRede.objects.create(origem=a1, destino=a2, porta=8443)
        res_custom = self.client.post(f"/api/equipamentos/{a1.id}/ping/")
        self.assertEqual(res_custom.data["open_ports"], [8443])

    # =========================================================================
    # MÓDULO 7: Validação da Infraestrutura Docker & Deploy
    # =========================================================================

    def test_28_docker_arquivos_e_configuracao_containers(self):
        """Verifica se Dockerfile (backend/frontend) e docker-compose.yml existem e estão íntegros."""
        raiz = Path(settings.BASE_DIR)
        dockerfile_back = raiz / "Dockerfile"
        dockerfile_front = raiz / "frontend" / "Dockerfile"
        compose_file = raiz / "docker-compose.yml"

        self.assertTrue(dockerfile_back.exists(), "Dockerfile do backend não encontrado")
        self.assertTrue(dockerfile_front.exists(), "Dockerfile do frontend não encontrado")
        self.assertTrue(compose_file.exists(), "docker-compose.yml não encontrado")

        conteudo_back = dockerfile_back.read_text(encoding="utf-8")
        self.assertIn("python:3.12-slim", conteudo_back)
        self.assertIn("gunicorn", conteudo_back)
        self.assertIn("0.0.0.0:2215", conteudo_back)

        conteudo_front = dockerfile_front.read_text(encoding="utf-8")
        self.assertIn("node:20-alpine", conteudo_front)
        self.assertIn("nginx:alpine", conteudo_front)

        conteudo_compose = compose_file.read_text(encoding="utf-8")
        self.assertIn("backend:", conteudo_compose)
        self.assertIn("frontend:", conteudo_compose)
        self.assertIn("2215:80", conteudo_compose)

    def test_29_docker_entrypoint_seed_professor_igor_e_nginx_proxy(self):
        """Garante que o entrypoint.sh cria o superusuário 'igor' e que o Nginx faz proxy de /api/."""
        raiz = Path(settings.BASE_DIR)
        entrypoint = raiz / "entrypoint.sh"
        nginx_conf = raiz / "frontend" / "nginx.conf"

        self.assertTrue(entrypoint.exists(), "entrypoint.sh não encontrado")
        self.assertTrue(nginx_conf.exists(), "frontend/nginx.conf não encontrado")

        txt_entry = entrypoint.read_text(encoding="utf-8")
        self.assertIn("python manage.py migrate", txt_entry)
        self.assertIn("create_superuser('igor'", txt_entry)
        self.assertIn("senha123", txt_entry)

        txt_nginx = nginx_conf.read_text(encoding="utf-8")
        self.assertIn("location /api/", txt_nginx)
        self.assertIn("proxy_pass http://backend:2215;", txt_nginx)

    def test_30_docker_execucao_seed_entrypoint_idempotente(self):
        """
        Extrai e executa o script Python do entrypoint.sh duas vezes seguidas para provar
        que o container cria o superusuário 'igor' no primeiro boot e é idempotente ao reiniciar.
        """
        raiz = Path(settings.BASE_DIR)
        txt_entry = (raiz / "entrypoint.sh").read_text(encoding="utf-8")

        # Extrai o bloco Python dentro de python manage.py shell -c "..."
        marcador = 'python manage.py shell -c "'
        inicio = txt_entry.find(marcador) + len(marcador)
        fim = txt_entry.find('"', inicio)
        codigo_seed = txt_entry[inicio:fim]

        # Remove o usuário 'igor' para simular o primeiro boot limpo do container Docker
        User.objects.filter(username="igor").delete()
        self.assertFalse(User.objects.filter(username="igor").exists())

        # 1º Boot do container: deve criar o superusuário 'igor' com senha 'senha123'
        exec(codigo_seed, {})
        igor = User.objects.get(username="igor")
        self.assertTrue(igor.is_superuser)
        self.assertTrue(igor.check_password("senha123"))

        # 2º Boot (restart do container): deve detectar que 'igor' já existe sem lançar IntegrityError
        exec(codigo_seed, {})
        self.assertEqual(User.objects.filter(username="igor").count(), 1)
