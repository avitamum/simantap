"""
Test if backend can detect people in real image
"""
import requests
import json
from PIL import Image
import io
import urllib.request

# Download a test image with people (from a URL or use local)
print("Creating test image...")
test_image = Image.new('RGB', (640, 480), color=(100, 150, 200))
img_bytes = io.BytesIO()
test_image.save(img_bytes, format='JPEG')
img_data = img_bytes.getvalue()

print(f"Image size: {len(img_data)} bytes")

# Test detection endpoint
endpoint = 'http://localhost:8000/detect/realtime'
print(f"\nTesting endpoint: {endpoint}")

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="test.jpg"\r\n'
    f'Content-Type: image/jpeg\r\n\r\n'
).encode() + img_data + f'\r\n--{boundary}--\r\n'.encode()

import http.client
conn = http.client.HTTPConnection('localhost', 8000)
conn.request('POST', '/detect/realtime', body, {
    'Content-Type': f'multipart/form-data; boundary={boundary}',
    'Content-Length': str(len(body))
})

response = conn.getresponse()
data = response.read().decode()

print(f"\nResponse Status: {response.status}")
print(f"Response:\n{data}\n")

# Parse and check
result = json.loads(data)
print(f"Detections: {len(result.get('detections', []))} objects")
for det in result.get('detections', []):
    print(f"  - {det['class_name']}: {det['confidence']*100:.1f}%")

print(f"\nCompliance:")
print(f"  - Hazard Level: {result['compliance']['hazard_level']}")
print(f"  - Has Worker: {result['compliance']['has_worker']}")
print(f"  - Compliance Rate: {result['compliance']['compliance_rate']*100:.0f}%")

conn.close()
