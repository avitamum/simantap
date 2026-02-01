#!/usr/bin/env python3
import sqlite3

conn = sqlite3.connect('simantap_data.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print(f"Tables found: {tables}")
conn.close()
print("DB check OK")