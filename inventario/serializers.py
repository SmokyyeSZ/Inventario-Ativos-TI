from rest_framework import serializers
from .models import Equipamento, Vulnerabilidade, ConexaoRede

class VulnerabilidadeSerializers(serializers.ModelSerializer):
    id = serializers.CharField(source='cve_code', read_only=True)
    cvss = serializers.FloatField(source='score', read_only=True)

    class Meta:
        model = Vulnerabilidade
        fields = '__all__'

class ConexaoRedeSerializer(serializers.ModelSerializer):
    destino_nome = serializers.CharField(source='destino.nome', read_only=True)
    origem_id = serializers.CharField(source='origem.id', read_only=True)
    destino_id = serializers.CharField(source='destino.id', read_only=True)

    class Meta:
        model = ConexaoRede
        fields = ['id', 'origem_id', 'destino_id', 'destino_nome', 'porta', 'protocolo', 'peso_propagacao', 'direcao', 'status']

class EquipamentoSerializers(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    cves = VulnerabilidadeSerializers(source='vulnerabilidades', many=True, read_only=True)
    
    conexoes = ConexaoRedeSerializer(source='conexoes_origem', many=True, read_only=True)

    class Meta:
        model = Equipamento
        fields = '__all__'