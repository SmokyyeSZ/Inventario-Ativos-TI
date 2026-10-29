from django.db import models
from django.contrib.auth.models import User

class ConexaoRede(models.Model):
    origem = models.ForeignKey('Equipamento', related_name='conexoes_origem', on_delete=models.CASCADE)
    destino = models.ForeignKey('Equipamento', related_name='conexoes_destino', on_delete=models.CASCADE)
    porta = models.IntegerField(default=443)
    protocolo = models.CharField(max_length=100, default="HTTPS / TLS")
    peso_propagacao = models.FloatField(default=0.1)
    direcao = models.CharField(max_length=50, default="Bidirecional")
    status = models.CharField(max_length=50, default="Ativa")

    class Meta:
        unique_together = ('origem', 'destino')

class Vulnerabilidade(models.Model):
    descricao = models.TextField()
    categoria = models.CharField(max_length=100)
    severidade = models.CharField(max_length=100)
    status = models.CharField(max_length=100)
    score = models.FloatField()
    cve_code = models.CharField(max_length=20, unique=True)
    
    vetor_ataque = models.CharField(max_length=100, default='Network / Unauthenticated')
    data_descoberta = models.CharField(max_length=50, blank=True, null=True)

class Equipamento(models.Model):
    nome = models.CharField(max_length=100)
    responsavel = models.ForeignKey(User,related_name='responsavel',on_delete=models.SET_NULL, null=True, blank=True)
    departamento = models.CharField(max_length=100)
    tipo = models.CharField(max_length=100)
    vulnerabilidades = models.ManyToManyField(Vulnerabilidade, blank=True)
    
    conexoes = models.ManyToManyField('self', through='ConexaoRede', blank=True, symmetrical=False)
    
    risco_proprio = models.FloatField(default=0.0)
    risco_final = models.FloatField(default=0.0)
    ip = models.CharField(max_length=15, default='')
    mac = models.CharField(max_length=17, default='')
    sistema_operacional = models.CharField(max_length=100, null=True, blank=True)
    
    status = models.CharField(max_length=50, default='online')
    ultimo_scan = models.CharField(max_length=50, default='Aguardando scan...')
    peso_propagacao = models.FloatField(default=0.0)
    
    NIVEIS_CRITICIDADE = [
        ('Critical', 'Crítica (Tier 1 Core)'),
        ('High', 'Alta (Produção)'),
        ('Medium', 'Média (Apoio)'),
        ('Low', 'Baixa (Periférico)'),
    ]
    criticidade = models.CharField(
        max_length=20, 
        choices=NIVEIS_CRITICIDADE, 
        default='Medium'
    )