# simantap-backend/main_simple.py
"""
Minimal SIMANTAP Backend - FastAPI MVP without ML dependencies
Works with Python 3.13 and minimal packages
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from contextlib import asynccontextmanager
import json
import os
from datetime import datetime
import sqlite3

# Database initialization
def init_database():
    """Initialize SQLite database"""
    DB_FILE = "simantap_data.db"
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
                epoch INTEGER NOT NULL,
                loss REAL NOT NULL,
                accuracy REAL NOT NULL,
                validation_accuracy REAL NOT NULL,
                area_id TEXT,
                apd_categories TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(area_id) REFERENCES areas(area_id)
            )''')
            
            conn.commit()
            conn.close()
            print("[OK] Database initialized")
        except Exception as e:
            print(f"[ERROR] Database init failed: {e}")
    else:
        print("[OK] Database exists")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events"""
    # Startup
    DATA_DIR = "data"
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    init_database()
    print("[OK] Backend initialized")
    yield
    # Shutdown
    print("[OK] Backend shutdown")

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="SIMANTAP API",
    version="1.0.0",
    description="Safety PPE Detection API",
    lifespan=lifespan
)

# CORS Configuration
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

# Configuration
DB_FILE = "simantap_data.db"
DATA_DIR = "data"

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

class TrainingLog(BaseModel):
    log_id: str
    date: str
    epoch: int
    loss: float
    accuracy: float
    validation_accuracy: float
    area_id: str
    apd_categories: List[str]

# Health check
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "SIMANTAP Detection API",
        "version": "1.0.0",
        "mode": "MVP - Mock Mode"
    }

# Detection endpoints (Enhanced with Realistic PPE Detection)
import random
from PIL import Image, ImageFilter, ImageStat
import io
import numpy as np

