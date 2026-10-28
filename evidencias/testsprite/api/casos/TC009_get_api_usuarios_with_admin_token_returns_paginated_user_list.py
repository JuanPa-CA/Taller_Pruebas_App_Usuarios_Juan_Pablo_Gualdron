import requests
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30.0

def test_tc009_get_api_usuarios_with_admin_token():
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": "admin@demo.com",
        "password": "Admin123!"
    }
    try:
        resp = requests.post(login_url, json=login_payload, headers={"Content-Type": "application/json"}, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Login request failed: {e}")

    if resp.status_code != 200:
        raise AssertionError(f"Expected 200 from login, got {resp.status_code}. Body: {resp.text}")

    try:
        login_data = resp.json()
    except ValueError:
        raise AssertionError(f"Login response is not valid JSON. Body: {resp.text}")

    token = login_data.get("token")
    if not token or not isinstance(token, str):
        raise AssertionError(f"Login did not return a valid token. Response: {login_data}")

    headers = {"x-token": token}

    # 1) GET /api/usuarios with default params
    usuarios_url = f"{BASE_URL}/api/usuarios"
    try:
        resp_list = requests.get(usuarios_url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"GET /api/usuarios request failed: {e}")

    if resp_list.status_code != 200:
        raise AssertionError(f"Expected 200 from GET /api/usuarios, got {resp_list.status_code}. Body: {resp_list.text}")

    try:
        list_data = resp_list.json()
    except ValueError:
        raise AssertionError(f"GET /api/usuarios did not return JSON. Body: {resp_list.text}")

    # Validate top-level pagination keys
    for key in ("total", "pagina", "limite", "totalPaginas", "usuarios"):
        if key not in list_data:
            raise AssertionError(f"Missing key '{key}' in response: {list_data}")

    if not isinstance(list_data["usuarios"], list):
        raise AssertionError(f"'usuarios' should be a list. Got: {type(list_data['usuarios'])}")

    # Validate user object schema and that listed users are active
    for u in list_data["usuarios"]:
        if not isinstance(u, dict):
            raise AssertionError(f"Each usuario must be an object. Found: {u}")
        for field in ("uid", "nombre", "email", "rol", "estado"):
            if field not in u:
                raise AssertionError(f"Usuario missing field '{field}': {u}")
        if not isinstance(u["uid"], str) or not u["uid"]:
            raise AssertionError(f"Invalid uid in usuario: {u}")
        if not isinstance(u["nombre"], str):
            raise AssertionError(f"Invalid nombre in usuario: {u}")
        if not isinstance(u["email"], str):
            raise AssertionError(f"Invalid email in usuario: {u}")
        if u["rol"] not in ("admin", "usuario"):
            raise AssertionError(f"Invalid rol in usuario: {u}")
        if u["estado"] is not True:
            raise AssertionError(f"Usuario listed must have estado=true. Found: {u}")

    # 2) GET /api/usuarios with search, role, page and limit params
    params = {"buscar": "admin", "rol": "admin", "pagina": 1, "limite": 5}
    try:
        resp_filtered = requests.get(usuarios_url, headers=headers, params=params, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"GET /api/usuarios with params request failed: {e}")

    if resp_filtered.status_code != 200:
        raise AssertionError(f"Expected 200 from filtered GET /api/usuarios, got {resp_filtered.status_code}. Body: {resp_filtered.text}")

    try:
        filtered_data = resp_filtered.json()
    except ValueError:
        raise AssertionError(f"Filtered GET /api/usuarios did not return JSON. Body: {resp_filtered.text}")

    # Validate pagination fields reflect the requested values (cast to int if necessary)
    try:
        pagina = int(filtered_data.get("pagina"))
        limite = int(filtered_data.get("limite"))
    except Exception:
        raise AssertionError(f"pagina/limite not integers in response: {filtered_data}")

    if pagina != 1:
        raise AssertionError(f"Expected pagina=1 in filtered response, got {pagina}")
    if limite != 5:
        raise AssertionError(f"Expected limite=5 in filtered response, got {limite}")

    if not isinstance(filtered_data.get("usuarios"), list):
        raise AssertionError(f"'usuarios' should be a list in filtered response. Got: {type(filtered_data.get('usuarios'))}")

    # If users returned, they must match role filter and be active; if buscar returned results, check name/email contains search term
    search_term = params["buscar"].lower()
    for u in filtered_data["usuarios"]:
        if u.get("rol") != "admin":
            raise AssertionError(f"Filtered by rol=admin but returned usuario with rol={u.get('rol')}: {u}")
        if u.get("estado") is not True:
            raise AssertionError(f"Filtered response includes inactive usuario: {u}")
        # Check buscar applied if there are results
        nombre = (u.get("nombre") or "").lower()
        email = (u.get("email") or "").lower()
        if search_term and not (search_term in nombre or search_term in email):
            raise AssertionError(f"Usuario does not match buscar='{search_term}': {u}")

    print("TC009 passed: GET /api/usuarios with admin token returned valid paginated results.")

if __name__ == "__main__":
    try:
        test_tc009_get_api_usuarios_with_admin_token()
    except AssertionError as e:
        print(f"Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error during test: {e}")
        sys.exit(2)
    sys.exit(0)