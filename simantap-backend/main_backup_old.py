"""
SIMANTAP Backend - FastAPI dengan deteksi APD berbasis numpy edge detection
Deteksi: Topi/Helmet, Sepatu/Safety Shoes, Pakaian/Vest, Pekerja/Person
Optimal untuk lingkungan kerja Indonesia
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

# Configuration
DB_FILE = "simantap_data.db"
DATA_DIR = "data"
MODEL_PATH = "models/best.pt"
MODEL_FALLBACK = "yolov8n.pt"

# Global variables
detection_model = None
model_available = False
model_type = "none"  # 'yolo_custom', 'yolo_generic', or 'numpy'

# Class configuration
CLASS_NAMES = {
    0: "Topi",
    1: "Sepatu",
    2: "Pakaian",
    3: "Pekerja"
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
            
            cursor.execute('''CREATE TABLE IF NOT EXISTS training_logs (
                log_id TEXT PRIMARY KEY,
                date TEXT NOT NULL,
                epoch INTEGER,
                loss REAL,
                accuracy REAL,
                validation_accuracy REAL,
                area_id TEXT,
                apd_categories TEXT,
                created_at TEXT NOT NULL
            )''')
            
            cursor.execute('''CREATE TABLE IF NOT EXISTS detection_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                area_id TEXT,
                image_name TEXT,
                detected_classes TEXT,
                compliance_rate REAL,
                hazard_level TEXT,
                detections TEXT
            )''')
            
            conn.commit()
            conn.close()
            print("[OK] Database initialized")
        except Exception as e:
            print(f"[ERROR] Database init: {e}")
    else:
        print("[OK] Database exists")

def load_yolo_model():
    """Try to load YOLOv8, fallback to numpy mode"""
    global detection_model, model_available, model_type
    try:
        try:
            print("[*] Loading YOLOv8 model...")
            
            # Try custom model first
            if os.path.exists("models/best.pt"):
                try:
                    detection_model = YOLO("models/best.pt")
                    model_available = True
                    model_type = "yolo_custom"
                    print("[OK] Custom YOLO model (best.pt) loaded - APD specific!")
                    return True
                except Exception as e:
                    print(f"[!] Custom model failed: {e}, trying fallback...")
            
            # Try generic YOLOv8-nano
            if os.path.exists("yolov8n.pt"):
                detection_model = YOLO("yolov8n.pt")
                model_available = True
                model_type = "yolo_generic"
                print("[OK] YOLOv8-nano (generic model) loaded")
                return True
            
            # Last resort - download yolov8n
            print("[*] Downloading YOLOv8-nano model...")
            detection_model = YOLO("yolov8n.pt")
            model_available = True
            model_type = "yolo_generic"
            print("[OK] YOLOv8-nano downloaded and loaded")
            return True
            
        except ImportError:
            print("[!] Ultralytics not available - using Numpy fallback mode")
            model_available = False
            model_type = "numpy"
            return False
    except Exception as e:
        print(f"[!] YOLO error: {e} - using Numpy fallback mode")
        model_available = False
        model_type = "numpy"
        return False
        return False

def preprocess_image(image_array: np.ndarray) -> np.ndarray:
    """
    Preprocessing gambar dengan CLAHE untuk normalisasi cahaya
    Meningkatkan akurasi deteksi di kondisi pencahayaan buruk
    """
    try:
        # Konversi ke grayscale jika perlu
        if len(image_array.shape) == 3:
            gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_array
        
        # CLAHE - Contrast Limited Adaptive Histogram Equalization
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        return enhanced
    except:
        return image_array

def detect_ppe_numpy(image_array: np.ndarray) -> List[Dict]:
    """
    Deteksi APD dengan edge detection + adaptive spatial analysis
    Fallback method yang lebih robust untuk berbagai kondisi
    """
    detections = []
    h, w = image_array.shape[:2]
    
    try:
        # Preprocessing dengan CLAHE
        if len(image_array.shape) == 3:
            gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_array
        
        gray_enhanced = preprocess_image(image_array)
        
        # Edge detection dengan thresholds yang lebih rendah
        blurred = cv2.GaussianBlur(gray_enhanced, (7, 7), 0)
        edges = cv2.Canny(blurred, 30, 100)
        
        # Morphological operations untuk cleaning
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)
        edges = cv2.morphologyEx(edges, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Adaptive area thresholds based on image size
        min_area = max(300, (h * w) * 0.001)
        max_area = (h * w) * 0.4
        
        # Process each contour
        for contour in contours:
            area = cv2.contourArea(contour)
            
            if area < min_area or area > max_area:
                continue
            
            x, y, cw, ch = cv2.boundingRect(contour)
            
            if cw < 15 or ch < 15:
                continue
            
            aspect_ratio = float(cw) / ch if ch > 0 else 0
            center_y_ratio = (y + ch/2) / h
            center_x_ratio = (x + cw/2) / w
            
            # Calculate compactness (0-1) - helmet harus lebih compact
            hull = cv2.convexHull(contour)
            hull_area = cv2.contourArea(hull)
            solidity = float(area) / hull_area if hull_area > 0 else 0
            
            # Deteksi Pekerja (Person) - full body - relaxed boundaries
            if 0.2 < center_y_ratio < 0.85 and 0.1 < center_x_ratio < 0.9:
                if area > 1500:
                    detections.append({
                        "class_id": 3,
                        "class_name": "Pekerja",
                        "confidence": 0.35,
                        "bbox": {"x1": x, "y1": y, "x2": x+cw, "y2": y+ch}
                    })
            
            # Deteksi Topi (Helmet) - STRICTER: must be helmet-like shape
            # Helmet characteristics: round/oval, compact, distinct edges
            if center_y_ratio < 0.35 and 0.8 < aspect_ratio < 1.4:  # More circular
                if 800 < area < 4000:  # Tighter area bounds
                    if solidity > 0.65:  # Must be compact (helmet property)
                        detections.append({
                            "class_id": 0,
                            "class_name": "Topi",
                            "confidence": 0.28,  # Much lower for Numpy
                            "bbox": {"x1": x, "y1": y, "x2": x+cw, "y2": y+ch}
                        })
            
            # Deteksi Sepatu (Shoes) - bottom 25% only
            if center_y_ratio > 0.75 and 0.6 < aspect_ratio < 2.2:
                if 500 < area < 4000:
                    detections.append({
                        "class_id": 1,
                        "class_name": "Sepatu",
                        "confidence": 0.30,
                        "bbox": {"x1": x, "y1": y, "x2": x+cw, "y2": y+ch}
                    })
            
            # Deteksi Pakaian (Vest/Rompi) - middle body only
            if 0.40 < center_y_ratio < 0.75 and 0.20 < center_x_ratio < 0.80:
                if 1500 < area < 8000 and 0.40 < aspect_ratio < 0.95:
                    if solidity > 0.60:
                        detections.append({
                            "class_id": 2,
                            "class_name": "Pakaian",
                            "confidence": 0.32,
                            "bbox": {"x1": x, "y1": y, "x2": x+cw, "y2": y+ch}
                        })
        
        # Remove duplicates
        unique = {}
        for det in detections:
            cn = det["class_name"]
            if cn not in unique or det["confidence"] > unique[cn]["confidence"]:
                unique[cn] = det
        
        return list(unique.values())
        
    except Exception as e:
        print(f"[!] Numpy detection error: {e}")
        return []

def detect_ppe_yolo(image_array: np.ndarray, confidence_threshold: float = 0.50) -> List[Dict]:
    """Deteksi APD dengan YOLOv8 - Primary detection method"""
    global detection_model, model_available
    
    if not model_available or detection_model is None:
        return []
    
    try:
        # Higher threshold untuk YOLO untuk menghindari false positives
        results = detection_model(image_array, conf=confidence_threshold, verbose=False)
        
        detections = []
        if len(results) > 0 and len(results[0].boxes) > 0:
            boxes = results[0].boxes
            for i in range(len(boxes)):
                box = boxes[i]
                try:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = box.conf[0].cpu().numpy()
                    cls = int(box.cls[0].cpu().numpy())
                    
                    class_name = CLASS_NAMES.get(cls, f"Unknown-{cls}")
                    
                    # Filter out low confidence detections
                    if conf < 0.50:
                        continue
                    
                    detections.append({
                        "class_id": cls,
                        "class_name": class_name,
                        "confidence": round(float(conf), 3),
                        "bbox": {"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)}
                    })
                except:
                    continue
        
        return detections
    except Exception as e:
        print(f"[!] YOLO inference error: {e}")
        return []

def detect_ppe(image_array: np.ndarray, confidence_threshold: float = 0.50) -> List[Dict]:
    """
    Detect PPE - Hybrid approach dengan strict filtering:
    1. Try YOLO first (conf > 50%) - more accurate
    2. Fall back to Numpy edge detection (conf > 25%) - conservative
    3. No false positives dari head/hair sebagai topi
    """
    detections = []
    
    # Try YOLO first (custom or generic)
    if model_available:
        try:
            detections = detect_ppe_yolo(image_array, confidence_threshold)
            if len(detections) > 0:
                print(f"[OK] YOLO detected {len(detections)} objects ({model_type})")
                return detections
        except Exception as e:
            print(f"[!] YOLO failed: {e}")
    
    # Fallback to Numpy if YOLO unavailable or no detections
    print(f"[*] Falling back to Numpy edge detection...")
    numpy_detections = detect_ppe_numpy(image_array)
    
    # Filter Numpy detections - hanya return confidence > 25%
    filtered_detections = [d for d in numpy_detections if d.get("confidence", 0) > 0.25]
    
    if len(filtered_detections) > 0:
        print(f"[OK] Numpy detected {len(filtered_detections)} objects (filtered)")
        return filtered_detections
    
    return []

def assess_compliance(detections: List[Dict]) -> Dict:
    """Assess PPE compliance"""
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
        alert_message = "OK All PPE items detected"
    elif len(missing_ppe) == 1:
        hazard_level = "Medium"
        alert_message = f"WARN Missing: {', '.join(missing_ppe)}"
    else:
        hazard_level = "High"
        alert_message = f"ALERT Missing: {', '.join(missing_ppe)}"
    
    return {
        "compliance_rate": round(compliance_rate, 1),
        "detected_ppe": list(detected_ppe),
        "missing_ppe": list(missing_ppe),
        "hazard_level": hazard_level,
        "alert_message": alert_message,
        "has_worker": has_worker
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
    
    print("[OK] Backend started - ready for detection")
    
    yield
    
    print("[OK] Backend stopped")

# Initialize app
app = FastAPI(
    title="SIMANTAP API",
    version="3.0.0",
    description="Real-time PPE Detection",
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
    allow_headers=["*"],
)

# API ENDPOINTS

@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "online",
        "service": "SIMANTAP Detection API",
        "version": "3.0.0",
        "model": "YOLOv8" if model_available else "numpy-based"
    }

@app.post("/detect/ppe")
async def detect_ppe_endpoint(file: UploadFile = File(...)):
    """Detect PPE in image"""
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        img_array = np.array(img)
        
        detections = detect_ppe(img_array, confidence_threshold=0.45)
        compliance = assess_compliance(detections)
        
        return {
            "success": True,
            "detections": detections,
            "compliance": {
                "compliance_rate": compliance["compliance_rate"],
                "detected_ppe": compliance["detected_ppe"],
                "missing_ppe": compliance["missing_ppe"],
                "hazard_level": compliance["hazard_level"],
                "alert_message": compliance["alert_message"],
                "has_worker": compliance["has_worker"]
            },
            "total_detections": len(detections)
        }
    except Exception as e:
        return {
            "success": False,
            "detections": [],
            "compliance": {
                "compliance_rate": 0,
                "detected_ppe": [],
                "missing_ppe": PPE_REQUIREMENTS,
                "hazard_level": "High",
                "alert_message": f"Error: {str(e)}",
                "has_worker": False
            },
            "total_detections": 0
        }

@app.post("/detect/realtime")
async def detect_realtime(file: UploadFile = File(...)):
    """Real-time detection"""
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        img_array = np.array(img)
        
        detections = detect_ppe(img_array, confidence_threshold=0.45)
        compliance = assess_compliance(detections)
        
        return {
            "success": True,
            "detections": detections,
            "compliance": {
                "compliance_rate": compliance["compliance_rate"],
                "detected_ppe": compliance["detected_ppe"],
                "missing_ppe": compliance["missing_ppe"],
                "hazard_level": compliance["hazard_level"],
                "alert_message": compliance["alert_message"],
                "has_worker": compliance["has_worker"]
            },
            "total_detections": len(detections)
        }
    except Exception as e:
        return {
            "success": False,
            "detections": [],
            "compliance": {
                "compliance_rate": 0,
                "detected_ppe": [],
                "missing_ppe": PPE_REQUIREMENTS,
                "hazard_level": "High",
                "alert_message": f"Error: {str(e)}",
                "has_worker": False
            },
            "total_detections": 0
        }

@app.post("/detect/stf")
async def detect_stf(file: UploadFile = File(...)):
    """Detect STF hazards"""
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        img_array = np.array(img)
        
        detections = detect_ppe(img_array, confidence_threshold=0.45)
        compliance = assess_compliance(detections)
        
        return {
            "success": True,
            "detections": detections,
            "hazards": [],
            "risk_level": compliance["hazard_level"],
            "recommendation": compliance["alert_message"]
        }
    except Exception as e:
        return {
            "success": False,
            "detections": [],
            "hazards": [],
            "risk_level": "High",
            "recommendation": f"Error: {str(e)}"
        }

@app.post("/detect/stf/realtime")
async def detect_stf_realtime(file: UploadFile = File(...)):
    """Real-time STF detection"""
    return await detect_stf(file)

# AREAS ENDPOINTS

@app.get("/areas")
async def get_all_areas():
    """Get all areas"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM areas")
        rows = cursor.fetchall()
        conn.close()
        
        return JSONResponse({
            "success": True,
            "data": [{"area_id": r[0], "area_name": r[1], "location": r[2], "risk_level": r[3]} for r in rows]
        })
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)

