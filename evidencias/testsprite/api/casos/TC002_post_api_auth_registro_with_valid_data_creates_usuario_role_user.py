import requests
import uuid
import os
import sys
import traceback

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_auth_registro_creates_usuario_role_user():
    unique_suffix = uuid.uuid4().hex[:8]
    nombre = f"Test User {unique_suffix}"
    email = f"testuser_{unique_suffix}@example.com"
    # Strong password: >=8 chars, uppercase, lowercase, digit
    password = f"StrongPass1{unique_suffix[:4]}"

    url = f"{BASE_URL}/api/auth/registro"
    headers = {"Content-Type": "application/json"}
    payload = {"nombre": nombre, "email": email, "password": password}

    created_uid = None
    created_token = None

    try:
        # Send registration request
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except Exception:
        traceback.print_exc()
        raise

    # Validate successful creation
    try:
        assert resp is not None, "No response received from server"
        assert resp.status_code == 201, f"Expected status 201, got {resp.status_code}, body: {resp.text}"

        try:
            body = resp.json()
        except ValueError:
            raise AssertionError(f"Response is not JSON: {resp.text}")

        # Required top-level fields: token and usuario
        assert "token" in body, f"'token' not in response JSON: {body}"
        assert isinstance(body["token"], str) and body["token"], "'token' must be a non-empty string"

        assert "usuario" in body, f"'usuario' not in response JSON: {body}"
        usuario = body["usuario"]
        assert isinstance(usuario, dict), "'usuario' must be an object"

        # Validate usuario fields according to PRD
        # uid, nombre, email, rol == "usuario", estado == True
        # uid may be named 'uid' according to PRD
        assert "uid" in usuario, f"'uid' not present in usuario: {usuario}"
        created_uid = usuario.get("uid")
        assert isinstance(created_uid, str) and created_uid, "'uid' must be a non-empty string"

        assert usuario.get("nombre") == nombre, f"Expected nombre '{nombre}', got '{usuario.get('nombre')}'"
        assert usuario.get("email") == email, f"Expected email '{email}', got '{usuario.get('email')}'"
        assert usuario.get("rol") == "usuario", f"Expected rol 'usuario', got '{usuario.get('rol')}'"
        # estado should be True (active)
        assert usuario.get("estado") is True, f"Expected estado True, got {usuario.get('estado')}"

        created_token = body["token"]

        print("Test passed: user created with role 'usuario' and returned token and usuario data.")
    except AssertionError:
        # Print response for debugging then re-raise
        print(f"Assertion failed. Response status: {resp.status_code}, body: {resp.text}", file=sys.stderr)
        raise

    finally:
        # Cleanup: attempt to delete created user.
        # Deletion endpoint requires admin x-token. If ADMIN_X_TOKEN env var is set, use it.
        if created_uid:
            delete_url = f"{BASE_URL}/api/usuarios/{created_uid}"
            admin_token = os.environ.get("ADMIN_X_TOKEN") or os.environ.get("ADMIN_TOKEN")
            # Try with admin token if available
            headers_del = {}
            if admin_token:
                headers_del["x-token"] = admin_token
            else:
                # As a fallback, try to use the created user's token (likely to result in 403)
                if created_token:
                    headers_del["x-token"] = created_token

            try:
                del_resp = requests.delete(delete_url, headers=headers_del, timeout=TIMEOUT)
                # Do not fail the test if cleanup cannot delete (e.g., lack of admin rights).
                if del_resp.status_code == 200:
                    try:
                        del_body = del_resp.json()
                        print(f"Cleanup: deleted user {created_uid}: {del_body}")
                    except Exception:
                        print(f"Cleanup: deleted user {created_uid}, non-JSON response: {del_resp.text}")
                else:
                    print(f"Cleanup: could not delete user {created_uid}, status {del_resp.status_code}, body: {del_resp.text}")
            except Exception:
                print("Cleanup: exception while attempting to delete created user", file=sys.stderr)
                traceback.print_exc()


if __name__ == "__main__":
    test_post_api_auth_registro_creates_usuario_role_user()