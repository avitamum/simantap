"""
Simple API test - Test detection endpoint
"""
import http.client
import io
import base64
from PIL import Image

# Create a simple test image
test_image = Image.new('RGB', (640, 480), color=(100, 150, 200))
img_bytes = io.BytesIO()
test_image.save(img_bytes, format='JPEG')
img_data = img_bytes.getvalue()

# Prepare multipart form data
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="test.jpg"\r\n'
    f'Content-Type: image/jpeg\r\n\r\n'
).encode() + img_data + f'\r\n--{boundary}--\r\n'.encode()

# Make request
conn = http.client.HTTPConnection('localhost', 8000)
conn.request('POST', '/detect/realtime', body, {
    'Content-Type': f'multipart/form-data; boundary={boundary}',
    'Content-Length': str(len(body))
})

response = conn.getresponse()
data = response.read().decode()

print("=" * 60)
print(f"Response Status: {response.status}")
print("=" * 60)
print(data)
conn.close()

# Check for success indicators
if response.status == 200:
    print("\n[OK] Detection request succeeded!")
    if 'detections' in data and 'compliance' in data:
        print("[OK] Response contains expected fields")
else:
    print(f"\n[!] Request failed with status {response.status}")
