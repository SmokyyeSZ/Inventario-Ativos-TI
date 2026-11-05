from django.urls import path
from . import views

urlpatterns = [
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
