#!/usr/bin/env python
"""Test dengan gambar real dari screenshot user"""

import requests
from PIL import Image
import io

# Download sample image atau buat test
# Untuk test, saya akan ambil dari sample construction image

# Mari test endpoint dengan gambar contoh
test_image_url = "https://images.unsplash.com/photo-1581092545356-9ae0f1b4b925?w=640&h=640"  # Construction worker

try:
    # Download image
    print("Downloading test image...")
    response = requests.get(test_image_url, timeout=10)
    response.raise_for_status()
    
    img_bytes = io.BytesIO(response.content)
    print(f"Image size: {len(response.content)} bytes")
    
    # Send to backend
    print("Sending to backend...")
    files = {'file': ('test.jpg', img_bytes.read(), 'image/jpeg')}
    api_response = requests.post('http://localhost:8000/detect/realtime', files=files, timeout=10)
    
    print(f"Status: {api_response.status_code}")
    result = api_response.json()
    
    print(f"\nDetections: {len(result['detections'])} objects")
    for det in result['detections']:
        print(f"  ✓ {det['class_name']}: {det['confidence']:.2%}")
        print(f"    bbox: {det['bbox']}")
    
    print(f"\nCompliance: {result['compliance']['hazard_level']}")
    print(f"  Has worker: {result['compliance']['has_worker']}")
    print(f"  Alert: {result['compliance']['alert_message']}")
    
except Exception as e:
    print(f"Error: {e}")
