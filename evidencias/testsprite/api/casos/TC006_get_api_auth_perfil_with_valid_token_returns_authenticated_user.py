import requests
import uuid
import sys

BASE_ENDPOINT = "http://localhost:3000"
TIMEOUT = 30

def test_get_api_auth_perfil_with_valid_token_returns_authenticated_user():
    registro_url = f"{BASE_ENDPOINT}/api/auth/registro"
    perfil_url = f"{BASE_ENDPOINT}/api/auth/perfil"

    # Prepare unique user data
    unique_suffix = uuid.uuid4().hex[:8]
    nombre = "TC006 Test User"
    email = f"tc006+{unique_suffix}@example.com"
    password = "StrongPass1"  # meets: >=8 chars, uppercase, lowercase, digit

    registro_payload = {
        "nombre": nombre,
        "email": email,
        "password": password
    }

    created_user_id = None
    token = None

    try:
        # Create user (registration)
        resp = requests.post(registro_url, json=registro_payload, headers={"Content-Type": "application/json"}, timeout=TIMEOUT)
        try:
            resp_json = resp.json()
        except ValueError:
            resp_json = None

        assert resp.status_code == 201, f"Expected 201 on registration, got {resp.status_code}, body: {resp_json}"
        assert isinstance(resp_json, dict), "Registration did not return a JSON object"
        assert "token" in resp_json, "Registration response missing 'token'"
        assert "usuario" in resp_json, "Registration response missing 'usuario'"

        token = resp_json["token"]
        usuario = resp_json["usuario"]
        # Extract user id with common field names
        created_user_id = usuario.get("uid") or usuario.get("id") or usuario.get("_id")

        # Basic checks on returned usuario
        assert usuario.get("nombre") == nombre, f"Returned nombre mismatch: expected {nombre}, got {usuario.get('nombre')}"
        assert usuario.get("email") == email, f"Returned email mismatch: expected {email}, got {usuario.get('email')}"
        assert usuario.get("rol") == "usuario", f"Expected rol 'usuario', got {usuario.get('rol')}"
        assert usuario.get("estado") is True or usuario.get("estado") == True, "Expected estado true"

        # Use the token to request perfil
        headers = {
            "x-token": token
        }
        resp_perfil = requests.get(perfil_url, headers=headers, timeout=TIMEOUT)
        try:
            perfil_json = resp_perfil.json()
        except ValueError:
            perfil_json = None

        assert resp_perfil.status_code == 200, f"Expected 200 on GET /api/auth/perfil, got {resp_perfil.status_code}, body: {perfil_json}"
        assert isinstance(perfil_json, dict), "Perfil response is not a JSON object"

        # The API may return the usuario object directly or wrapped; handle both
        perfil_obj = perfil_json.get("usuario") if "usuario" in perfil_json else perfil_json

        assert isinstance(perfil_obj, dict), "Perfil payload is not the expected user object"

        # Validate profile fields
        assert perfil_obj.get("nombre") == nombre, f"Perfil nombre mismatch: expected {nombre}, got {perfil_obj.get('nombre')}"
        assert perfil_obj.get("email") == email, f"Perfil email mismatch: expected {email}, got {perfil_obj.get('email')}"
        assert perfil_obj.get("rol") == "usuario", f"Perfil rol mismatch: expected 'usuario', got {perfil_obj.get('rol')}"
        # estado might be boolean True
        estado_val = perfil_obj.get("estado")
        assert estado_val is True or estado_val == True, f"Perfil estado expected true, got {estado_val}"

        # Optionally ensure id matches registration
        perfil_id = perfil_obj.get("uid") or perfil_obj.get("id") or perfil_obj.get("_id")
        if created_user_id is not None and perfil_id is not None:
            assert str(perfil_id) == str(created_user_id), f"Perfil id {perfil_id} does not match created user id {created_user_id}"

        print("TC006 passed: GET /api/auth/perfil with valid token returned authenticated user's profile data.")

    except requests.RequestException as e:
        raise AssertionError(f"HTTP request failed: {e}") from e
    finally:
        # Cleanup: attempt to delete the created user. Deletion requires admin role;
        # if not permitted, we ignore the failure to delete but report it.
        if created_user_id:
            delete_url = f"{BASE_ENDPOINT}/api/usuarios/{created_user_id}"
            headers = {"x-token": token} if token else {}
            try:
                del_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
                # If deletion succeeded (200), good. If forbidden (403) or unauthorized (401), cannot cleanup.
                if del_resp.status_code == 200:
                    try:
                        del_json = del_resp.json()
                    except ValueError:
                        del_json = None
                    # best-effort assertion: if deletion succeeded, ensure message present
                    if isinstance(del_json, dict):
                        msg = del_json.get("mensaje") or del_json.get("message")
                        assert msg is not None, "Delete returned 200 but no confirmation message found"
                else:
                    # Not a hard failure for the test; log to stderr for visibility
                    sys.stderr.write(f"Cleanup: could not delete user {created_user_id}, status {del_resp.status_code}\n")
            except requests.RequestException as ex:
                sys.stderr.write(f"Cleanup: HTTP request to delete user failed: {ex}\n")

if __name__ == "__main__":
    test_get_api_auth_perfil_with_valid_token_returns_authenticated_user()