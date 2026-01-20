#!/usr/bin/env python3
"""
Ultra Real-Time Test Script
Tests immediate processing without queue delays
"""

import requests
import time
import json

SERVER_URL = 'http://localhost:8000'
API_WEIGHT = '/api/live-weight'
HEADERS = {'Content-Type': 'application/json', 'Accept': 'application/json'}

def send_immediate_weight(weight, unit="KG"):
    """Send weight data with immediate processing"""
    payload = {
        "sensor": "LEFT",
        "berat": weight
    }
    
    start_time = time.time()
    
    try:
        response = requests.post(
            SERVER_URL + API_WEIGHT,
            json=payload,
            headers=HEADERS,
            timeout=1.0
        )
        
        end_time = time.time()
        processing_time = (end_time - start_time) * 1000  # Convert to ms
        
        if response.status_code == 200:
            response_data = response.json()
            broadcasted = response_data.get('broadcasted', False)
            print(f"🚀 IMMEDIATE: {weight:05d}{unit} -> {weight} KG | Time: {processing_time:.1f}ms | WebSocket: {'✓' if broadcasted else '✗'}")
            return True
        else:
            print(f"⚠️ Error: {weight:05d}{unit} -> {weight} KG | Status: {response.status_code} | Time: {processing_time:.1f}ms")
            return False
            
    except Exception as e:
        end_time = time.time()
        processing_time = (end_time - start_time) * 1000
        print(f"❌ Error sending {weight:05d}{unit}: {e} | Time: {processing_time:.1f}ms")
        return False

def test_ultra_realtime():
    """Test ultra real-time processing with rapid data"""
    print("🚀 ULTRA REAL-TIME TEST - No Queue Delays")
    print("Sending rapid data to test immediate processing...")
    print()
    
    # Test rapid data transmission
    test_weights = [0, 100, 500, 1000, 5000, 10000, 15000, 10000, 5000, 1000, 500, 100, 0]
    
    print("📊 Rapid Data Test:")
    for i, weight in enumerate(test_weights):
        unit = "KG" if weight == 15000 else "mKG"  # Simulate stable vs measuring
        success = send_immediate_weight(weight, unit)
        
        # Very short delay to test immediate processing
        time.sleep(0.05)  # 50ms between sends
        
        if not success:
            print(f"❌ Failed at weight {weight}")
            break
    
    print()
    print("✅ Ultra real-time test completed!")
    print("Check your dashboard for instant updates!")

def test_arduino_simulation():
    """Test complete Arduino simulation with immediate processing"""
    print("🔄 ARDUINO SIMULATION TEST - Immediate Processing")
    print("Simulating: 0 -> naik (mKG) -> stabil (KG) -> turun (mKG) -> 0")
    print()
    
    max_weight = 15000
    step = 500  # Larger steps for faster test
    stable_duration = 2  # 2 seconds stable
    cycle_delay = 0.1    # 100ms between updates
    
    # Phase 1: Naik (mKG)
    print("📈 Phase 1: Naik (mKG)")
    for weight in range(0, max_weight + 1, step):
        send_immediate_weight(weight, "mKG")
        time.sleep(cycle_delay)
    
    # Phase 2: Stabil (KG)
    print(f"⏸️ Phase 2: Stabil (KG) - {stable_duration}s")
    for i in range(int(stable_duration / cycle_delay)):
        send_immediate_weight(max_weight, "KG")
        time.sleep(cycle_delay)
    
    # Phase 3: Turun (mKG)
    print("📉 Phase 3: Turun (mKG)")
    for weight in range(max_weight, -1, -step):
        send_immediate_weight(weight, "mKG")
        time.sleep(cycle_delay)
    
    print("✅ Arduino simulation completed with immediate processing!")

def main():
    print("=== ULTRA REAL-TIME PROCESSING TEST ===")
    print("Testing immediate data processing without queue delays")
    print("Expected: data_age_ms should be 0, instant updates")
    print()
    
    # Test 1: Rapid data
    test_ultra_realtime()
    
    print()
    time.sleep(1)
    
    # Test 2: Arduino simulation
    test_arduino_simulation()

if __name__ == "__main__":
    main()
