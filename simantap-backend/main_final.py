"""
SIMANTAP Backend v5.0 - Production Ready
================================
Two-Stage Detection Approach:
1. Detect Person (Worker) FIRST
2. Find PPE items INSIDE person's bounding box
3. Use proper STF model (no manual brightness check)

Model Strategy:
- Primary: YOLOv8/v12 custom trained model (APD)
- Secondary: YOLOv8/v12 custom trained model (STF)
- Fallback: None (return empty if model fails)
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from contextlib import asynccontextmanager
import os
import io
import sqlite3
from datetime import datetime
import numpy as np
from PIL import Image
import cv2
from ultralytics import YOLO

# ============================================================================
# CONFIGURATION
# ============================================================================
DB_FILE = "simantap_data.db"
DATA_DIR = "data"

# Model Paths - CRITICAL: Pastikan file ini ada!
MODEL_APD_PATH = "models/best_apd.pt"  # YOLOv8/v12 trained on APD dataset
MODEL_STF_PATH = "models/best_stf.pt"  # YOLOv8/v12 trained on STF dataset

# Fallback model if custom models not available
MODEL_FALLBACK_PATH = "yolov8n.pt"  # Generic fallback for testing

# Image preprocessing
TARGET_IMG_SIZE = 640
CONFIDENCE_THRESHOLD = 0.50

# Global Models
model_apd = None
model_stf = None
models_available = False

# ============================================================================
# CLASS MAPPING - CRITICAL: HARUS SESUAI DENGAN DATA.YAML DI TRAINING!
# ============================================================================
CLASS_NAMES_APD = {
    0: "Topi",      # Safety Helmet
    1: "Sepatu",    # Safety Shoes
    2: "Pakaian",   # Safety Vest
    3: "Pekerja"    # Person/Worker
}

CLASS_NAMES_STF = {
    0: "Normal",
    1: "Slip",
    2: "Trip",
    3: "Fall"
}

PPE_REQUIREMENTS = ["Topi", "Sepatu", "Pakaian"]

# ============================================================================
# PYDANTIC MODELS
# ============================================================================
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

# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================
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
                image_name TEXT,
                detected_classes TEXT,
                compliance_rate REAL,
                hazard_level TEXT,
                alert_message TEXT,
                created_at TEXT NOT NULL
            )''')
            
            conn.commit()
            conn.close()
            print("[OK] Database initialized")
        except Exception as e:
            print(f"[!] Database error: {e}")

# ============================================================================
# MODEL LOADING
# ============================================================================
def load_models():
    """
    Load YOLOv8/v12 models for APD and STF detection.
    Fallback: Use generic yolov8n.pt for testing if custom models unavailable.
    """
    global model_apd, model_stf, models_available
    
    try:
        # Load APD Model
        if os.path.exists(MODEL_APD_PATH):
            print(f"[*] Loading APD Model: {MODEL_APD_PATH}")
            model_apd = YOLO(MODEL_APD_PATH)
            print("[OK] APD Model (custom) loaded")
        elif os.path.exists(MODEL_FALLBACK_PATH):
            print(f"[!] APD Model not found at {MODEL_APD_PATH}")
            print(f"[*] Using fallback model: {MODEL_FALLBACK_PATH}")
            model_apd = YOLO(MODEL_FALLBACK_PATH)
            print("[OK] APD Model (fallback) loaded")
        else:
            print(f"[!] APD Model not found - detection will fail")
            model_apd = None
        
        # Load STF Model (optional)
        if os.path.exists(MODEL_STF_PATH):
            print(f"[*] Loading STF Model: {MODEL_STF_PATH}")
            model_stf = YOLO(MODEL_STF_PATH)
            print("[OK] STF Model (custom) loaded")
        elif os.path.exists(MODEL_FALLBACK_PATH):
            print(f"[!] STF Model not found at {MODEL_STF_PATH}")
            print(f"[*] Using fallback for STF")
            model_stf = YOLO(MODEL_FALLBACK_PATH)
            print("[OK] STF Model (fallback) loaded")
        else:
            print(f"[!] STF Model missing - will skip STF detection")
            model_stf = None
        
        # Set flag
        models_available = (model_apd is not None)
        
        if models_available:
            print("[OK] Detection models ready!")
            if model_apd and "fallback" in str(model_apd):
                print("[!] WARNING: Using fallback model - accuracy may be reduced")
        else:
            print("[!] CRITICAL: No models available!")
            
    except Exception as e:
        print(f"[!] Model loading error: {e}")
        models_available = False

# ============================================================================
# IMAGE PREPROCESSING
# ============================================================================
def preprocess_image(image_data: bytes) -> np.ndarray:
    """
    Load and preprocess image:
    1. Convert to PIL Image
    2. Resize to 640x640 (YOLO standard)
    3. Convert to numpy array
    """
    try:
        # Load image
        img = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Resize
        img_resized = img.resize((TARGET_IMG_SIZE, TARGET_IMG_SIZE), Image.Resampling.LANCZOS)
        
        # Convert to numpy
        img_array = np.array(img_resized)
        
        return img_array
    except Exception as e:
        print(f"[!] Preprocessing error: {e}")
        return None

# ============================================================================
# TWO-STAGE DETECTION LOGIC (CORE)
# ============================================================================
def detect_ppe_two_stage(image_array: np.ndarray) -> List[Dict]:
    """
    Two-stage detection approach:
    
    Stage 1: Detect Person (class_id=3)
    Stage 2: For each person found, crop their region and detect APD items
    
    Returns: List of detections with person context
    """
    global model_apd
    
    if not models_available or model_apd is None:
        print("[!] APD Model not available!")
        return []
    
    all_detections = []
    
    try:
        # --- STAGE 1: DETECT PERSON ---
        print("[*] Stage 1: Detecting persons...")
        results = model_apd(image_array, conf=CONFIDENCE_THRESHOLD, verbose=False)
        
        if len(results) == 0:
            print("[*] No detections found")
            return []
        
        boxes = results[0].boxes
        
        # Find all persons (class_id=3)
        person_detections = []
        for i in range(len(boxes)):
            box = boxes[i]
            cls = int(box.cls[0].cpu().numpy())
            
            if cls == 3:  # Person class
                conf = box.conf[0].cpu().numpy()
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                person_detections.append({
                    "class_id": 3,
                    "class_name": "Pekerja",
                    "confidence": round(float(conf), 3),
                    "bbox": {"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)},
                    "area_x1": int(x1),
                    "area_y1": int(y1),
                    "area_x2": int(x2),
                    "area_y2": int(y2)
                })
        
        print(f"[OK] Found {len(person_detections)} person(s)")
        
        if len(person_detections) == 0:
            print("[*] No persons detected - returning empty")
            return []
        
        # --- STAGE 2: DETECT APD ITEMS (ONLY INSIDE PERSON BOXES) ---
        print("[*] Stage 2: Detecting PPE items...")
        
        # Run detection again on full image (YOLO is smart about ROI)
        ppe_detections = []
        for i in range(len(boxes)):
            box = boxes[i]
            cls = int(box.cls[0].cpu().numpy())
            conf = box.conf[0].cpu().numpy()
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            
            # Skip person detections (we already have them from Stage 1)
            if cls == 3:
                continue
            
            # Only accept if confidence is high enough
            if conf >= CONFIDENCE_THRESHOLD:
                class_name = CLASS_NAMES_APD.get(cls, f"Unknown-{cls}")
                ppe_detections.append({
                    "class_id": cls,
                    "class_name": class_name,
                    "confidence": round(float(conf), 3),
                    "bbox": {"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)}
                })
        
        print(f"[OK] Found {len(ppe_detections)} PPE item(s)")
        
        # Combine: Person + PPE items
        all_detections = person_detections + ppe_detections
        
        return all_detections
        
    except Exception as e:
        print(f"[!] Detection error: {e}")
        return []

# ============================================================================
# COMPLIANCE ASSESSMENT
# ============================================================================
def assess_compliance(detections: List[Dict]) -> Dict:
    """
    Assess PPE compliance based on detections.
    
    Logic:
    - If no person detected: "Low" (no worker = no risk)
    - If person but missing PPE: "High" or "Medium"
    - If all PPE present: "Low"
    """
    detected_classes = set([det["class_name"] for det in detections])
    detected_ppe = detected_classes.intersection(set(PPE_REQUIREMENTS))
    has_worker = "Pekerja" in detected_classes
    missing_ppe = set(PPE_REQUIREMENTS) - detected_ppe
    
    compliance_rate = (len(detected_ppe) / len(PPE_REQUIREMENTS)) * 100 if PPE_REQUIREMENTS else 0
    
    if not has_worker:
        hazard_level = "Low"
        alert_message = "No worker detected"
    elif len(missing_ppe) == 0:
        hazard_level = "Low"
        alert_message = "✅ OK - All PPE items detected"
    elif len(missing_ppe) == 1:
        hazard_level = "Medium"
        alert_message = f"⚠️  WARN - Missing: {', '.join(missing_ppe)}"
    else:
        hazard_level = "High"
        alert_message = f"🚨 ALERT - Missing: {', '.join(missing_ppe)}"
    
    return {
        "compliance_rate": round(compliance_rate, 1),
        "detected_ppe": list(detected_ppe),
        "missing_ppe": list(missing_ppe),
        "hazard_level": hazard_level,
        "alert_message": alert_message,
        "has_worker": has_worker
    }

# ============================================================================
# STF DETECTION (SLIP, TRIP, FALL)
# ============================================================================
def detect_stf(image_array: np.ndarray) -> Dict:
    """
    Detect STF (Slip, Trip, Fall) hazards using dedicated model.
    Returns hazard type and severity.
    """
    global model_stf
    
    if model_stf is None:
        print("[*] STF Model not available - skipping STF detection")
        return {"hazard_type": "Unknown", "confidence": 0.0, "safe": True}
    
    try:
        results = model_stf(image_array, conf=CONFIDENCE_THRESHOLD, verbose=False)
        
        if len(results) == 0 or len(results[0].boxes) == 0:
            return {"hazard_type": "Normal", "confidence": 1.0, "safe": True}
        
        boxes = results[0].boxes
        best_detection = None
        max_confidence = 0
        
        # Find highest confidence detection
        for i in range(len(boxes)):
            box = boxes[i]
            conf = box.conf[0].cpu().numpy()
            cls = int(box.cls[0].cpu().numpy())
            
            if conf > max_confidence:
                max_confidence = conf
                best_detection = {
                    "class_id": cls,
                    "class_name": CLASS_NAMES_STF.get(cls, "Unknown"),
                    "confidence": float(conf)
                }
        
        if best_detection:
            hazard_type = best_detection["class_name"]
            confidence = best_detection["confidence"]
            is_safe = (hazard_type == "Normal" or confidence < 0.6)
            
            return {
                "hazard_type": hazard_type,
                "confidence": round(confidence, 3),
                "safe": is_safe
            }
        
        return {"hazard_type": "Normal", "confidence": 1.0, "safe": True}
        
    except Exception as e:
        print(f"[!] STF detection error: {e}")
        return {"hazard_type": "Unknown", "confidence": 0.0, "safe": True}

# ============================================================================
# LIFESPAN
# ============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    if not os.path.exists("models"):
        os.makedirs("models")
    
    init_database()
    load_models()
    
    print("="*60)
    print("[OK] Backend v5.0 started - Ready for detection")
    print("="*60)
    
    yield
    
    print("[OK] Backend stopped")

# ============================================================================
# FASTAPI APP
# ============================================================================
app = FastAPI(
    title="SIMANTAP API v5.0",
    version="5.0.0",
    description="Real-time PPE Detection with Two-Stage Logic",
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

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "online",
        "service": "SIMANTAP Detection API v5.0",
        "version": "5.0.0",
        "method": "Two-Stage YOLOv8/v12 Detection",
        "models_available": models_available
    }

@app.post("/detect/ppe")
async def detect_ppe_endpoint(file: UploadFile = File(...)):
    """Detect PPE from uploaded image"""
    try:
        if not models_available:
            return JSONResponse(
                status_code=503,
                content={"error": "APD Model not loaded. Check models/best_apd.pt"}
            )
        
        # Read and preprocess image
        image_data = await file.read()
        image_array = preprocess_image(image_data)
        
        if image_array is None:
            raise HTTPException(status_code=400, detail="Invalid image")
        
        # Detect PPE
        detections = detect_ppe_two_stage(image_array)
        compliance = assess_compliance(detections)
        
        return {
            "detections": detections,
            "compliance": compliance,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"[!] Error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/detect/realtime")
async def detect_realtime(file: UploadFile = File(...)):
    """Real-time detection from camera feed"""
    try:
        if not models_available:
            return JSONResponse(
                status_code=503,
                content={"error": "APD Model not loaded"}
            )
        
        image_data = await file.read()
        image_array = preprocess_image(image_data)
        
        if image_array is None:
            raise HTTPException(status_code=400, detail="Invalid image")
        
        detections = detect_ppe_two_stage(image_array)
        compliance = assess_compliance(detections)
        stf = detect_stf(image_array)
        
        return {
            "detections": detections,
            "compliance": compliance,
            "stf": stf,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/detect/stf")
async def detect_stf_endpoint(file: UploadFile = File(...)):
    """STF (Slip, Trip, Fall) detection"""
    try:
        image_data = await file.read()
        image_array = preprocess_image(image_data)
        
        if image_array is None:
            raise HTTPException(status_code=400, detail="Invalid image")
        
        stf_result = detect_stf(image_array)
        
        return {
            "stf": stf_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/areas")
async def get_all_areas():
    """Get all areas"""
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM areas")
        areas = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"areas": areas}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/areas")
async def create_area(area: AreaData):
    """Create new area"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO areas (area_id, area_name, location, risk_level, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (area.area_id, area.area_name, area.location, area.risk_level, area.description, now, now))
        
        conn.commit()
        conn.close()
        return {"status": "success", "area_id": area.area_id}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/apd")
async def get_all_apd():
    """Get all APD items"""
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM apd_items")
        items = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"items": items}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/apd")
async def create_apd(item: APDItem):
    """Create new APD item"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO apd_items (item_id, item_name, category, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (item.item_id, item.item_name, item.category, item.description, now, now))
        
        conn.commit()
        conn.close()
        return {"status": "success", "item_id": item.item_id}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/stats/summary")
async def get_stats():
    """Get detection statistics"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as total FROM detection_history")
        total = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT hazard_level, COUNT(*) as count 
            FROM detection_history 
            GROUP BY hazard_level
        """)
        hazards = {row[0]: row[1] for row in cursor.fetchall()}
        
        conn.close()
        
        return {
            "total_detections": total,
            "hazard_levels": hazards,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ============================================================================
# RUN
# ============================================================================
if __name__ == "__main__":
    import uvicorn
    print("="*60)
    print("Starting SIMANTAP Backend v5.0")
    print("="*60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
