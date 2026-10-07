from datetime import datetime
from modelos import Vulnerabilidade, SeveridadeVulnerabilidade, StatusTratamento
import time
from gerenciador import InventarioManager
from modelos import Equipamentos, Roteadores, Servidor, BancoDeDados, Notebook
from motor_matematico import MotorMatematico

def relogio():
    agora = datetime.now()
    fuso_horario = time.tzname[0]

    string_formatada = agora.strftime(f'at %Y-%m-%d %H:%M {fuso_horario}')

    return string_formatada



gerenciador = InventarioManager()

def carregar_rede_teste():
    roteador = Roteadores('100', 'Gateway-Principal', 'Admin', 'TI')
    servidor_web = Servidor('200', 'Web-Server-01', 'Admin', 'TI')
    noteb_TI = Notebook('102', 'Desktop', 'Admin', 'TI')
    noteb_RH = Notebook('101', 'Desktop', 'Admin', 'RH')
    servidor_apli = Servidor('201', 'APL-Server-01', 'Admion', 'TI')
    bdd = BancoDeDados('300', 'Dados', 'Admin', 'TI')

    falha_web = Vulnerabilidade("heap overflow", "possibilidade de codigo remoto", SeveridadeVulnerabilidade.CRITICA.name, StatusTratamento.ABERTO.name, 9.2)
    
    roteador.conexoes.extend(['200', '101', '102'])
    servidor_web.conexoes.append('201')
    servidor_apli.conexoes.append('300')
    noteb_TI.conexoes.append('201')
    servidor_web.adicionar_vulnerabilidade(falha_web)
    inv = [roteador, servidor_web, servidor_apli, noteb_TI, noteb_RH, bdd]
    
    gerenciador.adicionar_lote(inv)
    gerenciador.salvar_dados()

def simular_scan_nmap():
    print(
        f"Starting Nmap 7.01 ( https://nmap.org ) {relogio()}\n"
        "Nmap scan report for 192.168.1.1")

    a =0.090
    for i in gerenciador.inventario:
        print(f"Host is up ({round(a, 3)}s latency)")
        if len(i['conexoes']) == 1:
            print(f"O ativo {i['nome']} possui conexão com o id: {i['conexoes'][0]}")
        elif len(i['conexoes']) > 1:
            print(f"O ativo {i['nome']} possui conexão com os id:")
            for c in i['conexoes']:
                print(f"{c}")
        else:
            print(f"Nenhuma conexão encontrada no ativo: {i['nome']}")
        a += 0.001

carregar_rede_teste()

simular_scan_nmap()

mm = MotorMatematico()

solve = mm.calcular_risco_final()

for indice, ativo in enumerate(gerenciador.inventario):
    print(f"Risco calculado para {ativo['nome']}: {solve[indice]:.2f}")
