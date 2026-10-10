from django.urls import path
from . import views

urlpatterns = [
    path('equipamentos/', views.listar_equipamentos, name='listar_equipamentos'),
    path('equipamentos/novo/', views.criar_equipamento, name='criar_equipamento'),
    path('equipamentos/apagar/<int:id>/', views.apagar_equipamento, name='apagar_equipamento'),
    path('equipamentos/editar/<int:id>/', views.editar_equipamento, name='editar_equipamento'),
    path('equipamentos/analisar/', views.analisar_riscos, name='analisar_riscos')
]
