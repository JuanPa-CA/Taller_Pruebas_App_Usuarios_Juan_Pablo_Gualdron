import requests
import uuid
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30.0
ADMIN_EMAIL = "admin@demo.com"
ADMIN_PASSWORD = "Admin123!"

def test_delete_api_usuarios_id_with_admin_token_logical_delete_and_self_protection():
    admin_token = None
    created_user_id = None

    try:
        # 1) Login as admin to obtain JWT
        login_url = f"{BASE_URL}/api/auth/login"
        login_payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 from login, got {resp.status_code}, body: {resp.text}"
        login_json = resp.json()
        assert "token" in login_json, f"Login response missing token: {login_json}"
        admin_token = login_json["token"]

        # Try to get admin profile to reliably obtain admin id
        perfil_url = f"{BASE_URL}/api/auth/perfil"
        headers = {"x-token": admin_token}
        resp = requests.get(perfil_url, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 from perfil, got {resp.status_code}, body: {resp.text}"
        perfil_json = resp.json()
        # Extract admin id robustly
        admin_id = perfil_json.get("uid") or perfil_json.get("_id") or perfil_json.get("id")
        assert admin_id, f"Could not determine admin id from perfil: {perfil_json}"

        # 2) Create a new user as admin to delete (resource id not provided)
        create_url = f"{BASE_URL}/api/usuarios"
        unique_email = f"testuser+{int(time.time())}-{uuid.uuid4().hex[:6]}@demo.test"
        create_payload = {
            "nombre": "Test User",
            "email": unique_email,
            "password": "StrongPass1",
            "rol": "usuario"
        }
        headers = {"x-token": admin_token, "Content-Type": "application/json"}
        resp = requests.post(create_url, json=create_payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Expected 201 creating user, got {resp.status_code}, body: {resp.text}"
        created_json = resp.json()
        # created_json may be the usuario object or wrap it; try to extract usuario
        if isinstance(created_json, dict) and ("usuario" in created_json and isinstance(created_json["usuario"], dict)):
            usuario_obj = created_json["usuario"]
        else:
            usuario_obj = created_json
        created_user_id = usuario_obj.get("uid") or usuario_obj.get("_id") or usuario_obj.get("id")
        assert created_user_id, f"Created user response missing id: {created_json}"

        # 3) Delete the created user with admin token -> should logically delete (estado=false) and return 200
        delete_url = f"{BASE_URL}/api/usuarios/{created_user_id}"
        resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 deleting other user, got {resp.status_code}, body: {resp.text}"
        delete_json = resp.json()
        # validate message and usuario.estado == False
        assert isinstance(delete_json, dict), f"Delete response not JSON object: {delete_json}"
        assert "mensaje" in delete_json, f"Delete response missing 'mensaje': {delete_json}"
        # check usuario inside response
        deleted_usuario = delete_json.get("usuario")
        assert deleted_usuario and isinstance(deleted_usuario, dict), f"Delete response missing 'usuario' object: {delete_json}"
        # estado expected to be False (logical delete)
        estado_val = deleted_usuario.get("estado")
        assert estado_val is False, f"Expected usuario.estado to be False after delete, got {estado_val}. Full usuario: {deleted_usuario}"

        # After successful deletion, clear created_user_id since it's logically deleted (cleanup not needed)
        created_user_id = None

        # 4) Attempt to delete admin's own account -> should return 400
        delete_admin_url = f"{BASE_URL}/api/usuarios/{admin_id}"
        resp = requests.delete(delete_admin_url, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 400, f"Expected 400 when admin attempts to delete own account, got {resp.status_code}, body: {resp.text}"

    except requests.exceptions.RequestException as e:
        raise AssertionError(f"HTTP request failed: {e}")
    finally:
        # Cleanup: if created_user_id still exists (test failed before deletion), attempt to delete it
        if created_user_id:
            try:
                headers = {"x-token": admin_token} if admin_token else {}
                cleanup_url = f"{BASE_URL}/api/usuarios/{created_user_id}"
                # Try delete; accept 200 or 404 or 400 depending on state, but don't raise
                requests.delete(cleanup_url, headers=headers, timeout=TIMEOUT)
            except Exception:
                pass

if __name__ == "__main__":
    test_delete_api_usuarios_id_with_admin_token_logical_delete_and_self_protection()