import requests

try:
    response = requests.post('http://localhost:5000/api/scans/bulk', json={})
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
