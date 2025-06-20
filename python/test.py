import requests

berat = 123  # Nilai dari alat timbang

response = requests.post(
    'http://localhost:8000/api/live-weight',
    json={'berat': berat}
)

print(response.status_code)
print(response.json())
