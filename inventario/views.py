import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from .models import Equipamento, Vulnerabilidade, ConexaoRede
from .serializers import EquipamentoSerializers, VulnerabilidadeSerializers
from .motor_matematico import MotorMatematico
from .cve_service import CVEService
from rest_framework.permissions import IsAuthenticated


def obter_equipamentos_do_usuario(user):
    if user.is_superuser:
        return Equipamento.objects.all()
    return Equipamento.objects.filter(responsavel=user)


class EquipamentoListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EquipamentoSerializers

    def get_queryset(self):
        return obter_equipamentos_do_usuario(self.request.user)

    def perform_create(self, serializer):
        responsavel = serializer.validated_data.get('responsavel') or self.request.user
        return serializer.save(responsavel=responsavel)


class VulnerabilidadesListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VulnerabilidadeSerializers

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Vulnerabilidade.objects.all()
        return Vulnerabilidade.objects.filter(equipamento__responsavel=self.request.user).distinct()


class EquipamentoDetalheAPI(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EquipamentoSerializers

    def get_queryset(self):
        return obter_equipamentos_do_usuario(self.request.user)

    def perform_update(self, serializer):
        instancia = serializer.save()
        MotorMatematico().calcular_risco_rede()
        instancia.refresh_from_db()

    def perform_destroy(self, instance):
        instance.delete()
        MotorMatematico().calcular_risco_rede()


class AdicionarConexaoAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            origem = obter_equipamentos_do_usuario(request.user).get(pk=pk)
            destino_id = request.data.get('destino_id')
            destino = Equipamento.objects.get(pk=destino_id)

            peso = request.data.get('peso_propagacao', 0.1)
            porta = request.data.get('porta', 443)
            protocolo = request.data.get('protocolo', 'HTTPS')
            direcao = request.data.get('direcao', 'Bidirecional')
            status_conn = request.data.get('status', 'Ativa')

            ConexaoRede.objects.update_or_create(
                origem=origem,
                destino=destino,
                defaults={
                    'peso_propagacao': peso,
                    'porta': porta,
                    'protocolo': protocolo,
                    'direcao': direcao,
                    'status': status_conn,
                }
            )

            motor = MotorMatematico()
            motor.calcular_risco_rede()
            origem.refresh_from_db()

            serializer = EquipamentoSerializers(origem)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Equipamento.DoesNotExist:
            return Response({"erro": "Ativo não encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdicionarCveAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            origem = obter_equipamentos_do_usuario(request.user).get(pk=pk)
            codigo_cve = request.data.get('id')

            servico = CVEService()
            cve = servico.buscar_e_salvar_cve(codigo_cve, request.data)

            if cve:
                origem.vulnerabilidades.add(cve)

                motor = MotorMatematico()
                motor.calcular_risco_rede()

                origem.refresh_from_db()

                serializer = EquipamentoSerializers(origem)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            else:
                return Response({"erro": "CVE não encontrada na base do NIST"}, status=status.HTTP_404_NOT_FOUND)

        except Equipamento.DoesNotExist:
            return Response({"erro": "Ativo não encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DashboardMetricsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ativos_qs = obter_equipamentos_do_usuario(request.user)
        ativos = list(ativos_qs)
        n = len(ativos)

        if n == 0:
            return Response({
                "total_assets": 0,
                "lambda_max": 0.0,
                "unpatched_cves": 0,
                "matrix_density": 0.0,
                "propagation_speed": 0.85,
                "heatmap": {"labels": [], "matrix": []},
                "eigenvector_centrality": {
                    "matrix_a": [], "vector_x": [], "density": 0.0, "metrics_count": 0
                }
            })

        matriz_A = np.zeros((n, n))
        id_para_indice = {ativo.id: indice for indice, ativo in enumerate(ativos)}

        num_conexoes = 0
        for i, ativo in enumerate(ativos):
            for conexao in ativo.conexoes_origem.all():
                if conexao.status == 'Bloqueada':
                    continue
                elif conexao.destino.id in id_para_indice:
                    j = id_para_indice[conexao.destino.id]
                    peso = conexao.peso_propagacao
                    if conexao.direcao == 'Bidirecional':
                        matriz_A[i][j] = peso
                        matriz_A[j][i] = peso
                    elif conexao.direcao == 'Inbound':
                        matriz_A[j][i] = peso
                    else:
                        matriz_A[i][j] = peso
        num_conexoes = int(np.count_nonzero(matriz_A))
        densidade = num_conexoes / (n * n) if n > 0 else 0

        try:
            autovalores = np.linalg.eigvals(matriz_A)
            lambda_max = max(abs(autovalores))
        except:
            lambda_max = 0.0

        vetor_x = [ativo.risco_final for ativo in ativos]
        nomes_ativos = [ativo.nome for ativo in ativos]

        cves_ativas = (
            Vulnerabilidade.objects.filter(equipamento__in=ativos_qs)
            .exclude(status__iexact='Corrigido')
            .distinct()
            .count()
        )

        dados = {
            "total_assets": n,
            "lambda_max": float(lambda_max),
            "unpatched_cves": cves_ativas,
            "matrix_density": float(densidade),
            "propagation_speed": 0.85,
            "heatmap": {
                "labels": nomes_ativos,
                "matrix": matriz_A.tolist()
            },
            "eigenvector_centrality": {
                "matrix_a": matriz_A.tolist(),
                "vector_x": vetor_x,
                "density": float(densidade),
                "metrics_count": n
            }
        }

        return Response(dados, status=status.HTTP_200_OK)


class RemoverConexaoAPI(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, conexao_id):
        try:
            obter_equipamentos_do_usuario(request.user).get(pk=pk)
            conexao = ConexaoRede.objects.get(id=conexao_id)
            conexao.porta = request.data.get('porta', conexao.porta)
            conexao.protocolo = request.data.get('protocolo', conexao.protocolo)
            conexao.peso_propagacao = request.data.get('peso_propagacao', conexao.peso_propagacao)
            conexao.direcao = request.data.get('direcao', conexao.direcao)
            conexao.status = request.data.get('status', conexao.status)
            conexao.save()

            MotorMatematico().calcular_risco_rede()
            return Response(status=status.HTTP_200_OK)
        except Equipamento.DoesNotExist:
            return Response({"erro": "Ativo não encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except ConexaoRede.DoesNotExist:
            return Response({"erro": "Conexão não encontrada"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk, conexao_id):
        try:
            obter_equipamentos_do_usuario(request.user).get(pk=pk)
            conexao = ConexaoRede.objects.get(id=conexao_id)
            conexao.delete()

            motor = MotorMatematico()
            motor.calcular_risco_rede()

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Equipamento.DoesNotExist:
            return Response({"erro": "Ativo não encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except ConexaoRede.DoesNotExist:
            return Response({"erro": "Conexão não encontrada"}, status=status.HTTP_404_NOT_FOUND)


class RemoverCveAPI(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, cve_code):
        try:
            origem = obter_equipamentos_do_usuario(request.user).get(pk=pk)
            vuln = Vulnerabilidade.objects.get(cve_code=cve_code)
            origem.vulnerabilidades.remove(vuln)

            motor = MotorMatematico()
            motor.calcular_risco_rede()

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Equipamento.DoesNotExist:
            return Response({"erro": "ativo não encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Vulnerabilidade.DoesNotExist:
            return Response({"erro": "vulnerabilidade não encontrada"}, status=status.HTTP_404_NOT_FOUND)


class TestarPingAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            ativo = obter_equipamentos_do_usuario(request.user).get(pk=pk)
            portas = list(ativo.conexoes_origem.values_list('porta', flat=True).distinct())
            if not portas:
                portas = [22, 80, 443]
            return Response({
                "success": True,
                "latency_ms": 6,
                "open_ports": portas
            }, status=status.HTTP_200_OK)
        except Equipamento.DoesNotExist:
            return Response({"erro": "Ativo não encontrado"}, status=status.HTTP_404_NOT_FOUND)
