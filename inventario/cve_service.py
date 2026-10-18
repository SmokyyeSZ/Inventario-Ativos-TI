import requests
from inventario.models import Vulnerabilidade

class CVEService:
    def buscar_e_salvar_cve(self, cve_id, dados_fallback=None):
        url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve_id}"

        try:
            response = requests.get(url)
            if response.status_code == 200:
                dados = response.json()

                if dados.get('vulnerabilities'):
                    item = dados["vulnerabilities"][0]["cve"]
                    descricao = item["descriptions"][0]["value"]
                    publicado = item.get("published", "")[:10]

                    try:
                        metricas = item["metrics"]["cvssMetricV31"][0]["cvssData"]
                        score = metricas["baseScore"]
                        severidade = metricas["baseSeverity"].capitalize()
                        vetor_ataque = metricas.get("attackVector", "Network / Unauthenticated")
                    except KeyError:
                        score = 0.0
                        severidade = "Medium"
                        vetor_ataque = "Network / Unauthenticated"

                    vuln, criada = Vulnerabilidade.objects.get_or_create(
                        cve_code=cve_id,
                        defaults={
                            'descricao': descricao,
                            'categoria': 'Cibersegurança',
                            'severidade': severidade,
                            'status': 'Ativa',
                            'score': score,
                            'vetor_ataque': vetor_ataque,
                            'data_descoberta': publicado,
                        }
                    )

                    if criada:
                        print(f"✅ Nova falha {cve_id} salva no banco!")
                    else:
                        print(f"ℹ️ A falha {cve_id} já existia no banco.")
                    return vuln
        except Exception as e:
            print(f"Erro ao buscar CVE: {e}")

        if dados_fallback:
            vuln, criada = Vulnerabilidade.objects.get_or_create(
                cve_code=cve_id,
                defaults={
                    'descricao': dados_fallback.get('descricao', 'Vulnerabilidade registrada manualmente.'),
                    'categoria': 'Cibersegurança',
                    'severidade': dados_fallback.get('severidade', 'High'),
                    'status': dados_fallback.get('status', 'Ativa'),
                    'score': dados_fallback.get('cvss', 0.0),
                    'vetor_ataque': dados_fallback.get('vetor_ataque', 'Network / Unauthenticated'),
                    'data_descoberta': dados_fallback.get('data_descoberta', ''),
                }
            )
            if criada:
                print(f"⚠️ CVE Manual {cve_id} salva via fallback do formulário!")
            return vuln

        return None