@app.get("/areas/{area_id}")
async def get_area(area_id: str):
    """Get specific area"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM areas WHERE area_id = ?", (area_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return JSONResponse({"success": True, "data": {"area_id": row[0], "area_name": row[1]}})
        else:
            raise HTTPException(status_code=404, detail="Area not found")
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)

@app.post("/areas")
async def create_area(area: AreaData):
    """Create new area"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        now = datetime.now().isoformat()
        cursor.execute(
            "INSERT INTO areas VALUES (?, ?, ?, ?, ?, ?, ?)",
            (area.area_id, area.area_name, area.location, area.risk_level, area.description, now, now)
        )
        conn.commit()
        conn.close()
        return JSONResponse({"success": True, "message": "Area created"})
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)

# APD ENDPOINTS

@app.get("/apd")
async def get_all_apd():
    """Get all APD items"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM apd_items")
        rows = cursor.fetchall()
        conn.close()
        
        return JSONResponse({
            "success": True,
            "data": [{"item_id": r[0], "item_name": r[1], "category": r[2]} for r in rows]
        })
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)

@app.post("/apd")
async def create_apd(item: APDItem):
    """Create new APD item"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        now = datetime.now().isoformat()
        cursor.execute(
            "INSERT INTO apd_items VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (item.item_id, item.item_name, item.category, item.description, 0, 0.0, now, now)
        )
        conn.commit()
        conn.close()
        return JSONResponse({"success": True, "message": "APD item created"})
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)

# STATS

@app.get("/stats/summary")
async def get_stats():
    """Get stats"""
    return {
        "total_inspections": 0,
        "compliance_rate": 0,
        "violations_today": 0,
        "model_status": "Online" if model_available else "Offline"
    }

if __name__ == "__main__":
    import uvicorn
    print("=" * 70)
    print("Starting SIMANTAP Backend")
    print("=" * 70)
    print("API: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    print("=" * 70)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
