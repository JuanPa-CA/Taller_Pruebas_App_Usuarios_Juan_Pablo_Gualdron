import requests
import sys

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_get_api_health_returns_status_ok():
    url = f"{BASE_URL}/api/health"
    headers = {
        "Accept": "application/json"
    }

    try:
        resp = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        raise AssertionError(f"HTTP request to {url} failed: {e}")

    # Validate status code
    assert resp.status_code == 200, f"Expected status code 200, got {resp.status_code}. Response text: {resp.text}"

    # Validate content-type if present
    content_type = resp.headers.get("Content-Type", "")
    assert "application/json" in content_type or content_type == "", f"Expected JSON content type, got '{content_type}'"

    # Validate JSON body
    try:
        body = resp.json()
    except ValueError as e:
        raise AssertionError(f"Response body is not valid JSON: {e}. Raw response: {resp.text}")

    assert isinstance(body, dict), f"Expected JSON object, got {type(body)}: {body}"
    assert body.get("status") == "ok", f"Expected JSON body {{'status':'ok'}}, got {body}"

    print("TC001 passed: GET /api/health returned 200 with {'status':'ok'}")

if __name__ == "__main__":
    try:
        test_get_api_health_returns_status_ok()
    except AssertionError as e:
        print(f"TC001 failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"TC001 encountered an unexpected error: {e}")
        sys.exit(2)
    sys.exit(0)