# simantap-backend/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import torchvision
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from PIL import Image
import io
import base64
import numpy as np
from typing import List, Dict
import cv2

app = FastAPI(title="SIMANTAP API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model = None
device = None
CLASS_NAMES = {
    1: "Topi",
    2: "Sepatu",
    3: "Pakaian",
    4: "Pekerja"
}

# Risk assessment configuration
PPE_REQUIREMENTS = ["Topi", "Sepatu", "Pakaian"]

def load_model():
    """Load trained Faster R-CNN model"""
    global model, device
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    num_classes = 5  # 4 classes + background
    
    # Initialize model architecture
    model = torchvision.models.detection.fasterrcnn_resnet50_fpn(weights=None)
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)
    
    # Load trained weights
    try:
        model.load_state_dict(torch.load("models/fasterrcnn_best.pth", map_location=device))
        model.to(device)
        model.eval()
        print(f"✅ Model loaded successfully on {device}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("⚠️ Using mock predictions for development")

@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    load_model()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "SIMANTAP Detection API",
        "model_loaded": model is not None,
        "device": str(device) if device else "unknown"
    }

def assess_compliance(detections: List[Dict]) -> Dict:
    """Assess PPE compliance based on detections"""
    detected_classes = set([det["class_name"] for det in detections])
    detected_ppe = detected_classes.intersection(set(PPE_REQUIREMENTS))
    
    has_worker = "Pekerja" in detected_classes
    missing_ppe = set(PPE_REQUIREMENTS) - detected_ppe
    
    compliance_rate = len(detected_ppe) / len(PPE_REQUIREMENTS) * 100
    
    # Determine hazard level
    if not has_worker:
        hazard_level = "Low"
        alert_message = "No worker detected in frame"
    elif len(missing_ppe) == 0:
        hazard_level = "Low"
        alert_message = "All PPE compliant ✓"
    elif len(missing_ppe) == 1:
        hazard_level = "Medium"
        alert_message = f"Missing: {', '.join(missing_ppe)}"
    else:
        hazard_level = "High"
        alert_message = f"Critical! Missing: {', '.join(missing_ppe)}"
    
    return {
        "compliance_rate": round(compliance_rate, 1),
        "detected_ppe": list(detected_ppe),
        "missing_ppe": list(missing_ppe),
        "hazard_level": hazard_level,
        "alert_message": alert_message,
        "has_worker": has_worker
    }

@app.post("/detect/ppe")
async def detect_ppe(file: UploadFile = File(...)):
    """
    Detect PPE in uploaded image
    Returns: detections, compliance assessment, annotated image
    """
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Convert to tensor
        img_tensor = torchvision.transforms.functional.to_tensor(image).unsqueeze(0).to(device)
        
        # Run inference
        with torch.no_grad():
            predictions = model(img_tensor)[0]
        
        # Process predictions
        boxes = predictions["boxes"].cpu().numpy()
        scores = predictions["scores"].cpu().numpy()
        labels = predictions["labels"].cpu().numpy()
        
        detections = []
        threshold = 0.5
        
        for box, score, label in zip(boxes, scores, labels):
            if score > threshold:
                x1, y1, x2, y2 = map(int, box)
                detections.append({
                    "class_id": int(label),
                    "class_name": CLASS_NAMES.get(int(label), "Unknown"),
                    "confidence": float(score),
                    "bbox": {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2
                    }
                })
        
        # Assess compliance
        compliance = assess_compliance(detections)
        
        # Draw bounding boxes on image
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        for det in detections:
            bbox = det["bbox"]
            color = (0, 255, 0) if compliance["hazard_level"] == "Low" else (0, 165, 255) if compliance["hazard_level"] == "Medium" else (0, 0, 255)
            
            cv2.rectangle(img_cv, (bbox["x1"], bbox["y1"]), (bbox["x2"], bbox["y2"]), color, 2)
            
            label_text = f"{det['class_name']}: {det['confidence']:.2f}"
            cv2.putText(img_cv, label_text, (bbox["x1"], bbox["y1"] - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # Convert annotated image to base64
        _, buffer = cv2.imencode('.jpg', img_cv)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return JSONResponse({
            "success": True,
            "detections": detections,
            "compliance": compliance,
            "annotated_image": f"data:image/jpeg;base64,{img_base64}",
            "total_detections": len(detections)
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect/stf")
async def detect_stf(file: UploadFile = File(...)):
    """
    Detect Slip-Trip-Fall hazards (mock implementation for MVP)
    """
    try:
        # Mock STF detection - implement actual model later
        hazards = [
            {"type": "wet_surface", "confidence": 0.85, "location": "bottom_left"},
            {"type": "uneven_ground", "confidence": 0.72, "location": "center"}
        ]
        
        return JSONResponse({
            "success": True,
            "hazards": hazards,
            "risk_level": "Medium",
            "recommendation": "Caution: Wet surface detected"
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats/summary")
async def get_stats_summary():
    """Get summary statistics (mock data for dashboard)"""
    return {
        "total_inspections": 1247,
        "compliance_rate": 87.3,
        "violations_today": 23,
        "high_risk_areas": 5,
        "ppe_breakdown": {
            "helmet": 95.1,
            "vest": 92.6,
            "shoes": 95.4,
            "complete": 87.3
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)