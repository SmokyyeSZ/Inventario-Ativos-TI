import os

# Detecta automaticamente a pasta onde o consolidar.py está localizado
DIRETORIO_PROJETO = os.path.dirname(os.path.abspath(__file__))
ARQUIVO_SAIDA = os.path.join(DIRETORIO_PROJETO, 'contexto_projeto.txt')

# Pastas pesadas de bibliotecas, builds, caches e banco/migrações que NÃO devem ir
IGNORE_DIRS = {
    'venv', '.venv', 'env', '.git', '__pycache__', 'staticfiles',
    'media', 'migrations', '.pytest_cache', 'node_modules', 'dist',
    'build', '.vite', 'coverage', ' docs', 'assets'
}

# Arquivos de lock, binários, bancos locais ou gerados automaticamente que NÃO precisam ir
IGNORE_FILES = {
    'db.sqlite3', 'consolidar.py', '.gitignore', 'package-lock.json',
    'bun.lock', 'yarn.lock', 'pnpm-lock.yaml', 'contexto_projeto.txt',
    '.env', '__init__.py', 'metadata.json'
}

# Extensões de código e configuração relevantes para estudo e apresentação
VALID_EXTENSIONS = {
    '.py', '.html', '.css', '.js', '.md', '.txt', '.json',
    '.ts', '.tsx', '.yml', '.yaml', '.sh', '.conf', '.ini', '.example'
}

# Arquivos importantes que não possuem extensão no nome (ex: Dockerfile)
VALID_EXACT_NAMES = {'Dockerfile'}


def deve_incluir_arquivo(arquivo, caminho_relativo):
    if arquivo in IGNORE_FILES:
        return False

    # Ignora o README genérico do template dentro de frontend/, mantendo o README.md principal da raiz
    if caminho_relativo.replace('\\', '/') == 'frontend/README.md':
        return False

    ext = os.path.splitext(arquivo)[1].lower()
    return (ext in VALID_EXTENSIONS) or (arquivo in VALID_EXACT_NAMES)


def consolidar_projeto(diretorio_raiz, arquivo_saida):
    if not os.path.exists(diretorio_raiz):
        print(f"Erro: A pasta '{diretorio_raiz}' não foi encontrada.")
        return

    arquivos_coletados = []

    for raiz, dirs, arquivos in os.walk(diretorio_raiz):
        # Filtra as pastas ignoradas in-place e ordena para manter saída determinística
        dirs[:] = sorted([d for d in dirs if d not in IGNORE_DIRS])

        for arquivo in sorted(arquivos):
            caminho_completo = os.path.join(raiz, arquivo)
            caminho_relativo = os.path.relpath(caminho_completo, diretorio_raiz)

            if deve_incluir_arquivo(arquivo, caminho_relativo):
                arquivos_coletados.append((caminho_relativo, caminho_completo))

    with open(arquivo_saida, 'w', encoding='utf-8') as out:
        out.write("================================================================================\n")
        out.write("PROJETO: JESTER RISK — INVENTÁRIO DE ATIVOS DE TI & PROPAGAÇÃO ESPECTRAL\n")
        out.write(f"TOTAL DE ARQUIVOS CONSOLIDADOS: {len(arquivos_coletados)}\n")
        out.write("================================================================================\n\n")
        out.write("ESTRUTURA DE ARQUIVOS INCLUÍDOS:\n")
        for rel, _ in arquivos_coletados:
            out.write(f"  - {rel}\n")
        out.write("\n")

        for caminho_relativo, caminho_completo in arquivos_coletados:
            out.write(f"\n{'='*60}\n")
            out.write(f"ARQUIVO: {caminho_relativo}\n")
            out.write(f"{'='*60}\n\n")

            try:
                # 1ª tentativa: padrão UTF-8
                with open(caminho_completo, 'r', encoding='utf-8') as f:
                    out.write(f.read())
            except UnicodeDecodeError:
                # 2ª tentativa: UTF-16 (comum em arquivos gerados pelo PowerShell no Windows)
                try:
                    with open(caminho_completo, 'r', encoding='utf-16') as f:
                        out.write(f.read())
                except Exception as e:
                    out.write(f"[Erro ao ler arquivo: {e}]\n")
            except Exception as e:
                out.write(f"[Erro ao ler arquivo: {e}]\n")

    print(f"Sucesso! {len(arquivos_coletados)} arquivos essenciais foram consolidados em:\n -> {arquivo_saida}")


if __name__ == "__main__":
    consolidar_projeto(DIRETORIO_PROJETO, ARQUIVO_SAIDA)
