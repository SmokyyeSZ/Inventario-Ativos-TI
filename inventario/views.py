from rest_framework import generics
from django.shortcuts import render, redirect
from .models import Equipamento, Vulnerabilidade
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
        id_ativo = request.POST.get('id_ativo')
        nome = request.POST.get('nome')
        responsavel = request.POST.get('responsavel')
        departamento = request.POST.get('departamento')
        tipo = request.POST.get('tipo')

        Equipamento.objects.create(
            id_ativo=id_ativo,
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
        id_ativo = request.POST.get('id_ativo')
        equipamento_alvo = Equipamento.objects.get(id=id_ativo)
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