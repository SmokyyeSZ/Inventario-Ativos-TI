import requests
import re

def validar_formato_cve(cve_id: str):
    """Valida se a string corresponde ao padrão estrito de um CVE."""
    CVE_REGEX = re.compile(r"^CVE-(?:1999|20[0-2][0-6])-\d{4,}$")

    return bool(CVE_REGEX.match(cve_id.strip().upper()))


def ver_CVE():
    while True:
        cve_id = str(input("Digite o codigo do CVE: "))
        if not validar_formato_cve(cve_id):
            print(f"\033[31m[ERRO] '{cve_id}' não está no formato correto (Ex: CVE-2024-1234).\033[0m")
        else:
            print(f"\033[36m[INFO] Formato válido! Consultando banco de dados NVD para {cve_id}...\033[0m")
            break

    url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve_id}"

    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            total_resultados = data.get("totalResults", 0)

            if total_resultados > 0:
                print(f"\033[32m[SUCESSO] O CVE {cve_id} existe na base da NVD!\033[0m")
                return data
            else:
                print(f"\n\033[33m[AVISO] O CVE {cve_id} NÃO foi encontrado na NVD. Iniciando criação manual...\033[0m")
                return None
        elif response.status_code == 400:
            print(f"\n\033[33m[AVISO] CVE {cve_id} não encontrado (404). Criando novo CVE no sistema...\033[0m")
            return None
        else:
            print(f"\033[31m[ERRO] Erro na API da NVD: Status code {response.status_code}\033[0m")
            return None
    except requests.exceptions.RequestException as e:
        print(f"\033[31m[ERRO] Erro de conexão ao acessar a API: {e}\033[0m")
        return None