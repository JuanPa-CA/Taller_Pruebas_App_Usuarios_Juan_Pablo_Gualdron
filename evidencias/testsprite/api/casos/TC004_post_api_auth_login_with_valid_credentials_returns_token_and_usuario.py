import requests
import uuid
import os
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30  # seconds

def test_post_api_auth_login_with_valid_credentials_returns_token_and_usuario():
    registro_url = f"{BASE_URL}/api/auth/registro"
    login_url = f"{BASE_URL}/api/auth/login"
    usuarios_url_template = f"{BASE_URL}/api/usuarios/{{uid}}"

    unique_suffix = uuid.uuid4().hex[:8]
    email = f"testuser_{unique_suffix}@example.com"
    password = "StrongPass1"  # meets 8-64 chars, uppercase, lowercase, digit
    nombre = "Test User"

    headers = {"Content-Type": "application/json"}

    created_uid = None
    user_token = None

    try:
        # 1) Create a new user via /api/auth/registro
        payload_registro = {
            "nombre": nombre,
            "email": email,
            "password": password
        }
        try:
            resp = requests.post(registro_url, json=payload_registro, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Failed to call registro endpoint: {e}")

        assert resp.status_code == 201, f"Expected 201 from registro, got {resp.status_code}, body: {resp.text}"
        try:
            body = resp.json()
        except ValueError:
            raise AssertionError(f"registro response is not valid JSON: {resp.text}")

        assert "token" in body and isinstance(body["token"], str) and body["token"].strip() != "", "registro response missing valid token"
        assert "usuario" in body and isinstance(body["usuario"], dict), "registro response missing usuario object"
        usuario = body["usuario"]
        # Validate usuario fields per PRD
        for key in ("uid", "nombre", "email", "rol", "estado"):
            assert key in usuario, f"registro.usuario missing '{key}'"
        created_uid = usuario.get("uid")
        assert usuario.get("email") == email, f"registro.usuario.email expected {email}, got {usuario.get('email')}"
        assert usuario.get("nombre") == nombre, f"registro.usuario.nombre expected {nombre}, got {usuario.get('nombre')}"
        assert usuario.get("rol") == "usuario", f"registro.usuario.rol expected 'usuario', got {usuario.get('rol')}"
        assert usuario.get("estado") is True, f"registro.usuario.estado expected True, got {usuario.get('estado')}"

        # 2) Login with the same credentials via /api/auth/login
        payload_login = {
            "email": email,
            "password": password
        }
        try:
            resp_login = requests.post(login_url, json=payload_login, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Failed to call login endpoint: {e}")

        assert resp_login.status_code == 200, f"Expected 200 from login, got {resp_login.status_code}, body: {resp_login.text}"
        try:
            login_body = resp_login.json()
        except ValueError:
            raise AssertionError(f"login response is not valid JSON: {resp_login.text}")

        assert "token" in login_body and isinstance(login_body["token"], str) and login_body["token"].strip() != "", "login response missing valid token"
        assert "usuario" in login_body and isinstance(login_body["usuario"], dict), "login response missing usuario object"
        login_usuario = login_body["usuario"]
        for key in ("uid", "nombre", "email", "rol", "estado"):
            assert key in login_usuario, f"login.usuario missing '{key}'"
        assert login_usuario.get("email") == email, f"login.usuario.email expected {email}, got {login_usuario.get('email')}"
        assert login_usuario.get("nombre") == nombre, f"login.usuario.nombre expected {nombre}, got {login_usuario.get('nombre')}"
        assert login_usuario.get("rol") == "usuario", f"login.usuario.rol expected 'usuario', got {login_usuario.get('rol')}"
        assert login_usuario.get("estado") is True, f"login.usuario.estado expected True, got {login_usuario.get('estado')}"

        # store token for potential cleanup
        user_token = login_body["token"]

        print("TEST PASSED: POST /api/auth/login returned 200 with token and usuario")

    finally:
        # Attempt cleanup: delete created user if possible.
        # Deleting users requires admin privileges. If ADMIN_EMAIL and ADMIN_PASSWORD are provided as env vars,
        # use them to obtain an admin token and delete the created user. Otherwise, attempt deletion without auth
        # but do not fail the test if deletion is not permitted.
        if not created_uid:
            return

        admin_email = os.getenv("ADMIN_EMAIL")
        admin_password = os.getenv("ADMIN_PASSWORD")

        delete_url = usuarios_url_template.format(uid=created_uid)

        # helper to try delete with given token
        def try_delete_with_token(token):
            h = {"x-token": token}
            try:
                r = requests.delete(delete_url, headers=h, timeout=TIMEOUT)
                return r
            except requests.RequestException:
                return None

        cleanup_error = None

        if admin_email and admin_password:
            # get admin token
            try:
                r_admin_login = requests.post(login_url, json={"email": admin_email, "password": admin_password}, headers=headers, timeout=TIMEOUT)
            except requests.RequestException as e:
                cleanup_error = f"Failed to login as admin for cleanup: {e}"
                r_admin_login = None

            if r_admin_login and r_admin_login.status_code == 200:
                try:
                    admin_body = r_admin_login.json()
                    admin_token = admin_body.get("token")
                    if admin_token:
                        r_del = try_delete_with_token(admin_token)
                        if r_del is None:
                            cleanup_error = "Admin delete request failed (network error)."
                        else:
                            # Successful deletion should return 200 per PRD, but handle other statuses gracefully
                            if r_del.status_code == 200:
                                print(f"Cleanup: deleted user {created_uid} with admin account.")
                            else:
                                cleanup_error = f"Admin attempted delete returned status {r_del.status_code}, body: {r_del.text}"
                    else:
                        cleanup_error = "Admin login did not return token for cleanup."
                except ValueError:
                    cleanup_error = f"Admin login response not JSON: {r_admin_login.text}"
            else:
                cleanup_error = f"Admin login failed with status {r_admin_login.status_code if r_admin_login else 'N/A'}."

        else:
            # No admin creds: attempt delete with the user's own token (will likely fail with 403/401)
            if user_token:
                r_del = try_delete_with_token(user_token)
                if r_del is None:
                    cleanup_error = "User delete request failed (network error)."
                else:
                    if r_del.status_code == 200:
                        print(f"Cleanup: deleted user {created_uid} using user token (unexpected success).")
                    else:
                        cleanup_error = f"Attempted delete with user token returned {r_del.status_code}; cleanup skipped."
            else:
                cleanup_error = "No token available to attempt cleanup."

        if cleanup_error:
            # Do not fail the test for cleanup issues; just print to stderr for visibility.
            print(f"CLEANUP NOTICE: {cleanup_error}", file=sys.stderr)


if __name__ == "__main__":
    test_post_api_auth_login_with_valid_credentials_returns_token_and_usuario()