async def analyze_image_for_ppe(file: UploadFile):
    """Analyze image and provide realistic PPE detection using image analysis"""
    try:
        # Read image file
        contents = await file.read()
        
        # Try to get actual image dimensions and convert to array
        try:
            img = Image.open(io.BytesIO(contents))
            img_width, img_height = img.size
            
            # Convert to RGB array
            img_rgb = img.convert('RGB')
            img_array = np.array(img_rgb, dtype=np.float32)
        except Exception as e:
            print(f"[ERROR] Image processing failed: {e}")
            return {
                "detections": [],
                "detected_ppe": [],
                "missing_ppe": ["Topi", "Pakaian", "Sepatu"],
                "compliance_rate": 0,
                "hazard_level": "High",
                "alert_message": "Gagal memproses gambar",
                "has_worker": False
            }
        
        # Initialize detection results
        detections = []
        detected_ppe = []
        
        try:
            # Define body regions based on image height
            head_top = max(0, int(img_height * 0.05))
            head_bottom = min(img_height, int(img_height * 0.30))
            
            torso_left = max(0, int(img_width * 0.15))
            torso_right = min(img_width, int(img_width * 0.85))
            torso_top = max(0, int(img_height * 0.25))
            torso_bottom = min(img_height, int(img_height * 0.75))
            
            feet_left = max(0, int(img_width * 0.10))
            feet_right = min(img_width, int(img_width * 0.90))
            feet_top = max(0, int(img_height * 0.70))
            feet_bottom = min(img_height, int(img_height * 0.95))
            
            # Helper function to detect edges
            def get_edge_density(region):
                """Calculate edge density in region (0-1) - improved"""
                if region.shape[0] < 3 or region.shape[1] < 3:
                    return 0
                gray = np.mean(region, axis=2)
                # Use Sobel-like edge detection for better accuracy
                dy = np.abs(np.gradient(gray, axis=0))
                dx = np.abs(np.gradient(gray, axis=1))
                edges = np.sqrt(dx**2 + dy**2)
                
                # More aggressive edge detection
                if np.max(edges) > 0:
                    edges_norm = edges / np.max(edges)
                    # Count edges with lower threshold for better detection
                    edge_count = np.sum(edges_norm > 0.10)
                else:
                    edge_count = 0
                
                max_pixels = edges.shape[0] * edges.shape[1]
                density = min(1.0, edge_count / max_pixels)
                return density
            
            # Helper function to detect skin tone (indicates person presence)
            def has_skin_tone(region):
                """Check if region contains human skin tone"""
                if region.shape[0] < 2 or region.shape[1] < 2:
                    return False
                # Expanded skin tone range to handle various lighting
                r = region[:,:,0]
                g = region[:,:,1]
                b = region[:,:,2]
                
                # More flexible skin detection: R > G > B and values in reasonable range
                skin_mask = (r > 75) & (g > 30) & (b > 15) & (r > g) & (g > b)
                skin_percentage = np.sum(skin_mask) / (region.shape[0] * region.shape[1])
                return skin_percentage > 0.03  # At least 3% skin tone
            
            # Helper function to detect color saturation (for colored PPE)
            def get_color_saturation(region):
                """Calculate average color saturation (0-1)"""
                if region.shape[0] < 1 or region.shape[1] < 1:
                    return 0
                r = region[:,:,0]
                g = region[:,:,1]
                b = region[:,:,2]
                
                max_c = np.maximum(np.maximum(r, g), b)
                min_c = np.minimum(np.minimum(r, g), b)
                delta = max_c - min_c
                
                # Avoid division by zero
                brightness = (max_c + min_c) / 2.0
                brightness = np.maximum(brightness, 1)  # At least 1 to avoid div by 0
                
                saturation = delta / brightness
                saturation = np.minimum(saturation, 255)
                
                return np.mean(saturation) / 255.0
            
            def has_person_in_region(region):
                """Check if region has a person - improved to avoid false positives"""
                if region.shape[0] < 1 or region.shape[1] < 1:
                    return False
                
                # Get overall brightness to filter out blank regions
                brightness = np.mean(region)
                
                # Too dark or too bright = likely not person
                if brightness < 5 or brightness > 250:
                    return False
                
                # Multi-factor detection:
                std_dev = np.std(region)
                has_skin = has_skin_tone(region)
                
                # If has skin tone, definitely a person
                if has_skin:
                    return True
                
                # Color distribution diversity
                r_mean = np.mean(region[:,:,0])
                g_mean = np.mean(region[:,:,1])
                b_mean = np.mean(region[:,:,2])
                color_diversity = np.std([r_mean, g_mean, b_mean])
                
                # Edge density for structure
                edge_density = get_edge_density(region)
                
                # High variance + color diversity = clothing
                if std_dev > 15 and color_diversity > 8:
                    return True
                
                # High edge density but not too high = clothing/structure
                if 0.02 < edge_density < 0.40:
                    return True
                
                # Very high texture/variance = clothing/fabric
                if std_dev > 35:
                    return True
                
                return False
            
            # ===== HEAD REGION - Detect Topi (Hat) =====
            if head_top < head_bottom and img_array.shape[0] > head_bottom:
                head_region = img_array[head_top:head_bottom, :, :]
                
                if has_person_in_region(head_region):
                    # Analyze ONLY the top portion where hat would be
                    head_height = head_bottom - head_top
                    hat_portion_end = int(head_height * 0.35)  # Only top 35%
                    
                    if hat_portion_end > 5:
                        hat_region = head_region[:hat_portion_end, :, :]
                        
                        hat_brightness = np.mean(hat_region)
                        hat_edges = get_edge_density(hat_region)
                        hat_saturation = get_color_saturation(hat_region)
                        hat_std = np.std(hat_region)
                        has_skin_hat = has_skin_tone(hat_region)
                        
                        hat_confidence = 0.0
                        
                        # Only detect if NOT skin (hat region shouldn't be face)
                        if not has_skin_hat:
                            # LOGIC 1: Dark structured hat
                            if hat_brightness < 120 and hat_edges > 0.12:
                                hat_confidence = 0.72 + (min(hat_edges - 0.12, 0.2) * 0.12)
                            
                            # LOGIC 2: Colored/safety hat
                            elif hat_saturation > 0.22 and 70 <= hat_brightness <= 180:
                                hat_confidence = 0.70 + (min(hat_saturation - 0.22, 0.2) * 0.10)
                            
                            # LOGIC 3: Bright/white hat
                            elif 180 <= hat_brightness <= 235 and hat_edges > 0.08:
                                hat_confidence = 0.68
                            
                            # LOGIC 4: High structure/edges without face
                            elif hat_edges > 0.14 and hat_std > 20:
                                hat_confidence = 0.65
                        
                        # Cap at 0.78
                        hat_confidence = min(0.78, hat_confidence)
                        
                        # STRICT threshold: 0.65+ only
                        if hat_confidence >= 0.65:
                            hat_size = min(int(head_height * 0.35), int(img_width * 0.45))
                            hat_x1 = max(0, img_width // 2 - hat_size // 2)
                            hat_x2 = min(img_width, hat_x1 + hat_size)
                            
                            detections.append({
                                "class_id": 1,
                                "class_name": "Topi",
                                "confidence": round(hat_confidence, 2),
                                "bbox": {
                                    "x1": hat_x1,
                                    "y1": head_top,
                                    "x2": hat_x2,
                                    "y2": head_top + (hat_x2 - hat_x1)
                                }
                            })
                            detected_ppe.append("Topi")

            
            # ===== TORSO REGION - Detect Pakaian (Clothing) =====
            if torso_top < torso_bottom and torso_left < torso_right:
                if img_array.shape[0] > torso_bottom and img_array.shape[1] > torso_right:
                    torso_region = img_array[torso_top:torso_bottom, torso_left:torso_right, :]
                    
                    if has_person_in_region(torso_region):
                        torso_brightness = np.mean(torso_region)
                        torso_std = np.std(torso_region)
                        torso_edges = get_edge_density(torso_region)
                        torso_saturation = get_color_saturation(torso_region)
                        
                        # Check if this is actually clothing, not skin or background
                        has_skin_torso = has_skin_tone(torso_region)
                        
                        clothing_confidence = 0.0
                        
                        # Only detect clothing if predominantly NOT skin
                        if has_skin_torso:
                            skin_percentage = np.sum(
                                (torso_region[:,:,0] > 75) & (torso_region[:,:,1] > 30) &
                                (torso_region[:,:,2] > 15) & (torso_region[:,:,0] > torso_region[:,:,1])
                            ) / (torso_region.shape[0] * torso_region.shape[1])
                        else:
                            skin_percentage = 0
                        
                        # If more than 40% skin, it's probably not clothing
                        if skin_percentage > 0.40:
                            pass  # Skip detection
                        else:
                            # LOGIC 1: Good structure + reasonable brightness = clothing
                            if torso_edges > 0.09 and 35 <= torso_brightness <= 210:
                                clothing_confidence = 0.70 + (min(torso_edges, 0.25) * 0.08)
                            
                            # LOGIC 2: Dark work clothing
                            elif 20 <= torso_brightness < 85 and torso_edges > 0.08:
                                clothing_confidence = 0.72
                            
                            # LOGIC 3: Colored clothing (safety vest, etc)
                            elif torso_saturation > 0.28 and torso_edges > 0.07 and torso_brightness < 220:
                                clothing_confidence = 0.71 + (min(torso_saturation - 0.28, 0.2) * 0.08)
                            
                            # LOGIC 4: Patterned/textured clothing
                            elif torso_std > 35 and torso_edges > 0.09:
                                clothing_confidence = 0.68
                            
                            # Cap at 0.75
                            clothing_confidence = min(0.75, clothing_confidence)
                            
                            # THRESHOLD: 0.62+ required (strict)
                            if clothing_confidence >= 0.62:
                                c_width = torso_right - torso_left
                                c_height = torso_bottom - torso_top
                                c_size = min(c_width, c_height)
                                c_cx = (torso_left + torso_right) // 2
                                c_cy = (torso_top + torso_bottom) // 2
                                c_x1 = max(0, c_cx - c_size // 2)
                                c_y1 = max(0, c_cy - c_size // 2)
                                c_x2 = min(img_width, c_x1 + c_size)
                                c_y2 = min(img_height, c_y1 + c_size)
                                
                                detections.append({
                                    "class_id": 3,
                                    "class_name": "Pakaian",
                                    "confidence": round(clothing_confidence, 2),
                                    "bbox": {
                                        "x1": c_x1,
                                        "y1": c_y1,
                                        "x2": c_x2,
                                        "y2": c_y2
                                    }
                                })
                                detected_ppe.append("Pakaian")

            
            # ===== FEET REGION - Detect Sepatu (Shoes) =====
            if feet_top < feet_bottom and feet_left < feet_right:
                if img_array.shape[0] > feet_bottom and img_array.shape[1] > feet_right:
                    feet_region = img_array[feet_top:feet_bottom, feet_left:feet_right, :]
                    
                    if has_person_in_region(feet_region):
                        # Separate floor from shoes area
                        shoes_area = feet_region[:int(feet_region.shape[0]*0.6), :, :]  # Top 60% = shoes
                        
                        if shoes_area.shape[0] > 3:
                            shoes_brightness = np.mean(shoes_area)
                            shoes_edges = get_edge_density(shoes_area)
                            shoes_saturation = get_color_saturation(shoes_area)
                            shoes_std = np.std(shoes_area)
                            
                            # Shoes should NOT be skin tone
                            has_skin_shoes = has_skin_tone(shoes_area)
                            
                            shoes_confidence = 0.0
                            
                            # Only detect if NOT skin (feet shouldn't be bare in work environment)
                            if not has_skin_shoes:
                                # LOGIC 1: Dark shoes with good structure (most common)
                                if shoes_brightness < 155 and shoes_edges > 0.09:
                                    if shoes_brightness < 85:
                                        shoes_confidence = 0.72 + (min(shoes_edges - 0.09, 0.2) * 0.10)
                                    else:
                                        shoes_confidence = 0.68 + (min(shoes_edges - 0.09, 0.2) * 0.08)
                                
                                # LOGIC 2: Very dark shoes
                                elif shoes_brightness < 70 and shoes_edges > 0.07:
                                    shoes_confidence = 0.70
                                
                                # LOGIC 3: Medium-dark with texture
                                elif 70 <= shoes_brightness < 145 and shoes_edges > 0.09 and shoes_std > 12:
                                    shoes_confidence = 0.68
                                
                                # LOGIC 4: Colored safety shoes
                                elif shoes_saturation > 0.22 and shoes_brightness < 210 and shoes_edges > 0.07:
                                    shoes_confidence = 0.67 + (min(shoes_saturation - 0.22, 0.2) * 0.08)
                                
                                # LOGIC 5: Patterned shoes (sole texture)
                                elif shoes_std > 22 and shoes_edges > 0.08 and shoes_brightness < 190:
                                    shoes_confidence = 0.65
                            
                            # Cap at 0.73 (shoes are hardest to detect)
                            shoes_confidence = min(0.73, shoes_confidence)
                            
                            # STRICT threshold: 0.62+ only
                            if shoes_confidence >= 0.62:
                                s_width = feet_right - feet_left
                                s_height = feet_bottom - feet_top
                                s_size = min(s_width, s_height)
                                s_cx = (feet_left + feet_right) // 2
                                s_cy = (feet_top + feet_bottom) // 2
                                s_x1 = max(0, s_cx - s_size // 2)
                                s_y1 = max(0, s_cy - s_size // 2)
                                s_x2 = min(img_width, s_x1 + s_size)
                                s_y2 = min(img_height, s_y1 + s_size)
                                
                                detections.append({
                                    "class_id": 2,
                                    "class_name": "Sepatu",
                                    "confidence": round(shoes_confidence, 2),
                                    "bbox": {
                                        "x1": s_x1,
                                        "y1": s_y1,
                                        "x2": s_x2,
                                        "y2": s_y2
                                    }
                                })
                                detected_ppe.append("Sepatu")

        
        except Exception as e:
            print(f"[ERROR] Region analysis failed: {e}")
            pass  # Continue with whatever was detected
        
        # Calculate compliance
        required_ppe = ["Topi", "Pakaian", "Sepatu"]
        missing_ppe = [ppe for ppe in required_ppe if ppe not in detected_ppe]
        compliance_rate = ((len(required_ppe) - len(missing_ppe)) / len(required_ppe)) * 100
        
        # Determine hazard level
        if len(missing_ppe) == 0:
            hazard_level = "Low"
            alert_message = "✓ PPE lengkap - Keselamatan terjamin"
        elif len(missing_ppe) == 1:
            hazard_level = "Medium"
            alert_message = f"⚠ Kurang: {', '.join(missing_ppe)}"
        else:
            hazard_level = "High"
            alert_message = f"❌ Kurang: {', '.join(missing_ppe)}"
        
        return {
            "detections": detections,
            "detected_ppe": detected_ppe,
            "missing_ppe": missing_ppe,
            "compliance_rate": round(compliance_rate, 1),
            "hazard_level": hazard_level,
            "alert_message": alert_message,
            "has_worker": len(detections) > 0
        }
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return {
            "detections": [],
            "detected_ppe": [],
            "missing_ppe": ["Topi", "Pakaian", "Sepatu"],
            "compliance_rate": 0,
            "hazard_level": "High",
            "alert_message": "Error detecting PPE",
            "has_worker": False
        }

@app.post("/detect/ppe")
async def detect_ppe(file: UploadFile = File(...)):
    """Detect PPE in image with intelligent analysis"""
    try:
        analysis = await analyze_image_for_ppe(file)
        
        return JSONResponse({
            "success": True,
            "detections": analysis["detections"],
            "compliance": {
                "compliance_rate": analysis["compliance_rate"],
                "detected_ppe": analysis["detected_ppe"],
                "missing_ppe": analysis["missing_ppe"],
                "hazard_level": analysis["hazard_level"],
                "alert_message": analysis["alert_message"],
                "has_worker": analysis["has_worker"]
            },
            "total_detections": len(analysis["detections"])
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect/realtime")
async def detect_realtime(file: UploadFile = File(...)):
    """Real-time PPE detection for live webcam feed"""
    try:
        analysis = await analyze_image_for_ppe(file)
        
        return JSONResponse({
            "success": True,
            "detections": analysis["detections"],
            "compliance": {
                "compliance_rate": analysis["compliance_rate"],
                "detected_ppe": analysis["detected_ppe"],
                "missing_ppe": analysis["missing_ppe"],
                "hazard_level": analysis["hazard_level"],
                "alert_message": analysis["alert_message"],
                "has_worker": analysis["has_worker"]
            },
            "total_detections": len(analysis["detections"])
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect/stf")
async def detect_stf(file: UploadFile = File(...)):
    """Detect Slip-Trip-Fall hazards using image analysis"""
    try:
        # Read image file
        contents = await file.read()
        
        try:
            img = Image.open(io.BytesIO(contents))
            img_width, img_height = img.size
            
            # Convert to RGB array
            img_rgb = img.convert('RGB')
            img_array = np.array(img_rgb, dtype=np.float32)
        except Exception as e:
            print(f"[ERROR] Image processing failed: {e}")
            return {
                "success": True,
                "hazards": [],
                "risk_level": "Unknown",
                "recommendation": "Unable to analyze image"
            }
        
        hazards = []
        risk_scores = {
            "slip": 0,
            "trip": 0,
            "fall": 0
        }
        
        try:
            # Analyze floor/ground regions (lower half of image)
            ground_region = img_array[int(img_height * 0.6):, :, :]
            
            # SLIP HAZARD DETECTION
            # Detect wet/shiny surfaces by looking at brightness and reflection
            def detect_slip_hazard(region):
                """Detect wet/slippery surfaces"""
                if region.shape[0] < 5 or region.shape[1] < 5:
                    return 0
                
                # High brightness + low variance = shiny/wet surface
                brightness = np.mean(region)
                std_dev = np.std(region)
                
                # Calculate reflection index (high brightness + uniform = reflection)
                reflection_score = 0
                
                # Wet floor indicators:
                # 1. Very bright (reflective)
                if brightness > 200:
                    reflection_score += 0.4
                
                # 2. Uniform brightness (wet surface reflection)
                if std_dev < 20:
                    reflection_score += 0.3
                
                # 3. High saturation in blue/cyan (water reflection)
                r = region[:,:,0]
                g = region[:,:,1]
                b = region[:,:,2]
                
                # Water has higher blue channel
                blue_ratio = np.mean(b) / (np.mean(r) + np.mean(g) + np.mean(b) + 1)
                if blue_ratio > 0.35:
                    reflection_score += 0.3
                
                return min(1.0, reflection_score)
            
            # TRIP HAZARD DETECTION
            # Detect objects and edges on ground
            def detect_trip_hazard(region):
                """Detect trip hazards (objects, cables, uneven surfaces)"""
                if region.shape[0] < 5 or region.shape[1] < 5:
                    return 0
                
                # Convert to grayscale
                gray = np.mean(region, axis=2)
                
                # Edge detection for obstacles
                dy = np.abs(np.gradient(gray, axis=0))
                dx = np.abs(np.gradient(gray, axis=1))
                edges = np.sqrt(dx**2 + dy**2)
                
                # Normalize edges
                if np.max(edges) > 0:
                    edges_norm = edges / np.max(edges)
                else:
                    edges_norm = edges
                
                # Count high edges (obstacles/cables)
                edge_pixels = np.sum(edges_norm > 0.20)
                edge_density = edge_pixels / (edges.shape[0] * edges.shape[1])
                
                # Also check for color variation (objects on ground)
                std_dev = np.std(region)
                
                # Trip hazard score
                trip_score = 0
                
                # High edge density = obstacles
                if edge_density > 0.15:
                    trip_score += 0.5
                
                # High color variation = objects
                if std_dev > 30:
                    trip_score += 0.3
                
                # Uneven surface patterns
                if edge_density > 0.08 and std_dev > 20:
                    trip_score += 0.2
                
                return min(1.0, trip_score)
            
            # FALL HAZARD DETECTION
            # Detect stairs, edges, height differences
            def detect_fall_hazard(img_full):
                """Detect fall hazards (stairs, edges, gaps)"""
                # Analyze full image for structural hazards
                height = img_full.shape[0]
                width = img_full.shape[1]
                
                # Split image horizontally to detect level changes
                top_region = img_full[:height//3, :, :]
                bottom_region = img_full[2*height//3:, :, :]
                
                fall_score = 0
                
                # Detect stair-like patterns (alternating dark/light horizontal lines)
                gray = np.mean(img_full, axis=2)
                
                # Look for horizontal line patterns (stairs)
                horizontal_edges = np.abs(np.gradient(gray, axis=0))
                
                # Detect significant horizontal edges (step edges)
                significant_h_edges = np.sum(horizontal_edges > 20, axis=1)
                
                # Count lines with many edges (stair pattern)
                stair_lines = np.sum(significant_h_edges > width * 0.3)
                stair_ratio = stair_lines / height
                
                # Stair detection
                if stair_ratio > 0.1:  # More than 10% of image has stair pattern
                    fall_score += 0.6
                
                # Detect corners/edges (corners = potential hazards)
                corners = np.sum(np.abs(np.gradient(gray, axis=1)) > 20)
                corner_density = corners / (height * width)
                
                if corner_density > 0.05:
                    fall_score += 0.3
                
                # Height/ledge detection (sudden brightness change)
                top_brightness = np.mean(top_region)
                bottom_brightness = np.mean(bottom_region)
                brightness_diff = abs(top_brightness - bottom_brightness)
                
                if brightness_diff > 50:
                    fall_score += 0.2
                
                return min(1.0, fall_score)
            
            # Calculate hazard scores
            risk_scores["slip"] = detect_slip_hazard(ground_region)
            risk_scores["trip"] = detect_trip_hazard(ground_region)
            risk_scores["fall"] = detect_fall_hazard(img_array)
            
            # Create hazard detections
            if risk_scores["slip"] > 0.45:
                hazards.append({
                    "hazard_type": "Slip",
                    "severity": "High" if risk_scores["slip"] > 0.70 else "Medium",
                    "confidence": round(risk_scores["slip"], 2),
                    "location": "Floor/Ground",
                    "description": "Potentially wet or slippery surface detected",
                    "recommendation": "Use caution - may be slippery surface"
                })
            
            if risk_scores["trip"] > 0.50:
                hazards.append({
                    "hazard_type": "Trip",
                    "severity": "High" if risk_scores["trip"] > 0.70 else "Medium",
                    "confidence": round(risk_scores["trip"], 2),
                    "location": "Ground Level",
                    "description": "Obstacles or uneven surfaces detected",
                    "recommendation": "Watch for objects and uneven surfaces"
                })
            
            if risk_scores["fall"] > 0.40:
                hazards.append({
                    "hazard_type": "Fall",
                    "severity": "High" if risk_scores["fall"] > 0.65 else "Medium",
                    "confidence": round(risk_scores["fall"], 2),
                    "location": "Work Area",
                    "description": "Potential fall hazards detected (stairs, edges, height differences)",
                    "recommendation": "Be cautious of height changes and edges"
                })
            
            # Determine overall risk level
            max_score = max(risk_scores.values())
            if max_score > 0.70:
                risk_level = "High"
            elif max_score > 0.45:
                risk_level = "Medium"
            else:
                risk_level = "Low"
            
            # Generate recommendation
            if hazards:
                hazard_types = [h["hazard_type"] for h in hazards]
                recommendation = f"⚠ Multiple hazards detected: {', '.join(hazard_types)}. Exercise caution in this area."
            else:
                recommendation = "✓ Area appears safe from STF hazards"
            
            return JSONResponse({
                "success": True,
                "hazards": hazards,
                "risk_level": risk_level,
                "risk_scores": {
                    "slip": round(risk_scores["slip"], 2),
                    "trip": round(risk_scores["trip"], 2),
                    "fall": round(risk_scores["fall"], 2)
                },
                "recommendation": recommendation
            })
        
        except Exception as e:
            print(f"[ERROR] STF analysis failed: {e}")
            return JSONResponse({
                "success": True,
                "hazards": [],
                "risk_level": "Unknown",
                "recommendation": f"Analysis error: {str(e)}"
            })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect/stf/realtime")
async def detect_stf_realtime(file: UploadFile = File(...)):
    """Real-time STF hazard detection for live webcam feed"""
    # Just use the same logic as detect_stf
    # Call the main detect_stf function by creating a similar request
    try:
        # Read image and process
        contents = await file.read()
        
        try:
            img = Image.open(io.BytesIO(contents))
            img_width, img_height = img.size
            
            img_rgb = img.convert('RGB')
            img_array = np.array(img_rgb, dtype=np.float32)
        except Exception as e:
            return JSONResponse({
                "success": True,
                "hazards": [],
                "risk_level": "Unknown",
                "recommendation": "Unable to analyze image"
            })
        
        # Reuse the detection logic
        ground_region = img_array[int(img_height * 0.6):, :, :]
        
        def detect_slip(region):
            if region.shape[0] < 5 or region.shape[1] < 5: return 0
            brightness = np.mean(region)
            std_dev = np.std(region)
            score = 0
            if brightness > 200: score += 0.4
            if std_dev < 20: score += 0.3
            r, g, b = region[:,:,0], region[:,:,1], region[:,:,2]
            if np.mean(b) / (np.mean(r) + np.mean(g) + np.mean(b) + 1) > 0.35: score += 0.3
            return min(1.0, score)
        
        def detect_trip(region):
            if region.shape[0] < 5 or region.shape[1] < 5: return 0
            gray = np.mean(region, axis=2)
            dy, dx = np.abs(np.gradient(gray, axis=0)), np.abs(np.gradient(gray, axis=1))
            edges = np.sqrt(dx**2 + dy**2)
            edges_norm = edges / np.max(edges) if np.max(edges) > 0 else edges
            edge_density = np.sum(edges_norm > 0.20) / (edges.shape[0] * edges.shape[1])
            std_dev = np.std(region)
            score = 0
            if edge_density > 0.15: score += 0.5
            if std_dev > 30: score += 0.3
            if edge_density > 0.08 and std_dev > 20: score += 0.2
            return min(1.0, score)
        
        def detect_fall(img_full):
            height, width = img_full.shape[0], img_full.shape[1]
            gray = np.mean(img_full, axis=2)
            h_edges = np.abs(np.gradient(gray, axis=0))
            sig_h = np.sum(h_edges > 20, axis=1)
            stair_ratio = np.sum(sig_h > width * 0.3) / height
            score = 0.6 if stair_ratio > 0.1 else 0
            corners = np.sum(np.abs(np.gradient(gray, axis=1)) > 20) / (height * width)
            if corners > 0.05: score += 0.3
            b_diff = abs(np.mean(img_full[:height//3]) - np.mean(img_full[2*height//3:]))
            if b_diff > 50: score += 0.2
            return min(1.0, score)
        
        scores = {
            "slip": detect_slip(ground_region),
            "trip": detect_trip(ground_region),
            "fall": detect_fall(img_array)
        }
        
        hazards = []
        if scores["slip"] > 0.45:
            hazards.append({
                "hazard_type": "Slip",
                "severity": "High" if scores["slip"] > 0.70 else "Medium",
                "confidence": round(scores["slip"], 2),
                "location": "Floor/Ground",
                "recommendation": "Use caution - may be slippery"
            })
        if scores["trip"] > 0.50:
            hazards.append({
                "hazard_type": "Trip",
                "severity": "High" if scores["trip"] > 0.70 else "Medium",
                "confidence": round(scores["trip"], 2),
                "location": "Ground Level",
                "recommendation": "Watch for obstacles"
            })
        if scores["fall"] > 0.40:
            hazards.append({
                "hazard_type": "Fall",
                "severity": "High" if scores["fall"] > 0.65 else "Medium",
                "confidence": round(scores["fall"], 2),
                "location": "Work Area",
                "recommendation": "Be cautious of height changes"
            })
        
        max_score = max(scores.values())
        risk_level = "High" if max_score > 0.70 else ("Medium" if max_score > 0.45 else "Low")
        
        recommendation = f"⚠ {', '.join([h['hazard_type'] for h in hazards])} detected" if hazards else "✓ Area appears safe"
        
        return JSONResponse({
            "success": True,
            "hazards": hazards,
            "risk_level": risk_level,
            "risk_scores": {k: round(v, 2) for k, v in scores.items()},
            "recommendation": recommendation
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# APD (Personal Protective Equipment) Endpoints
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
        return JSONResponse({
            "success": True,
            "total": len(items),
            "data": items
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/apd/categories")
async def get_apd_categories():
    """Get all APD categories"""
    categories = ["Helmet", "Vest", "Shoes", "Gloves", "Face Shield", "Respirator"]
    return JSONResponse({
        "success": True,
        "data": categories
    })

@app.get("/apd/{category}")
async def get_apd_by_category(category: str):
    """Get APD items by category"""
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM apd_items WHERE category = ?", (category,))
        items = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        if not items:
            return JSONResponse({
                "success": True,
                "total": 0,
                "category": category,
                "data": []
            })
        
        return JSONResponse({
            "success": True,
            "total": len(items),
            "category": category,
            "data": items
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/apd")
async def create_apd(apd: APDItem):
    """Create new APD item"""
    try:
        now = datetime.now().isoformat()
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''INSERT INTO apd_items
            (item_id, item_name, category, description, training_samples, accuracy, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (apd.item_id, apd.item_name, apd.category, apd.description, 0, 0.0, now, now))
        conn.commit()
        conn.close()
        return JSONResponse({
            "success": True,
            "message": "APD item created",
            "data": {
                "item_id": apd.item_id,
                "item_name": apd.item_name,
                "category": apd.category
            }
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Area Management
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
        return JSONResponse({"success": True, "data": areas})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/areas/{area_id}")
async def get_area(area_id: str):
    """Get specific area"""
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM areas WHERE area_id = ?", (area_id,))
        area = cursor.fetchone()
        conn.close()
        
        if not area:
            raise HTTPException(status_code=404, detail="Area not found")
        
        return JSONResponse({"success": True, "data": dict(area)})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/areas")
async def create_area(area: AreaData):
    """Create new area"""
    try:
        now = datetime.now().isoformat()
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''INSERT INTO areas 
            (area_id, area_name, location, risk_level, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (area.area_id, area.area_name, area.location, area.risk_level, area.description, now, now))
        conn.commit()
        conn.close()
        return JSONResponse({"success": True, "message": "Area created"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Stats
@app.get("/stats/summary")
async def get_stats_summary():
    """Get summary statistics"""
    return {
        "total_inspections": 1247,
        "compliance_rate": 87.3,
        "violations_today": 23,
        "high_risk_areas": 5
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting SIMANTAP Backend...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
