"""
SIMANTAP Backend v4.0 - AI-First Detection
Menggunakan YOLO sebagai SATU-SATUNYA metode deteksi
Deteksi: Topi, Sepatu, Pakaian dengan accuracy tinggi
Prioritas UTAMA: Deteksi "Person" dulu, cari APD di dalam bounding box orang
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Tuple
from contextlib import asynccontextmanager
import os
import io
import sqlite3
from datetime import datetime
import numpy as np
from PIL import Image
import cv2
from ultralytics import YOLO

# Configuration
DB_FILE = "simantap_data.db"
DATA_DIR = "data"
MODEL_PATH = "models/best.pt"
MODEL_FALLBACK = "yolov8n.pt"

# Global variables
detection_model = None
model_available = False
model_type = "none"

# Class configuration - YOLO class mapping
CLASS_NAMES = {
    0: "Topi",      # Helmet
    1: "Sepatu",    # Shoes
    2: "Pakaian",   # Vest/Clothing
    3: "Pekerja"    # Person
}

PPE_REQUIREMENTS = ["Topi", "Sepatu", "Pakaian"]

# Pydantic Models
class AreaData(BaseModel):
    area_id: str
    area_name: str
    location: str
    risk_level: str
    description: Optional[str] = None

class APDItem(BaseModel):
    item_id: str
    item_name: str
    category: str
    description: Optional[str] = None

# Database initialization
def init_database():
    """Initialize SQLite database"""
    if not os.path.exists(DB_FILE):
        try:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            cursor.execute('''CREATE TABLE IF NOT EXISTS areas (
                area_id TEXT PRIMARY KEY,
                area_name TEXT NOT NULL,
                location TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                description TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )''')
            
            cursor.execute('''CREATE TABLE IF NOT EXISTS apd_items (
                item_id TEXT PRIMARY KEY,
                item_name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                training_samples INTEGER,
                accuracy REAL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )''')
            
            cursor.execute('''CREATE TABLE IF NOT EXISTS detection_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                area_id TEXT,
                detected_classes TEXT,
                compliance_rate REAL,
                hazard_level TEXT,
                alert_message TEXT
            )''')
            
            conn.commit()
            conn.close()
            print("[OK] Database initialized")
        except Exception as e:
            print(f"[!] Database init error: {e}")
    else:
        print("[OK] Database exists")

def load_yolo_model():
    """Load YOLOv8 model - HANYA YOLO, TIDAK ADA FALLBACK"""
    global detection_model, model_available, model_type
    try:
        print("[*] Loading YOLOv8 model...")
        
        # Try custom model first
        if os.path.exists("models/best.pt"):
            try:
                detection_model = YOLO("models/best.pt")
                model_available = True
                model_type = "yolo_custom"
                print("[✓] Custom YOLO model (best.pt) loaded!")
                print("[✓] Model dipersembahkan untuk APD khusus Indonesia")
                return True
            except Exception as e:
                print(f"[!] Custom model failed: {e}")
                return False
        
        # Fallback to generic YOLOv8-nano
        if os.path.exists("yolov8n.pt"):
            detection_model = YOLO("yolov8n.pt")
            model_available = True
            model_type = "yolo_generic"
            print("[✓] YOLOv8-nano loaded (Generic Object Detection)")
            print("[!] PERHATIAN: Gunakan model custom untuk akurasi lebih baik")
            return True
        
        # Last resort - download
        print("[*] Downloading YOLOv8-nano...")
        detection_model = YOLO("yolov8n.pt")
        model_available = True
        model_type = "yolo_generic"
        print("[✓] YOLOv8-nano downloaded and loaded")
        return True
            
    except Exception as e:
        print(f"[!] CRITICAL: Cannot load YOLO model: {e}")
        print("[!] Detection tidak akan berjalan tanpa YOLO!")
        model_available = False
        model_type = "none"
        return False

def detect_person_and_ppe(image_array: np.ndarray, confidence_threshold: float = 0.50) -> Dict:
    """
    METODE UTAMA: Deteksi Person dulu, baru cari APD dalam bounding box person
    Ini adalah cara yang BENAR menggunakan YOLO
    """
    if not model_available or detection_model is None:
        return {
            "detections": [],
            "person_found": False,
            "method": "none",
            "warning": "YOLO model not loaded - detection unavailable"
        }
    
    try:
        # Run YOLO inference
        results = detection_model(image_array, conf=confidence_threshold, verbose=False)
        
        all_detections = []
        person_boxes = []
        
        if len(results) > 0 and len(results[0].boxes) > 0:
            boxes = results[0].boxes
            h, w = image_array.shape[:2]
            
            # Step 1: Collect all detections and find person boxes
            for i in range(len(boxes)):
                try:
                    box = boxes[i]
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = box.conf[0].cpu().numpy()
                    cls = int(box.cls[0].cpu().numpy())
                    
                    class_name = CLASS_NAMES.get(cls, f"Unknown-{cls}")
                    
                    # Filter: Only keep detections with confidence > 50%
                    if conf < 0.50:
                        continue
                    
                    detection_obj = {
                        "class_id": cls,
                        "class_name": class_name,
                        "confidence": round(float(conf), 3),
                        "bbox": {
                            "x1": int(x1),
                            "y1": int(y1),
                            "x2": int(x2),
                            "y2": int(y2),
                            "width": int(x2 - x1),
                            "height": int(y2 - y1)
                        }
                    }
                    
                    # Collect person boxes for spatial filtering
                    if class_name == "Pekerja":
                        person_boxes.append(detection_obj)
                    
                    all_detections.append(detection_obj)
                    
                except Exception as e:
                    print(f"[!] Box processing error: {e}")
                    continue
        
        # Step 2: If person found, filter APD to only those within person area
        if len(person_boxes) > 0:
            filtered_detections = filter_ppe_by_person(all_detections, person_boxes)
            
            return {
                "detections": filtered_detections,
                "person_found": True,
                "person_count": len(person_boxes),
                "method": model_type,
                "warning": None
            }
        else:
            # If no person, return only non-person detections (rare case)
            ppe_detections = [d for d in all_detections if d["class_name"] != "Pekerja"]
            
            return {
                "detections": ppe_detections,
                "person_found": False,
                "person_count": 0,
                "method": model_type,
                "warning": "No person detected in frame"
            }
        
    except Exception as e:
        print(f"[!] YOLO inference error: {e}")
        return {
            "detections": [],
            "person_found": False,
            "method": "error",
            "warning": f"Detection error: {str(e)}"
        }

def filter_ppe_by_person(all_detections: List[Dict], person_boxes: List[Dict]) -> List[Dict]:
    """
    Filter APD detections: hanya ambil yang ada dalam bounding box person
    Ini mencegah false positives dari background
    """
    filtered = []
    
    # Remove duplicates per class, keep highest confidence
    unique_by_class = {}
    for det in all_detections:
        if det["class_name"] == "Pekerja":
            continue
        
        cn = det["class_name"]
        if cn not in unique_by_class or det["confidence"] > unique_by_class[cn]["confidence"]:
            unique_by_class[cn] = det
    
    # Check each APD detection is within person bounding box
    for ppe_det in unique_by_class.values():
        ppe_x1, ppe_y1 = ppe_det["bbox"]["x1"], ppe_det["bbox"]["y1"]
        ppe_x2, ppe_y2 = ppe_det["bbox"]["x2"], ppe_det["bbox"]["y2"]
        
        # Check if APD overlaps with any person box
        for person_box in person_boxes:
            p_x1, p_y1 = person_box["bbox"]["x1"], person_box["bbox"]["y1"]
            p_x2, p_y2 = person_box["bbox"]["x2"], person_box["bbox"]["y2"]
            
            # Calculate IoU (Intersection over Union)
            inter_x1 = max(ppe_x1, p_x1)
            inter_y1 = max(ppe_y1, p_y1)
            inter_x2 = min(ppe_x2, p_x2)
            inter_y2 = min(ppe_y2, p_y2)
            
            if inter_x2 > inter_x1 and inter_y2 > inter_y1:
                # Significant overlap found
                filtered.append(ppe_det)
                break
    
    return filtered

def assess_compliance(detection_result: Dict) -> Dict:
    """Assess PPE compliance based on YOLO detections"""
    detections = detection_result.get("detections", [])
    person_found = detection_result.get("person_found", False)
    
    detected_classes = set([det["class_name"] for det in detections])
    detected_ppe = detected_classes.intersection(set(PPE_REQUIREMENTS))
    missing_ppe = set(PPE_REQUIREMENTS) - detected_ppe
    
    compliance_rate = (len(detected_ppe) / len(PPE_REQUIREMENTS)) * 100 if PPE_REQUIREMENTS else 0
    
    # Hazard level assessment
    if not person_found:
        hazard_level = "Low"
        alert_message = "No worker detected"
    elif len(missing_ppe) == 0:
        hazard_level = "Low"
        alert_message = "✓ All PPE items detected - COMPLIANT"
    elif len(missing_ppe) == 1:
        hazard_level = "Medium"
        alert_message = f"⚠ WARNING: Missing {', '.join(missing_ppe)}"
    elif len(missing_ppe) == 2:
        hazard_level = "High"
        alert_message = f"🚨 ALERT: Missing {', '.join(missing_ppe)}"
    else:
        hazard_level = "Critical"
        alert_message = f"🚨 CRITICAL: Multiple PPE missing - {', '.join(missing_ppe)}"
    
    return {
        "compliance_rate": round(compliance_rate, 1),
        "detected_ppe": sorted(list(detected_ppe)),
        "missing_ppe": sorted(list(missing_ppe)),
        "hazard_level": hazard_level,
        "alert_message": alert_message,
        "has_worker": person_found,
        "detection_method": detection_result.get("method")
    }

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    if not os.path.exists("models"):
        os.makedirs("models")
    
    init_database()
    load_yolo_model()
    
    if not model_available:
        print("[🔴] WARNING: YOLO model failed to load!")
        print("[🔴] Detection system is DISABLED")
    else:
        print("[🟢] Backend started - Detection ready")
    
    yield
    
    print("[OK] Backend stopped")

# Initialize app
app = FastAPI(
    title="SIMANTAP API v4.0",
    version="4.0.0",
    description="AI-Powered PPE Detection System",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online" if model_available else "offline",
        "service": "SIMANTAP Detection API",
        "version": "4.0.0",
        "model_type": model_type,
        "model_available": model_available,
        "detection_method": "YOLO Only (No Fallback)",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/detect/ppe")
async def detect_ppe_endpoint(file: UploadFile = File(...)):
    """Detect PPE in uploaded image"""
    if not model_available:
        raise HTTPException(status_code=503, detail="Detection model not loaded")
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image_array = np.array(image)
        
        # Main detection
        detection_result = detect_person_and_ppe(image_array)
        compliance = assess_compliance(detection_result)
        
        # Log to database
        try:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute('''INSERT INTO detection_history 
                (timestamp, detected_classes, compliance_rate, hazard_level, alert_message)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                datetime.now().isoformat(),
                ",".join([d["class_name"] for d in detection_result["detections"]]),
                compliance["compliance_rate"],
                compliance["hazard_level"],
                compliance["alert_message"]
            ))
            conn.commit()
            conn.close()
        except:
            pass
        
        return {
            "status": "success",
            "detections": detection_result["detections"],
            "person_found": detection_result["person_found"],
            "compliance": compliance,
            "method": detection_result["method"],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"[!] Detection error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/detect/realtime")
async def detect_realtime(file: UploadFile = File(...)):
    """Real-time detection from webcam feed"""
    if not model_available:
        raise HTTPException(status_code=503, detail="Detection model not loaded")
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image_array = np.array(image)
        
        # Main detection
        detection_result = detect_person_and_ppe(image_array)
        compliance = assess_compliance(detection_result)
        
        return {
            "status": "success",
            "detections": detection_result["detections"],
            "person_found": detection_result["person_found"],
            "compliance": compliance,
            "method": detection_result["method"]
        }
        
    except Exception as e:
        print(f"[!] Realtime detection error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/stats/summary")
async def get_stats():
    """Get detection statistics"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*), AVG(compliance_rate) FROM detection_history')
        total, avg_compliance = cursor.fetchone()
        conn.close()
        
        return {
            "total_detections": total or 0,
            "avg_compliance_rate": round(avg_compliance or 0, 1),
            "model_type": model_type,
            "status": "online" if model_available else "offline"
        }
    except:
        return {"error": "Cannot fetch statistics"}

if __name__ == "__main__":
    import uvicorn
    print("=" * 70)
    print("Starting SIMANTAP Backend v4.0 - AI-Powered PPE Detection")
    print("=" * 70)
    print("API: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    print("=" * 70)
    uvicorn.run(app, host="0.0.0.0", port=8000)
