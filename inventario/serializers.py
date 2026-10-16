from rest_framework import serializers
from .models import Equipamento, Vulnerabilidade

class VulnerabilidadeSerializers(serializers.ModelSerializer):
    id = serializers.CharField(source='cve_code', read_only=True)
    cvss = serializers.FloatField(source='score', read_only=True)

    class Meta:
        model = Vulnerabilidade
        fields = '__all__'

class EquipamentoSerializers(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    cves = VulnerabilidadeSerializers(source='vulnerabilidades', many=True, read_only=True)

    class Meta:
        model = Equipamento
        fields = '__all__'