import os
import uuid
import requests
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_put_auth_perfil_updates_nombre_and_email_with_uniqueness_check():
    """
    TC007:
    - Create two users A and B.
    - Using A's token, attempt:
      1) Update nombre -> expect 200 and nombre changed.
      2) Update email to B's email -> expect 400 (duplicate email).
      3) Update email to A's own current email -> expect 200.
      4) Update both nombre+unique email -> expect 200 and values updated.
    Cleanup: attempt deletion of created users using ADMIN_TOKEN if provided,
    otherwise attempt to delete with the users' own tokens (may fail depending on API).
    """

    headers = {"Content-Type": "application/json"}
    admin_token = os.getenv("ADMIN_TOKEN")  # optional: used for cleanup if available

    # Helper functions
    def register_user(nombre, email, password):
        url = f"{BASE_URL}/api/auth/registro"
        payload = {"nombre": nombre, "email": email, "password": password}
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        return resp

    def login_user(email, password):
        url = f"{BASE_URL}/api/auth/login"
        payload = {"email": email, "password": password}
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        return resp

    def put_perfil(token, body):
        url = f"{BASE_URL}/api/auth/perfil"
        h = headers.copy()
        h["x-token"] = token
        resp = requests.put(url, json=body, headers=h, timeout=TIMEOUT)
        return resp

    def delete_user_by_admin(admin_token_value, user_id):
        url = f"{BASE_URL}/api/usuarios/{user_id}"
        h = {"x-token": admin_token_value}
        try:
            return requests.delete(url, headers=h, timeout=TIMEOUT)
        except Exception:
            return None

    def delete_user_by_token(user_token_value, user_id):
        url = f"{BASE_URL}/api/usuarios/{user_id}"
        h = {"x-token": user_token_value}
        try:
            return requests.delete(url, headers=h, timeout=TIMEOUT)
        except Exception:
            return None

    # Generate unique emails
    unique_suffix = uuid.uuid4().hex[:8]
    email_a = f"usera_{unique_suffix}@example.test"
    email_b = f"userb_{unique_suffix}@example.test"
    password = "Password1A"  # meets complexity: uppercase, lowercase, digit, length >=8
    nombre_a = "User A"
    nombre_b = "User B"

    created = {"a": None, "b": None}  # will hold dicts with keys: id, token, email

    try:
        # Register user A
        resp = register_user(nombre_a, email_a, password)
        assert resp.status_code == 201, f"Expected 201 on registro A, got {resp.status_code}, body: {resp.text}"
        j = resp.json()
        assert "token" in j and "usuario" in j, f"Registro A response missing token/usuario: {j}"
        token_a = j["token"]
        usuario_a = j["usuario"]
        uid_a = usuario_a.get("uid") or usuario_a.get("uid") or usuario_a.get("id") or usuario_a.get("_id")
        # best-effort to extract id
        if not uid_a:
            # try common keys
            uid_a = usuario_a.get("uid") or usuario_a.get("id") or usuario_a.get("_id")
        assert uid_a, f"Could not determine user A id from response: {usuario_a}"
        created["a"] = {"id": uid_a, "token": token_a, "email": usuario_a.get("email", email_a)}

        # Register user B
        resp = register_user(nombre_b, email_b, password)
        assert resp.status_code == 201, f"Expected 201 on registro B, got {resp.status_code}, body: {resp.text}"
        j = resp.json()
        assert "usuario" in j, f"Registro B response missing usuario: {j}"
        usuario_b = j["usuario"]
        uid_b = usuario_b.get("uid") or usuario_b.get("id") or usuario_b.get("_id")
        if not uid_b:
            uid_b = usuario_b.get("uid") or usuario_b.get("id") or usuario_b.get("_id")
        assert uid_b, f"Could not determine user B id from response: {usuario_b}"
        created["b"] = {"id": uid_b, "email": usuario_b.get("email", email_b)}

        # Use token from registration for user A (token_a)
        # 1) Update nombre only
        new_nombre = "User A Updated"
        resp = put_perfil(token_a, {"nombre": new_nombre})
        assert resp.status_code == 200, f"Expected 200 on updating nombre, got {resp.status_code}, body: {resp.text}"
        updated_user = resp.json()
        # updated_user may be wrapped or be the usuario object directly
        if isinstance(updated_user, dict) and "usuario" in updated_user:
            updated_user = updated_user["usuario"]
        returned_nombre = updated_user.get("nombre") or updated_user.get("name")
        assert returned_nombre == new_nombre, f"Nombre not updated: expected {new_nombre}, got {returned_nombre}"
        returned_id = updated_user.get("uid") or updated_user.get("id") or updated_user.get("_id")
        assert str(returned_id) == str(created["a"]["id"]), "Updated usuario id does not match original user A id"

        # 2) Attempt to update email to B's email -> should fail with 400 (duplicate)
        resp = put_perfil(token_a, {"email": created["b"]["email"]})
        assert resp.status_code == 400, f"Expected 400 when setting email to another user's email, got {resp.status_code}, body: {resp.text}"
        # Optionally check response contains mention of email or duplicate
        try:
            body_json = resp.json()
            body_text = str(body_json).lower()
        except Exception:
            body_text = resp.text.lower()
        assert ("email" in body_text) or (resp.status_code == 400), "Duplicate email error response does not mention email (best-effort check)"

        # 3) Update email to A's own current email (should be allowed)
        # Fetch current email (from created["a"] or updated_user)
        current_email_a = updated_user.get("email") or created["a"]["email"] or email_a
        resp = put_perfil(token_a, {"email": current_email_a})
        assert resp.status_code == 200, f"Expected 200 when setting email to own email, got {resp.status_code}, body: {resp.text}"
        updated_user_2 = resp.json()
        if isinstance(updated_user_2, dict) and "usuario" in updated_user_2:
            updated_user_2 = updated_user_2["usuario"]
        assert updated_user_2.get("email") == current_email_a, "Email after setting to own email does not match expected"

        # 4) Update both nombre and a new unique email -> should succeed
        unique_new_email = f"usera_new_{uuid.uuid4().hex[:6]}@example.test"
        new_nombre_2 = "User A Final"
        resp = put_perfil(token_a, {"nombre": new_nombre_2, "email": unique_new_email})
        assert resp.status_code == 200, f"Expected 200 when updating nombre+unique email, got {resp.status_code}, body: {resp.text}"
        final_user = resp.json()
        if isinstance(final_user, dict) and "usuario" in final_user:
            final_user = final_user["usuario"]
        assert final_user.get("nombre") == new_nombre_2, f"Final nombre not updated: expected {new_nombre_2}, got {final_user.get('nombre')}"
        assert final_user.get("email") == unique_new_email, f"Final email not updated: expected {unique_new_email}, got {final_user.get('email')}"

        print("TC007 passed.")
    finally:
        # Cleanup: attempt to delete created users.
        # Prefer admin token if provided; otherwise attempt to DELETE using the users' own tokens (may be forbidden).
        errors = []
        # Delete user B first (we have no token for B)
        if created.get("b") and created["b"].get("id"):
            if admin_token:
                try:
                    r = delete_user_by_admin(admin_token, created["b"]["id"])
                    if r is not None and r.status_code not in (200, 404, 400):
                        errors.append(f"Unexpected delete B status with admin token: {getattr(r, 'status_code', None)} body: {getattr(r, 'text', '')}")
                except Exception as e:
                    errors.append(f"Exception deleting B with admin token: {e}")
            else:
                # no admin token: nothing reliable we can do; attempt deletion with A's token if available
                if created.get("a") and created["a"].get("token"):
                    try:
                        r = delete_user_by_token(created["a"]["token"], created["b"]["id"])
                        # ignore result; store if unexpected
                        if r is not None and r.status_code not in (200, 400, 403, 404):
                            errors.append(f"Unexpected delete B status with user token: {getattr(r, 'status_code', None)} body: {getattr(r, 'text', '')}")
                    except Exception as e:
                        errors.append(f"Exception deleting B with user token: {e}")

        # Delete user A
        if created.get("a") and created["a"].get("id"):
            if admin_token:
                try:
                    r = delete_user_by_admin(admin_token, created["a"]["id"])
                    if r is not None and r.status_code not in (200, 404, 400):
                        errors.append(f"Unexpected delete A status with admin token: {getattr(r, 'status_code', None)} body: {getattr(r, 'text', '')}")
                except Exception as e:
                    errors.append(f"Exception deleting A with admin token: {e}")
            else:
                # attempt to delete with A's own token (likely forbidden)
                if created["a"].get("token"):
                    try:
                        r = delete_user_by_token(created["a"]["token"], created["a"]["id"])
                        if r is not None and r.status_code not in (200, 400, 403, 404):
                            errors.append(f"Unexpected delete A status with user token: {getattr(r, 'status_code', None)} body: {getattr(r, 'text', '')}")
                    except Exception as e:
                        errors.append(f"Exception deleting A with user token: {e}")

        if errors:
            # Print errors to stderr but do not fail the test in cleanup
            for e in errors:
                print("Cleanup warning:", e, file=sys.stderr)


if __name__ == "__main__":
    test_put_auth_perfil_updates_nombre_and_email_with_uniqueness_check()