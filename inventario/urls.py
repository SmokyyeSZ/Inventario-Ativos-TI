from django.urls import path
from . import views

urlpatterns = [
    path('equipamentos/', views.listar_equipamentos, name='listar_equipamentos'),
    path('equipamentos/novo/', views.criar_equipamento, name='criar_equipamento'),
    path('equipamentos/apagar/<int:id>/', views.apagar_equipamento, name='apagar_equipamento'),
    path('equipamentos/editar/<int:id>/', views.editar_equipamento, name='editar_equipamento'),
    path('equipamentos/analisar/', views.analisar_riscos, name='analisar_riscos'),
    path('equipamentos/CVE/<int:id>/', views.vincular_cve, name='CVE'),
    path('equipamentos/conexao_risco/<int:id>/', views.conexao_risco, name='conexao'),
    path('equipamentos/detalhes_equipamentos/<int:id>/', views.detalhes_equipamentos, name='detalhes'),
    path('equipamentos/remover_cve/<int:id>/<str:cve_code>/', views.remover_cve, name='remover_cve'),
    path('equipamentos/desconectar/<int:id>/<int:conexao_id>/', views.desconectar, name='desconectar'),
    path('api/equipamentos/', views.EquipamentoListCreate.as_view(), name='api_equipamentos'),
    path('api/vulnerabilidades/', views.VulnerabilidadesListCreate.as_view(), name='api_vulnerabilidades'),
    path('api/equipamentos/<int:pk>/', views.EquipamentoDetalheAPI.as_view(), name='api_equipamento'),
    path('api/equipamentos/<int:pk>/connections/', views.AdicionarConexaoAPI.as_view(), name='api_adicionar_conexao'),
    path('api/equipamentos/<int:pk>/cves/', views.AdicionarCveAPI.as_view(), name='api_adicionar_cve'),
    path('api/metrics/', views.DashboardMetricsAPI.as_view(), name='api_metrics'),
    path('api/equipamentos/<int:pk>/connections/<int:conexao_id>/', views.RemoverConexaoAPI.as_view(), name='api_remover_conexao'),
    path('api/equipamentos/<int:pk>/cves/<str:cve_code>/', views.RemoverCveAPI.as_view(), name='api_remover_cve'),
    path('api/equipamentos/<int:pk>/ping/', views.TestarPingAPI.as_view(), name='api_ping_equipamento'),
]
