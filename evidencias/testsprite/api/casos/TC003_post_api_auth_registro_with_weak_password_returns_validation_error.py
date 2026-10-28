import requests
import os
import time
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_auth_registro_weak_password():
    url = f"{BASE_URL}/api/auth/registro"
    # Use a unique email to avoid duplicate-email interference
    unique_email = f"test_weakpw_{int(time.time()*1000)}@example.com"
    payload = {
        "nombre": "Test WeakPw",
        "email": unique_email,
        # Intentionally weak password: too short and missing required complexity
        "password": "weak"
    }
    headers = {"Content-Type": "application/json"}

    resp = None
    created_user_uid = None
    created_user_token = None

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Request to {url} failed: {e}") from e

    # Ensure we got a response
    assert resp is not None, "No response received from the server"

    # Expecting validation error -> HTTP 400
    if resp.status_code == 201:
        # Unexpected success: try to capture created user info for cleanup (best-effort)
        try:
            body = resp.json()
        except ValueError:
            body = {}
        created_user_token = body.get("token")
        usuario = body.get("usuario") or {}
        created_user_uid = usuario.get("uid") or usuario.get("id") or usuario.get("_id")
        # Fail the test because we expected a 400 for weak password
        raise AssertionError(
            f"Expected HTTP 400 for weak password, but received 201 Created. Response body: {body}"
        )

    # Assert that status code is 400
    assert resp.status_code == 400, f"Expected status 400 for weak password validation, got {resp.status_code}. Body: {resp.text}"

    # Response must be JSON
    content_type = resp.headers.get("Content-Type", "")
    assert "application/json" in content_type, f"Expected JSON response, got Content-Type: {content_type}"

    # Parse JSON and look for password-related validation messages
    try:
        body = resp.json()
    except ValueError as e:
        raise AssertionError(f"Response is not valid JSON: {e}. Body: {resp.text}") from e

    # Helper to collect all string values from JSON recursively
    def collect_strings(node):
        results = []
        if isinstance(node, str):
            results.append(node)
        elif isinstance(node, dict):
            for v in node.values():
                results.extend(collect_strings(v))
        elif isinstance(node, list):
            for item in node:
                results.extend(collect_strings(item))
        return results

    strings = collect_strings(body)
    joined = " | ".join(strings).lower()

    # Look for indicators that the validation failure is about the password complexity/length
    keywords = [
        "password",
        "contraseña",
        "weak",
        "mayúsc",  # mayúscula/mayuscula
        "mayus",    # alternative spanish forms
        "uppercase",
        "lowercase",
        "digit",
        "8",        # length requirement hint (8-64)
        "longitud",
        "mínim",    # mínimo / minimo
    ]

    if not any(k in joined for k in keywords):
        # If none of the keywords found, fail with diagnostic info
        raise AssertionError(f"Validation error returned but no password-related message found. Response JSON: {body}")

    # If reached here, test passes (password validation error found)
    return True


if __name__ == "__main__":
    try:
        test_post_api_auth_registro_weak_password()
        print("TC003 passed")
        sys.exit(0)
    except AssertionError as e:
        print("TC003 failed:", e)
        sys.exit(1)
    except Exception as e:
        print("TC003 error:", e)
        sys.exit(2)