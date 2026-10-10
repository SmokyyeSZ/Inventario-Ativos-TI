from django.shortcuts import render, redirect
from .models import Equipamento
from .motor_matematico import MotorMatematico

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
