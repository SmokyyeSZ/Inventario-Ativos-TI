import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from django.shortcuts import render, redirect
from .models import Equipamento, Vulnerabilidade, ConexaoRede
from .serializers import EquipamentoSerializers, VulnerabilidadeSerializers
from .motor_matematico import MotorMatematico
from .cve_service import CVEService

def listar_equipamentos(request):
    ativos = Equipamento.objects.all()

    contexto = {
        'equipamentos': ativos
    }

    return render(request, 'inventario/listar.html', contexto)

def criar_equipamento(request):
    if request.method == 'POST':
        nome = request.POST.get('nome')
        responsavel = request.POST.get('responsavel')
        departamento = request.POST.get('departamento')
        tipo = request.POST.get('tipo')

        Equipamento.objects.create(
            nome=nome,
            responsavel=responsavel,
            departamento=departamento,
            tipo=tipo
        )
        return redirect('listar_equipamentos')

    return render(request, 'inventario/criar.html')

def apagar_equipamento(request, id):
    equipamento = Equipamento.objects.get(id=id)
    equipamento.delete()
    return redirect("listar_equipamentos")

def editar_equipamento(request, id):
    equipamento = Equipamento.objects.get(id=id)

    if request.method == 'POST':
        equipamento.nome = request.POST.get('nome')
        equipamento.responsavel = request.POST.get('responsavel')
        equipamento.departamento = request.POST.get('departamento')
        equipamento.tipo = request.POST.get('tipo')

        equipamento.save()
        return redirect('listar_equipamentos')

    contexto = {
        'ativo': equipamento
    }
    return render(request, 'inventario/editar.html', contexto)

def analisar_riscos(request):
    motor = MotorMatematico()

    motor.calcular_risco_rede()

    return redirect('listar_equipamentos')

def vincular_cve(request, id):
    equipamento = Equipamento.objects.get(id=id)
    servico = CVEService()
    if request.method == 'POST':
        codigo_cve = request.POST.get('cve')
        falha = servico.buscar_e_salvar_cve(codigo_cve)
        if falha:
            equipamento.vulnerabilidades.add(falha)
            return redirect('listar_equipamentos')

    contexto = {
        'ativo': equipamento
    }
        
    return render(request, 'inventario/vincular_cve.html', contexto)

def conexao_risco(request, id):
    equipamentos = Equipamento.objects.get(id=id)
    outros_equipamentos = Equipamento.objects.exclude(id=id)

    if request.method == 'POST':
        equipamento_alvo = Equipamento.objects.get(id=id)
        equipamentos.conexoes.add(equipamento_alvo)
        return redirect('listar_equipamentos')

    contexto = {
        'equipamentos': equipamentos,
        'outros_equipamentos': outros_equipamentos
    }
    return render(request, 'inventario/conexao_risco.html', contexto)

def detalhes_equipamentos(request, id):
    ativo = Equipamento.objects.get(id=id)
    equipamentos = Equipamento.objects.all()
    contexto = {
        'ativo': ativo,
        'equipamentos': equipamentos
    }
    return render(request,'inventario/detalhes.html', contexto)

def desconectar(request, id, conexao_id):
    ativo = Equipamento.objects.get(id=id)
    alvo = Equipamento.objects.get(id=conexao_id)
    ativo.conexoes.remove(alvo)
    return redirect('detalhes', id=id)

def remover_cve(request, id, cve_code):
    ativo = Equipamento.objects.get(id=id)
    vuln = Vulnerabilidade.objects.get(cve_code=cve_code)
    ativo.vulnerabilidades.remove(vuln)
    return redirect('detalhes', id=id)

class EquipamentoListCreate(generics.ListCreateAPIView):
    queryset = Equipamento.objects.all()
    serializer_class = EquipamentoSerializers

class VulnerabilidadesListCreate(generics.ListCreateAPIView):
    queryset = Vulnerabilidade.objects.all()
    serializer_class = VulnerabilidadeSerializers

class EquipamentoDetalheAPI(generics.RetrieveUpdateDestroyAPIView):
    queryset = Equipamento.objects.all()
    serializer_class = EquipamentoSerializers

class AdicionarConexaoAPI(APIView):
    def post(self, request, pk):
        try:
            origem = Equipamento.objects.get(pk=pk)
            destino_id = request.data.get('destino_id')
            destino = Equipamento.objects.get(pk=destino_id)

            peso = request.data.get('peso_propagacao', 0.1)
            porta = request.data.get('porta', 443)
            protocolo = request.data.get('protocolo', 'HTTPS')
            direcao = request.data.get('direcao', 'Bidirecional')

            ConexaoRede.objects.create(
                origem=origem,
                destino=destino,
                peso_propagacao=peso,
                porta=porta,
                protocolo=protocolo,
                direcao=direcao
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
    def post(self, request, pk):
        try:
            origem = Equipamento.objects.get(pk=pk)
            codigo_cve = request.data.get('id') 
            
            servico = CVEService()
            cve = servico.buscar_e_salvar_cve(codigo_cve)
            
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
    def get(self, request):
        ativos = list(Equipamento.objects.all())
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
                if conexao.destino.id in id_para_indice:
                    j = id_para_indice[conexao.destino.id]
                    matriz_A[i][j] = conexao.peso_propagacao
                    num_conexoes += 1

        densidade = num_conexoes / (n * n) if n > 0 else 0

        try:
            autovalores = np.linalg.eigvals(matriz_A)
            lambda_max = max(abs(autovalores))
        except:
            lambda_max = 0.0

        vetor_x = [ativo.risco_final for ativo in ativos]
        nomes_ativos = [ativo.nome for ativo in ativos]

        dados = {
            "total_assets": n,
            "lambda_max": float(lambda_max),
            "unpatched_cves": Vulnerabilidade.objects.filter(status='Ativa').count(),
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
    def delete(self, request, pk, conexao_id):
        try:
            origem = Equipamento.objects.get(pk=pk)
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
    def delete(self, request, pk, cve_code):
        try:
            origem = Equipamento.objects.get(pk=pk)
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
    def post(self, request, pk):
        try:
            ativo = Equipamento.objects.get(pk=pk)
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