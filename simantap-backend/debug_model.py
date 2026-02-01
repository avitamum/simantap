#!/usr/bin/env python
"""Debug what yolov8n detects in test images"""

from ultralytics import YOLO
import numpy as np
from PIL import Image, ImageDraw

# Load the fallback model directly
print("Loading yolov8n model...")
model = YOLO('yolov8n.pt')

# Create test image
print("\nCreating test image...")
img = Image.new('RGB', (640, 640), color='white')
draw = ImageDraw.Draw(img)
# Draw shapes
draw.rectangle([(100, 100), (500, 500)], fill='blue', outline='black', width=5)
draw.ellipse([(200, 50), (440, 200)], fill='orange', outline='black', width=5)

# Convert to array
img_array = np.array(img)

# Run detection
print("Running detection...")
results = model(img_array, conf=0.3, verbose=False)  # Lower confidence to see what it detects
boxes = results[0].boxes

print(f"\nTotal detections: {len(boxes)}")
for i, box in enumerate(boxes):
    cls = int(box.cls[0].cpu().numpy())
    conf = box.conf[0].cpu().numpy()
    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
    print(f"  [{i}] Class {cls}: {conf:.2%} - Box({x1:.0f}, {y1:.0f}, {x2:.0f}, {y2:.0f})")

# List all class names in the model
print("\nModel classes (first 20):")
for i, name in enumerate(model.names.values()):
    if i < 20:
        print(f"  {i}: {name}")
