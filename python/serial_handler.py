import serial
import serial.tools.list_ports
import re
import requests
import threading
import time
from queue import Queue
from flask import Flask, request, jsonify
import asyncio
# import aiohttp
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)

queue = Queue()
serial_threads = []
fifo_thread = None
ser_left = None
ser_right = None
selected_ports = {"left": None, "right": None}

SERVER_URL = 'http://192.168.0.116:8000'
API_WEIGHT = '/api/live-weight'
HEADERS = {'Content-Type': 'application/json', 'Accept': 'application/json'}

# Thread pool for async HTTP requests
executor = ThreadPoolExecutor(max_workers=5)

def scan_ports():
    ports = [port.device for port in serial.tools.list_ports.comports()]
    return ports

def read_serial_data(ser, sensor_name):
    while True:
        try:
            data = ser.readline().decode('utf-8', errors='ignore').strip('\x02 \r\n')
            if not data:
                continue

            print(f"[{sensor_name}] RAW repr: {repr(data)}")

            try:
                indicator_list = re.findall(r'\D+', data)
                angka_list = re.findall(r'\d+', data)

                if not indicator_list or not angka_list:
                    print(f"[{sensor_name}] Tidak ditemukan angka atau indikator pada: {data}")
                    continue

                indicator_timbang = indicator_list[0].strip()
                nilai_timbang_raw = angka_list[0]
                nilai_timbang = nilai_timbang_raw.lstrip('0') or '0'
                value = int(nilai_timbang)

                print(f"[{sensor_name}] Indicator: {indicator_timbang}")
                print(f"[{sensor_name}] Value: {nilai_timbang} (raw: {nilai_timbang_raw})")

                if indicator_timbang == "KG":
                    print(f"[{sensor_name}] Data accepted")
                    print(f"[{sensor_name}] Add ke queue: ({sensor_name}, {value})")
                    queue.put((sensor_name, value))

            except (IndexError, ValueError) as e:
                print(f"[{sensor_name}] Parsing error: {e} | data: {data}")

        except Exception as e:
            print(f"[{sensor_name}] Error reading serial: {e}")

def start_listeners(left_port):
    global ser_left, ser_right, serial_threads, fifo_thread

    try:
        ser_left = serial.Serial(left_port, 9600, timeout=1)
    except Exception as e:
        print("Failed opening serial ports:", e)
        return False

    # Start robust FIFO thread with error handling
    if fifo_thread is None or not fifo_thread.is_alive():
        fifo_thread = threading.Thread(target=robust_fifo_loop, daemon=True)
        fifo_thread.start()
        print("[FIFO] Robust FIFO thread started")

    # Start threads
    t1 = threading.Thread(target=read_serial_data, args=(ser_left, 'LEFT'))
    t1.daemon = True
    t1.start()

    serial_threads = [t1]
    return True

