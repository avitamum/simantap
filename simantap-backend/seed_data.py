#!/usr/bin/env python3
# simantap-backend/seed_data.py
"""
Database seeder untuk menginisialisasi data awal
"""

import sqlite3
from datetime import datetime
import json

DB_FILE = "simantap_data.db"

def seed_database():
    """Seed database dengan data awal"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    print("🌱 Seeding database dengan data awal...")
    
    # Sample Areas
    areas = [
        ("area_001", "Production Floor A", "Building 1, Floor 2", "High", "Main production area with heavy machinery"),
        ("area_002", "Warehouse B", "Building 2, Ground Floor", "Medium", "Storage and inventory management area"),
        ("area_003", "Maintenance Zone", "Building 1, Floor 1", "High", "Equipment maintenance and repair area"),
        ("area_004", "Office Area C", "Building 3, Floor 1", "Low", "Administrative and office workspace"),
        ("area_005", "Loading Dock", "Building 2, Ground Floor", "High", "Shipping and receiving operations"),
    ]
    
    for area in areas:
        try:
            cursor.execute('''
                INSERT INTO areas (area_id, area_name, location, risk_level, description, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (*area, datetime.now().isoformat(), datetime.now().isoformat()))
            print(f"  ✓ Area {area[1]} created")
        except sqlite3.IntegrityError:
            print(f"  ⚠ Area {area[0]} already exists")
    
    # Sample APD Items
    apd_items = [
        ("apd_001", "Safety Helmet", "Head Protection", "Standard hard hat for construction and industry", 5000, 95.88),
        ("apd_002", "Safety Vest", "Body Protection", "High-visibility reflective safety vest", 4500, 95.88),
        ("apd_003", "Safety Shoes", "Foot Protection", "Steel-toe safety shoes with slip resistance", 4800, 92.60),
        ("apd_004", "Work Gloves", "Hand Protection", "Industrial work gloves with grip", 3500, 90.50),
        ("apd_005", "Face Shield", "Face Protection", "Clear protective face shield", 2000, 88.30),
        ("apd_006", "Ear Protection", "Hearing Protection", "Industrial grade ear muffs", 1500, 85.60),
        ("apd_007", "Respirator", "Respiratory Protection", "N95 and above respiratory protection", 2500, 92.40),
        ("apd_008", "Safety Harness", "Fall Protection", "Full body safety harness for height work", 1200, 91.20),
    ]
    
    for apd in apd_items:
        try:
            cursor.execute('''
                INSERT INTO apd_items (item_id, item_name, category, description, training_samples, accuracy, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (*apd, datetime.now().isoformat(), datetime.now().isoformat()))
            print(f"  ✓ APD Item {apd[1]} created")
        except sqlite3.IntegrityError:
            print(f"  ⚠ APD Item {apd[0]} already exists")
    
    # Sample Training Logs
    training_logs = [
        ("log_001", "2025-01-20", 1, 2.3421, 75.83, 74.21, "area_001", "Helmet,Vest,Shoes"),
        ("log_002", "2025-01-20", 25, 0.4532, 95.63, 94.50, "area_001", "Helmet,Vest,Shoes"),
        ("log_003", "2025-01-21", 50, 0.0234, 97.54, 95.88, "area_001", "Helmet,Vest,Shoes"),
        ("log_004", "2025-01-21", 50, 0.0198, 97.77, 96.42, "area_002", "Helmet,Vest,Shoes"),
        ("log_005", "2025-01-22", 30, 0.1543, 96.21, 95.50, "area_003", "Helmet,Vest,Shoes"),
    ]
    
    for log in training_logs:
        try:
            cursor.execute('''
                INSERT INTO training_logs (log_id, date, epoch, loss, accuracy, validation_accuracy, area_id, apd_categories, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (*log, datetime.now().isoformat()))
            print(f"  ✓ Training Log {log[0]} created")
        except sqlite3.IntegrityError:
            print(f"  ⚠ Training Log {log[0]} already exists")
    
    conn.commit()
    conn.close()
    
    print("\n✅ Database seeding completed!")
    print(f"\nData Summary:")
    print(f"  • {len(areas)} areas")
    print(f"  • {len(apd_items)} APD items")
    print(f"  • {len(training_logs)} training logs")

if __name__ == "__main__":
    try:
        seed_database()
    except Exception as e:
        print(f"❌ Error during seeding: {e}")