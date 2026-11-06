import requests
from inventario.models import Vulnerabilidade


class CVEService:
    def _extrair_metricas_nvd(self, item_cve: dict) -> tuple[float, str, str]:
        """Extrai baseScore, severidade e attackVector suportando CVSS v3.1, v3.0 e v2.0."""
        metrics = item_cve.get("metrics", {})
        for chave in ("cvssMetricV31", "cvssMetricV30"):
            lista = metrics.get(chave)
            if lista and isinstance(lista, list):
                cvss_data = lista[0].get("cvssData", {})
                score = float(cvss_data.get("baseScore", 0.0))
                sev = str(cvss_data.get("baseSeverity", "Medium")).capitalize()
                vetor = str(cvss_data.get("attackVector", "Network / Unauthenticated"))
                return score, sev, vetor

        lista_v2 = metrics.get("cvssMetricV2")
        if lista_v2 and isinstance(lista_v2, list):
            cvss_data = lista_v2[0].get("cvssData", {})
            score = float(cvss_data.get("baseScore", 0.0))
            sev_raw = lista_v2[0].get("baseSeverity") or ("High" if score >= 7.0 else "Medium")
            sev = str(sev_raw).capitalize()
            vetor = str(cvss_data.get("accessVector", "Network / Unauthenticated"))
            return score, sev, vetor

        return 0.0, "Medium", "Network / Unauthenticated"

    def buscar_e_salvar_cve(self, cve_id, dados_fallback=None):
        if not cve_id:
            return None

        cve_id = str(cve_id).strip().upper()
        dados_fallback = dados_fallback or {}
        modo = str(dados_fallback.get("modo", "")).lower()

        # Se o usuário escolheu explicitamente "Cadastro Manual", salva direto com os dados manuais
        if modo == "manual":
            vuln, _ = Vulnerabilidade.objects.update_or_create(
                cve_code=cve_id,
                defaults={
                    "descricao": dados_fallback.get("descricao") or "Vulnerabilidade registrada manualmente.",
                    "categoria": "Cibersegurança",
                    "severidade": dados_fallback.get("severidade", "High"),
                    "status": "Ativa" if dados_fallback.get("status") in (None, "", "Ativo", "Ativa") else dados_fallback.get("status"),
                    "score": float(dados_fallback.get("cvss", 0.0)),
                    "vetor_ataque": dados_fallback.get("vetor_ataque") or dados_fallback.get("vetorAtaque") or "Network / Unauthenticated",
                    "data_descoberta": dados_fallback.get("data_descoberta") or dados_fallback.get("dataDescoberta") or "",
                },
            )
            return vuln

        url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve_id}"

        try:
            response = requests.get(url, timeout=6)
            if response.status_code == 200:
                dados = response.json()

                if dados.get("vulnerabilities"):
                    item = dados["vulnerabilities"][0]["cve"]
                    descriptions = item.get("descriptions", [])
                    descricao = descriptions[0]["value"] if descriptions else f"Vulnerabilidade oficial {cve_id}"
                    publicado = item.get("published", "")[:10]

                    score, severidade, vetor_ataque = self._extrair_metricas_nvd(item)

                    vuln, criada = Vulnerabilidade.objects.get_or_create(
                        cve_code=cve_id,
                        defaults={
                            "descricao": descricao,
                            "categoria": "Cibersegurança",
                            "severidade": severidade,
                            "status": "Ativa",
                            "score": score,
                            "vetor_ataque": vetor_ataque,
                            "data_descoberta": publicado,
                        },
                    )

                    if criada:
                        print(f"✅ Nova falha {cve_id} salva no banco!")
                    else:
                        print(f"ℹ️ A falha {cve_id} já existia no banco.")
                    return vuln
        except Exception as e:
            print(f"Erro ao buscar CVE: {e}")

        # Se o usuário pediu busca exclusiva na API (modo == 'api'), não cria registro falso caso o NIST não encontre
        if modo == "api":
            return None

        # Fallback automático quando há dados manuais enviados junto na requisição
        tem_dados_manuais = any(
            k in dados_fallback for k in ("cvss", "descricao", "severidade", "vetor_ataque", "vetorAtaque")
        )
        if tem_dados_manuais:
            vuln, criada = Vulnerabilidade.objects.get_or_create(
                cve_code=cve_id,
                defaults={
                    "descricao": dados_fallback.get("descricao", "Vulnerabilidade registrada manualmente."),
                    "categoria": "Cibersegurança",
                    "severidade": dados_fallback.get("severidade", "High"),
                    "status": "Ativa" if dados_fallback.get("status") in (None, "", "Ativo", "Ativa") else dados_fallback.get("status"),
                    "score": float(dados_fallback.get("cvss", 0.0)),
                    "vetor_ataque": dados_fallback.get("vetor_ataque") or dados_fallback.get("vetorAtaque") or "Network / Unauthenticated",
                    "data_descoberta": dados_fallback.get("data_descoberta") or dados_fallback.get("dataDescoberta") or "",
                },
            )
            if criada:
                print(f"⚠️ CVE Manual {cve_id} salva via fallback do formulário!")
            return vuln

        return None
