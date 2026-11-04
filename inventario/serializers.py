from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import serializers
from .models import Equipamento, Vulnerabilidade, ConexaoRede, Factory_equipamento


class ResponsavelField(serializers.Field):
    def to_representation(self, value):
        return value.username if value else ''

    def to_internal_value(self, data):
        if data is None or str(data).strip() == '':
            return None
        valor = str(data).strip()
        usuario = User.objects.filter(username__iexact=valor).first()
        if not usuario and valor.isdigit():
            usuario = User.objects.filter(pk=int(valor)).first()
        if not usuario:
            raise serializers.ValidationError(f"Usuário '{valor}' não encontrado.")
        return usuario


class VulnerabilidadeSerializers(serializers.ModelSerializer):
    id = serializers.CharField(source='cve_code', read_only=True)
    cvss = serializers.FloatField(source='score', read_only=True)

    class Meta:
        model = Vulnerabilidade
        fields = '__all__'


class ConexaoRedeSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    destino_nome = serializers.CharField(source='destino.nome', read_only=True)
    origem_id = serializers.CharField(source='origem.id', read_only=True)
    destino_id = serializers.CharField(source='destino.id', read_only=True)

    class Meta:
        model = ConexaoRede
        fields = ['id', 'origem_id', 'destino_id', 'destino_nome', 'porta', 'protocolo', 'peso_propagacao', 'direcao', 'status']


class EquipamentoSerializers(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    responsavel = ResponsavelField(required=False, allow_null=True)
    fator_exposicao = serializers.SerializerMethodField()
    cves = VulnerabilidadeSerializers(source='vulnerabilidades', many=True, read_only=True)
    conexoes = serializers.SerializerMethodField()

    class Meta:
        model = Equipamento
        fields = '__all__'

    def create(self, validated_data):
        vulnerabilidades = validated_data.pop('vulnerabilidades', [])
        instancia = Factory_equipamento(validated_data)
        instancia.save()
        if vulnerabilidades:
            instancia.vulnerabilidades.set(vulnerabilidades)
        return instancia

    def get_fator_exposicao(self, obj):
        return Factory_equipamento({'tipo': obj.tipo}).fator_exposicao()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if ret.get('responsavel') is None:
            ret['responsavel'] = ''
        return ret

    def get_conexoes(self, obj):
        conexoes_qs = ConexaoRede.objects.filter(Q(origem=obj) | Q(destino=obj))
        resultado = []
        for conn in conexoes_qs:
            if conn.origem_id == obj.id:
                resultado.append({
                    'id': str(conn.id),
                    'origem_id': str(conn.origem_id),
                    'destino_id': str(conn.destino_id),
                    'destino_nome': conn.destino.nome,
                    'porta': conn.porta,
                    'protocolo': conn.protocolo,
                    'peso_propagacao': conn.peso_propagacao,
                    'direcao': conn.direcao,
                    'status': conn.status,
                })
            else:
                direcao_inversa = (
                    'Inbound' if conn.direcao == 'Outbound'
                    else 'Outbound' if conn.direcao == 'Inbound'
                    else 'Bidirecional'
                )
                resultado.append({
                    'id': str(conn.id),
                    'origem_id': str(obj.id),
                    'destino_id': str(conn.origem_id),
                    'destino_nome': conn.origem.nome,
                    'porta': conn.porta,
                    'protocolo': conn.protocolo,
                    'peso_propagacao': conn.peso_propagacao,
                    'direcao': direcao_inversa,
                    'status': conn.status,
                })
        return resultado
