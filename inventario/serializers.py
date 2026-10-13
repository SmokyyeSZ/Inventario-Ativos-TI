from rest_framework import serializers
from .models import Equipamento, Vulnerabilidade

class VulnerabilidadeSerializers(serializers.ModelSerializer):
    class Meta:
        model = Vulnerabilidade
        fields = '__all__'

class EquipamentoSerializers(serializers.ModelSerializer):
    cves = VulnerabilidadeSerializers(source='vulnerabilidades', many=True, read_only=True)

    class Meta:
        model = Equipamento
        fields = '__all__'