def post_data_async(sensor_name, berat):
    """Non-blocking HTTP request using thread pool with retry logic"""
    def _post():
        payload = {
            "sensor": sensor_name,
            "berat": berat
        }
        
        max_retries = 3
        backoff_delay = 0.5
        
        for attempt in range(max_retries):
            try:
                res = requests.post(
                    SERVER_URL + API_WEIGHT, 
                    json=payload, 
                    headers=HEADERS, 
                    timeout=5  # Increased timeout
                )
                if res.status_code == 200:
                    print(f"✓ Sent to server: {sensor_name} {berat} KG | Status: {res.status_code}")
                    return True
                else:
                    print(f"⚠ Server responded with status {res.status_code}: {sensor_name} {berat} KG")
                    
            except requests.exceptions.Timeout:
                print(f"⏰ Timeout (attempt {attempt + 1}/{max_retries}): {sensor_name} {berat} KG")
                if attempt < max_retries - 1:
                    time.sleep(backoff_delay * (2 ** attempt))  # Exponential backoff
                    
            except requests.exceptions.ConnectionError:
                print(f"🔌 Connection error (attempt {attempt + 1}/{max_retries}): Server might be down")
                if attempt < max_retries - 1:
                    time.sleep(backoff_delay * (2 ** attempt))
                    
            except Exception as e:
                print(f"❌ Unexpected error (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(backoff_delay)
        
        print(f"💀 Failed to send after {max_retries} attempts: {sensor_name} {berat} KG")
        return False
    
    # Submit to thread pool (non-blocking)
    executor.submit(_post)

# Enhanced FIFO with connection monitoring and buffering
def robust_fifo_loop():
    """FIFO loop with connection monitoring and offline buffering"""
    print("[FIFO] Robust FIFO loop started")
    offline_buffer = []
    server_available = True
    last_health_check = time.time()
    health_check_interval = 30  # Check server health every 30 seconds
    
    def check_server_health():
        try:
            res = requests.get(f"{SERVER_URL}/health", timeout=3)  # Assuming health endpoint
            return res.status_code == 200
        except:
            try:
                # Fallback: try the main endpoint
                res = requests.get(SERVER_URL, timeout=3)
                return res.status_code in [200, 404]  # 404 is still a response
            except:
                return False
    
    while True:
        current_time = time.time()
        
        # Periodic server health check
        if current_time - last_health_check > health_check_interval:
            server_available = check_server_health()
            print(f"🏥 Server health check: {'✓ Available' if server_available else '❌ Unavailable'}")
            last_health_check = current_time
        
        # Process queue items
        items_processed = 0
        while not queue.empty() and items_processed < 5:  # Process fewer items if server is slow
            try:
                sensor_name, berat = queue.get_nowait()
                
                if server_available:
                    # Send data immediately
                    print(f"[FIFO] Processing: {sensor_name} = {berat}")
                    post_data_async(sensor_name, berat)
                else:
                    # Buffer data for later when server is back
                    offline_buffer.append((sensor_name, berat, current_time))
                    print(f"📦 Buffered offline: {sensor_name} = {berat} (buffer size: {len(offline_buffer)})")
                    
                    # Limit buffer size to prevent memory issues
                    if len(offline_buffer) > 1000:
                        offline_buffer.pop(0)  # Remove oldest item
                        print("⚠ Buffer full, removing oldest data")
                
                items_processed += 1
                
            except:
                break
        
        # Try to send buffered data when server comes back online
        if server_available and offline_buffer:
            print(f"📤 Server back online! Sending {len(offline_buffer)} buffered items...")
            for sensor_name, berat, timestamp in offline_buffer[:10]:  # Send max 10 at a time
                post_data_async(sensor_name, berat)
            offline_buffer = offline_buffer[10:]  # Remove sent items
        
        # Adaptive sleep based on activity
        if items_processed == 0:
            time.sleep(0.05)  # Longer sleep when idle
        else:
            time.sleep(0.01)  # Short sleep when busy

# Alternative: Rate-limited FIFO loop
def rate_limited_fifo_loop():
    """Alternative: Process items with rate limiting"""
    print("[FIFO] Rate-limited FIFO loop started")
    last_send_time = time.time()
    min_interval = 0.1  # Minimum 100ms between sends
    
    while True:
        if not queue.empty():
            sensor_name, berat = queue.get()
            current_time = time.time()
            
            # Rate limiting: ensure minimum interval between sends
            time_since_last = current_time - last_send_time
            if time_since_last < min_interval:
                time.sleep(min_interval - time_since_last)
            
            print(f"[FIFO] Processing: {sensor_name} = {berat}")
            post_data_async(sensor_name, berat)
            last_send_time = time.time()
        else:
            time.sleep(0.01)  # Short sleep when queue is empty

# Data filtering to reduce noise
def filtered_fifo_loop():
    """FIFO loop with data filtering to reduce duplicate/noise data"""
    print("[FIFO] Filtered FIFO loop started")
    last_values = {}  # Store last value for each sensor
    threshold = 5  # Only send if change is > 5 KG
    
    while True:
        if not queue.empty():
            sensor_name, berat = queue.get()
            
            # Check if value changed significantly
            if sensor_name in last_values:
                if abs(berat - last_values[sensor_name]) < threshold:
                    print(f"[FIFO] Skipping {sensor_name}={berat} (too similar to {last_values[sensor_name]})")
                    continue
            
            print(f"[FIFO] Processing: {sensor_name} = {berat}")
            post_data_async(sensor_name, berat)
            last_values[sensor_name] = berat
        else:
            time.sleep(0.01)

# API endpoints remain the same
@app.route('/api/available-ports', methods=['GET'])
def api_available_ports():
    ports = scan_ports()
    return jsonify({"ports": ports})

@app.route('/api/start-listener', methods=['POST'])
def api_start_listener():
    data = request.get_json()
    left = data.get("left")

    if left:
        selected_ports["left"] = left
        success = start_listeners(left)
        if success:
            return jsonify({"status": "ok"})
        else:
            return jsonify({"status": "error opening ports"}), 500
    else:
        return jsonify({"status": "missing ports"}), 400

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)