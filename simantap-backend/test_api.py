"""
Quick API test script - Tests the new main_final.py backend
"""
import requests
import json
from pathlib import Path
from PIL import Image
import io

# Test if backend is running
print("=" * 60)
print("Testing SIMANTAP Backend v5.0")
print("=" * 60)

# Test 1: Check if backend is alive
print("\n[1] Checking if backend is alive...")
try:
    resp = requests.get("http://localhost:8000/", timeout=5)
    print(f"[OK] Backend is running: {resp.status_code}")
except Exception as e:
    print(f"[!] Backend error: {e}")
    exit(1)

# Test 2: Create a test image (simple solid color)
print("\n[2] Creating test image...")
test_image = Image.new('RGB', (640, 480), color=(73, 109, 137))
img_bytes = io.BytesIO()
test_image.save(img_bytes, format='JPEG')
img_bytes.seek(0)

# Test 3: Send detection request
print("\n[3] Sending /detect/realtime request...")
try:
    files = {'file': ('test.jpg', img_bytes, 'image/jpeg')}
    resp = requests.post("http://localhost:8000/detect/realtime", files=files, timeout=30)
    
    print(f"[OK] Response status: {resp.status_code}")
    data = resp.json()
    
    print("\nResponse JSON:")
    print(json.dumps(data, indent=2))
    
    # Check structure
    if 'detections' in data and 'compliance' in data and 'stf' in data:
        print("\n[OK] Response structure is CORRECT!")
        print(f"  - Detections: {len(data['detections'])} objects")
        print(f"  - Compliance: {data['compliance']}")
        print(f"  - STF Result: {data['stf']}")
    else:
        print("\n[!] Response structure is INCORRECT!")
        
except Exception as e:
    print(f"[!] Request error: {e}")

print("\n" + "=" * 60)
print("Test complete!")
print("=" * 60)
