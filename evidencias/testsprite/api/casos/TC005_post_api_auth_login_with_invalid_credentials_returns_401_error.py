import requests
import uuid
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
EXPECTED_MESSAGE = "Credenciales inválidas"

def test_post_api_auth_login_with_invalid_credentials_returns_401():
    url = f"{BASE_URL}/api/auth/login"
    headers = {"Content-Type": "application/json"}
    # Use a random email that is extremely unlikely to exist to simulate "unknown email"
    payload = {
        "email": f"nonexistent+{uuid.uuid4().hex}@example.com",
        "password": "WrongPassword123"
    }

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise AssertionError(f"HTTP request failed: {e}") from e

    # Assert status code is 401
    assert resp.status_code == 401, f"Expected status 401, got {resp.status_code}. Response text: {resp.text}"

    # Attempt to parse JSON body
    try:
        body = resp.json()
    except ValueError:
        raise AssertionError(f"Response is not valid JSON. Status: {resp.status_code}, Body: {resp.text}")

    # Search the JSON for the expected message in any string value
    def contains_expected(obj):
        if isinstance(obj, dict):
            return any(contains_expected(v) for v in obj.values())
        if isinstance(obj, list):
            return any(contains_expected(v) for v in obj)
        if isinstance(obj, str):
            return EXPECTED_MESSAGE in obj
        return False

    assert contains_expected(body), f"Expected message '{EXPECTED_MESSAGE}' not found in response JSON: {body}"

if __name__ == "__main__":
    try:
        test_post_api_auth_login_with_invalid_credentials_returns_401()
        print("TC005 passed")
    except AssertionError as e:
        print("TC005 failed:", e)
        sys.exit(1)