#!/usr/bin/env python3
"""
Executor Multiplataforma de Testes — JESTER RISK (Windows & Linux)
Pode ser executado diretamente com:
    python testar_projeto.py
Redireciona automaticamente para o interpretador do venv (se existir)
e inicia a suíte completa do Pytest.
"""

import os
import sys
import subprocess
from pathlib import Path


def localizar_python_venv(raiz: Path) -> str:
    """Detecta automaticamente o Python do ambiente virtual no Windows ou Linux."""
    candidatos = [
        raiz / "venv" / "Scripts" / "python.exe",  # Windows
        raiz / ".venv" / "Scripts" / "python.exe", # Windows (.venv)
        raiz / "venv" / "bin" / "python",          # Linux / macOS
        raiz / ".venv" / "bin" / "python",         # Linux / macOS (.venv)
    ]
    for caminho in candidatos:
        if caminho.exists():
            return str(caminho)
    return sys.executable


def main() -> int:
    raiz = Path(__file__).resolve().parent
    os.chdir(raiz)

    python_exec = localizar_python_venv(raiz)
    args_extras = sys.argv[1:]

    comando = [python_exec, "-m", "pytest"] + args_extras
    resultado = subprocess.run(comando)
    return resultado.returncode


if __name__ == "__main__":
    raise SystemExit(main())

