import requests
import re

def validar_formato_cve(cve_id: str):
    """Valida se a string corresponde ao padrão estrito de um CVE."""
    CVE_REGEX = re.compile(r"^CVE-(?:1999|20[0-2][0-6])-\d{4,}$")
    # É recomendado converter para maiúsculas para evitar erros de digitação do usuário
    return bool(CVE_REGEX.match(cve_id.strip().upper()))


def ver_CVE():
    while True:
        cve_id = str(input("Digite o codigo do CVE: "))
        if not validar_formato_cve(cve_id):
            print(
                f"Erro: '{cve_id}' não está no formato correto de um CVE (Exemplo:"
                " CVE-2024-1234)."
            )
        else:
            print(f"Formato válido! Consultando bando de dados NVD para {cve_id}")
            break

    url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve_id}"

    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            total_resultados = data.get("totalResults", 0)

            if total_resultados > 0:
                print(f"O CVE {cve_id} existe na base da NVD")
                return data
            else:
                print(
                    f"O CVE {cve_id} NÃO foi encontrado na NVD. Iniciando processo de"
                    " criação de um novo CVE no sistema..."
                )
                return None
        elif response.status_code == 400:
            print(
                f"CVE {cve_id} não encontrado (404). Criando novo CVE no sistema..."
            )
            return None
        else:
            print(f"Erro na API da NVD: Status code {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Erro de conexão ao acessar a API: {e}")
        return None