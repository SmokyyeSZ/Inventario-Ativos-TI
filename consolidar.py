import os

NOME_DA_PASTA_DO_PROJETO = "Inventario-Ativos-TI"  

IGNORE_DIRS = {'venv', '.git', '__pycache__', 'staticfiles', 'media', 'migrations', '.pytest_cache'}
IGNORE_FILES = {'db.sqlite3', 'consolidar.py', '.gitignore', 'package-lock.json', 'contexto_projeto.txt'}
VALID_EXTENSIONS = {'.py', '.html', '.css', '.js', '.md', '.txt', '.json'}

def consolidar_projeto(diretorio_raiz, arquivo_saida):
    if not os.path.exists(diretorio_raiz):
        print(f"Erro: A pasta '{diretorio_raiz}' não foi encontrada no diretório atual.")
        return

    with open(arquivo_saida, 'w', encoding='utf-8') as out:
        for raiz, dirs, arquivos in os.walk(diretorio_raiz):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for arquivo in arquivos:
                if arquivo in IGNORE_FILES:
                    continue
                
                ext = os.path.splitext(arquivo)[1]
                if ext in VALID_EXTENSIONS:
                    caminho_completo = os.path.join(raiz, arquivo)
                    caminho_relativo = os.path.relpath(caminho_completo, diretorio_raiz)
                    
                    out.write(f"\n{'='*40}\n")
                    out.write(f"ARQUIVO: {caminho_relativo}\n")
                    out.write(f"{'='*40}\n\n")
                    
                    try:
                        with open(caminho_completo, 'r', encoding='utf-8') as f:
                            out.write(f.read())
                    except Exception as e:
                        out.write(f"[Erro ao ler arquivo: {e}]\n")

if __name__ == "__main__":
    consolidar_projeto(NOME_DA_PASTA_DO_PROJETO, 'contexto_projeto.txt')
    print(f"Sucesso! Apenas os arquivos de '{NOME_DA_PASTA_DO_PROJETO}' foram salvos em 'contexto_projeto.txt'.")
