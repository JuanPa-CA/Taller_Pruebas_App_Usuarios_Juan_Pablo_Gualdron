import requests
import os
import time
import random
import string
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30  # seconds

def random_email():
    ts = int(time.time() * 1000)
    rand = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"testuser_{rand}_{ts}@example.com"

def safe_json(resp):
    try:
        return resp.json()
    except ValueError:
        return None

def test_put_auth_password_with_correct_current_password():
    # Prepare unique user credentials
    nombre = "Test User"
    email = random_email()
    initial_password = "InitPass1A"   # meets rules: uppercase, lowercase, digit, >=8
    new_password = "NewPass2B"        # different and meets rules

    created_user_id = None
    created_user_token = None

    try:
        # 1) Register a new user
        reg_url = f"{BASE_URL}/api/auth/registro"
        reg_payload = {
            "nombre": nombre,
            "email": email,
            "password": initial_password
        }
        reg_resp = requests.post(reg_url, json=reg_payload, timeout=TIMEOUT)
        assert reg_resp.status_code == 201, f"Expected 201 on registration, got {reg_resp.status_code}, body: {reg_resp.text}"
        reg_json = safe_json(reg_resp)
        assert isinstance(reg_json, dict), f"Registration did not return JSON. Body: {reg_resp.text}"
        assert "token" in reg_json, f"Registration response missing token: {reg_json}"
        assert "usuario" in reg_json and isinstance(reg_json["usuario"], dict), f"Registration response missing usuario: {reg_json}"

        created_user_token = reg_json["token"]
        # Extract user id from usuario (try common keys)
        usuario = reg_json["usuario"]
        created_user_id = usuario.get("uid") or usuario.get("id") or usuario.get("_id")
        # created_user_id may be None; we'll still attempt cleanup later if admin creds provided

        # 2) Call PUT /api/auth/password with correct current password and new password
        put_url = f"{BASE_URL}/api/auth/password"
        headers = {"x-token": created_user_token}
        put_payload = {
            "passwordActual": initial_password,
            "passwordNueva": new_password
        }
        put_resp = requests.put(put_url, json=put_payload, headers=headers, timeout=TIMEOUT)
        assert put_resp.status_code == 200, f"Expected 200 on password change, got {put_resp.status_code}, body: {put_resp.text}"
        put_json = safe_json(put_resp)
        assert isinstance(put_json, dict), f"Password change did not return JSON. Body: {put_resp.text}"
        mensaje = put_json.get("mensaje")
        assert mensaje == "Contraseña actualizada", f"Unexpected message on password change: {put_json}"

        # 3) Verify that login with old password fails (401) and login with new password succeeds (200)
        login_url = f"{BASE_URL}/api/auth/login"
        # Old password attempt
        old_login_payload = {"email": email, "password": initial_password}
        old_login_resp = requests.post(login_url, json=old_login_payload, timeout=TIMEOUT)
        # According to PRD, wrong password should return 401 with "Credenciales inválidas"
        assert old_login_resp.status_code == 401, f"Expected 401 when logging in with old password, got {old_login_resp.status_code}, body: {old_login_resp.text}"
        old_login_json = safe_json(old_login_resp)
        # The message might be in body; accept either a JSON with message or generic 401
        if isinstance(old_login_json, dict):
            # Could be {"msg": "..."} or {"message": "..."} or plain text. We won't be too strict here.
            pass

        # New password attempt
        new_login_payload = {"email": email, "password": new_password}
        new_login_resp = requests.post(login_url, json=new_login_payload, timeout=TIMEOUT)
        assert new_login_resp.status_code == 200, f"Expected 200 when logging in with new password, got {new_login_resp.status_code}, body: {new_login_resp.text}"
        new_login_json = safe_json(new_login_resp)
        assert isinstance(new_login_json, dict) and "token" in new_login_json, f"Login with new password did not return token: {new_login_resp.text}"

        print("TEST PASSED: Password changed successfully and login behavior is correct.")

    except AssertionError as ae:
        print(f"TEST FAILED: {ae}")
        raise
    except requests.RequestException as re:
        print(f"TEST ERROR: HTTP request failed: {re}")
        raise
    finally:
        # Cleanup: attempt to delete the created user if possible.
        # Deletion requires admin token. Support using ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
        admin_email = os.environ.get("ADMIN_EMAIL")
        admin_password = os.environ.get("ADMIN_PASSWORD")
        if created_user_id and admin_email and admin_password:
            try:
                # Login as admin
                login_url = f"{BASE_URL}/api/auth/login"
                admin_login_resp = requests.post(login_url, json={"email": admin_email, "password": admin_password}, timeout=TIMEOUT)
                if admin_login_resp.status_code != 200:
                    print(f"Cleanup warning: admin login failed with status {admin_login_resp.status_code}, body: {admin_login_resp.text}")
                    return
                admin_json = safe_json(admin_login_resp)
                admin_token = admin_json.get("token")
                if not admin_token:
                    print("Cleanup warning: admin login did not return token; cannot delete user.")
                    return
                # Attempt delete
                delete_url = f"{BASE_URL}/api/usuarios/{created_user_id}"
                del_headers = {"x-token": admin_token}
                del_resp = requests.delete(delete_url, headers=del_headers, timeout=TIMEOUT)
                if del_resp.status_code not in (200, 404):
                    print(f"Cleanup warning: unexpected delete status {del_resp.status_code}, body: {del_resp.text}")
                else:
                    print(f"Cleanup: delete returned {del_resp.status_code}.")
            except requests.RequestException as re:
                print(f"Cleanup error: HTTP request failed: {re}")
        else:
            if created_user_id and not (admin_email and admin_password):
                print("Cleanup skipped: ADMIN_EMAIL and ADMIN_PASSWORD not provided; cannot delete created user via API.")
            else:
                # No created user id available; nothing to clean
                pass

if __name__ == "__main__":
    test_put_auth_password_with_correct_current_password()