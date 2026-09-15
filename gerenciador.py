import json
from modelos import Ativo

class InventarioManager:
    """Interage, organiza e salva os dados no banco JSON."""
    def __init__(self):
        self.arquivo_db = "inventario.json"
        self.inventario = self.carregar_dados()

    def carregar_dados(self):
        try:
            with open(self.arquivo_db, 'r', encoding='utf-8') as arquivo:
                dados = json.load(arquivo)
                print("\033[32m[SUCESSO] Dados carregados com sucesso.\033[0m")
                return dados
        except FileNotFoundError:
            print("\033[33m[AVISO] Nenhum arquivo de base encontrado. Iniciando inventário vazio.\033[0m")
            return {}

    def salvar_dados(self):
        try:
            with open(self.arquivo_db, 'w', encoding='utf-8') as arquivo:
                json.dump(self.inventario, arquivo, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"\033[31m[ERRO] Erro ao salvar os dados: {e}\033[0m")

    def adicionar_ativo(self, ativo: Ativo):
        if ativo.id_ativo in self.inventario:
            return False
        else:
            self.inventario[ativo.id_ativo] = ativo.to_dict()

        self.salvar_dados()
        return True