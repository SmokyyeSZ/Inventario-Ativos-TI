from django.db import models

class Vulnerabilidade(models.Model):
    descricao = models.TextField()
    categoria = models.CharField(max_length=100)
    severidade = models.CharField(max_length=100)
    status = models.CharField(max_length=100)
    score = models.FloatField()
    cve_code = models.CharField(max_length=20, unique=True)

class Equipamento(models.Model):
    id_ativo = models.IntegerField()
    nome = models.CharField(max_length=100)
    responsavel = models.CharField(max_length=100)
    departamento = models.CharField(max_length=100)
    tipo = models.CharField(max_length=100)
    vulnerabilidades = models.ManyToManyField(Vulnerabilidade, blank=True)
    conexoes = models.ManyToManyField('self', blank=True)
    risco_proprio = models.FloatField(default=0.0)
    risco_final = models.FloatField(default=0.0)