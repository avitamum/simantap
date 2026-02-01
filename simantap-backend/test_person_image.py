#!/usr/bin/env python
"""Test backend with a realistic person image"""

from PIL import Image, ImageDraw
import io
import requests

# Create a realistic test image with a person silhouette
img = Image.new('RGB', (640, 640), color='white')
draw = ImageDraw.Draw(img)

# Sky blue background for top half
draw.rectangle([(0, 0), (640, 320)], fill='lightblue')

# Ground (green)
draw.rectangle([(0, 320), (640, 640)], fill='green')

# Person: Create a realistic person silhouette
# Head (circle)
draw.ellipse([(280, 80), (360, 160)], fill='orange', outline='black', width=2)

# Torso (rectangle with safety vest colors - yellow/orange reflective)
draw.rectangle([(250, 160), (390, 320)], fill='yellow', outline='black', width=2)
# Add orange stripes for safety vest
draw.line([(260, 160), (260, 320)], fill='orange', width=15)
draw.line([(320, 160), (320, 320)], fill='orange', width=15)
draw.line([(380, 160), (380, 320)], fill='orange', width=15)

# Arms
draw.polygon([(250, 180), (220, 280), (230, 290), (260, 200)], fill='orange', outline='black')
draw.polygon([(390, 180), (420, 280), (410, 290), (380, 200)], fill='orange', outline='black')

# Legs
draw.rectangle([(270, 320), (300, 500)], fill='blue', outline='black', width=2)
draw.rectangle([(340, 320), (370, 500)], fill='blue', outline='black', width=2)

# Feet (red for safety shoes)
draw.rectangle([(260, 500), (310, 540)], fill='red', outline='black', width=2)
draw.rectangle([(330, 500), (380, 540)], fill='red', outline='black', width=2)

# Add helmet on head (hard hat - yellow)
draw.polygon([(280, 70), (360, 70), (370, 90), (270, 90)], fill='yellow', outline='black')

# Save to bytes
img_bytes = io.BytesIO()
img.save(img_bytes, format='JPEG')
img_bytes.seek(0)
print(f'Test image created: {len(img_bytes.getvalue())} bytes')

# Send to backend
files = {'file': ('person.jpg', img_bytes.read(), 'image/jpeg')}
response = requests.post('http://localhost:8000/detect/realtime', files=files, timeout=10)
result = response.json()

print(f'Status: {response.status_code}')
print(f'Detections: {len(result["detections"])} objects')
for det in result['detections']:
    print(f'  - {det["class_name"]}: {det["confidence"]:.2%} @ {det["bbox"]}')
print(f'Compliance: {result["compliance"]["hazard_level"]} - {result["compliance"]["alert_message"]}')
