import serial
import serial.tools.list_ports
import re
import requests
import threading
import time
from flask import Flask, request, jsonify

app = Flask(__name__)

# Ultra real-time processing - no queue needed
serial_threads = []
ser_left = None
ser_right = None
selected_ports = {"left": None, "right": None}

SERVER_URL = 'http://localhost:8000'
API_WEIGHT = '/api/live-weight'
HEADERS = {'Content-Type': 'application/json', 'Accept': 'application/json'}

def scan_ports():
    ports = [port.device for port in serial.tools.list_ports.comports()]
    return ports

def read_serial_data(ser, sensor_name):
    buffer = ""
    last_data_time = time.time()
    timeout_seconds = 1.5  # OPTIMIZED: Reduced timeout for faster cache clearing
    
    while True:
        try:
            # Baca byte demi byte untuk responsifitas lebih baik
            if ser.in_waiting > 0:
                chunk = ser.read(ser.in_waiting).decode('utf-8', errors='ignore')
                buffer += chunk
                
                # Process complete lines
                while '\r\n' in buffer or '\n' in buffer:
                    if '\r\n' in buffer:
                        line, buffer = buffer.split('\r\n', 1)
                    else:
                        line, buffer = buffer.split('\n', 1)
                    
                    # Strip sesuai kode lama
                    data = line.strip('\x02 \r\n ')
                    if not data:
                        continue

                    print(f"[{sensor_name}] RAW repr: {repr(data)}")  # Debug untuk melihat isi mentah

                    try:
                        # Enhanced parsing untuk Arduino simulation format
                        # Format: "00000KG" atau "00000mKG"
                        print(f"[{sensor_name}] Processing data: {data}")
                        
                        # Extract number and unit using regex
                        match = re.match(r'^(\d+)(KG|mKG)$', data.strip())
                        
                        if not match:
                            print(f"[{sensor_name}] Format tidak sesuai: {data}")
                            continue

                        nilai_timbang_raw = match.group(1)
                        unit = match.group(2)
                        nilai_timbang = nilai_timbang_raw.lstrip('0') or '0'
                        value = int(nilai_timbang)

                        print(f"[{sensor_name}] Unit: {unit}")
                        print(f"[{sensor_name}] Value: {nilai_timbang} (raw: {nilai_timbang_raw})")

                        # Accept both KG and mKG data for real-time display
                        # KG = stable weight (ready to save)
                        # mKG = measuring weight (show in real-time)
                        if unit in ["KG", "mKG"]:
                            print(f"[{sensor_name}] Data accepted ({unit}) - Sending immediately")
                            
                            post_data_immediate(sensor_name, value)
                            
                            last_data_time = time.time()
                            
                        else:
                            print(f"[{sensor_name}] Unit tidak dikenali: {unit}")

                    except IndexError:
                        print(f"[{sensor_name}] Parsing error: {data}")
                    except ValueError as ve:
                        print(f"[{sensor_name}] ValueError saat parsing: {ve} | data: {data}")
                        
            else:
                current_time = time.time()
                if current_time - last_data_time > timeout_seconds:
                    print(f"[{sensor_name}] No data for {timeout_seconds}s - clearing cache")
                    try:
                        requests.post(
                            SERVER_URL + '/api/clear-weight-cache',
                            json={"sensor": sensor_name},
                            headers=HEADERS,
                            timeout=1
                        )
                        print(f"[{sensor_name}] Cache cleared due to timeout")
                    except:
                        pass
                    last_data_time = current_time  # Reset timer
                
                time.sleep(0.0005)  # 0.5ms
                
        except Exception as e:
            print(f"[{sensor_name}] Error reading serial: {e}")
            time.sleep(0.01)

def open_serial(port):
    ser = serial.Serial(
        port,
        baudrate=9600,
        timeout=1,  # Timeout sama seperti kode lama
        bytesize=serial.EIGHTBITS,
        parity=serial.PARITY_NONE,
        stopbits=serial.STOPBITS_ONE,
        xonxoff=False,
        rtscts=False,
        dsrdtr=False
    )

    ser.flushInput()
    ser.flushOutput()
    return ser

def start_listeners(left_port=None, right_port=None):
    global ser_left, ser_right, serial_threads

    # Close existing connections if any
    try:
        if ser_left and ser_left.is_open:
            ser_left.close()
        if ser_right and ser_right.is_open:
            ser_right.close()
    except:
        pass

    ser_left = None
    ser_right = None
    serial_threads = []

    if not left_port and not right_port:
        print("No ports provided to start listeners")
        return False

    try:
        if left_port:
            ser_left = open_serial(left_port)

        if right_port:
            ser_right = open_serial(right_port)
        
    except Exception as e:
        print("Failed opening serial ports:", e)
        try:
            if ser_left and ser_left.is_open:
                ser_left.close()
            if ser_right and ser_right.is_open:
                ser_right.close()
        except:
            pass
        return False

    # Initialize HTTP session untuk connection pooling
    initialize_session()

    # Start ultra real-time serial thread - immediate processing, no queue
    t1 = None
    t2 = None

    if ser_left:
        t1 = threading.Thread(target=read_serial_data, args=(ser_left, 'LEFT'), daemon=True)
        t1.start()

    if ser_right:
        t2 = threading.Thread(target=read_serial_data, args=(ser_right, 'RIGHT'), daemon=True)
        t2.start()

    serial_threads = [t for t in [t1, t2] if t]
    return True

session = None

def initialize_session():
    global session
    
    session = requests.Session()
    
    # Connection pooling settings
    adapter = requests.adapters.HTTPAdapter(
        pool_connections=5,      # Pool size
        pool_maxsize=10,         # Max connections in pool
        max_retries=0,           # Handle retries manually
        pool_block=False         # Don't block when pool is full
    )
    
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    
    # Default headers
    session.headers.update(HEADERS)
    
    print("[HTTP] Optimized session initialized with connection pooling")

def post_data_immediate(sensor_name, berat):
    global session
    
    # Initialize session if not exists
    if session is None:
        initialize_session()
    
    payload = {
        "sensor": sensor_name,
        "berat": berat
    }
    
    try:
        # Ultra fast request - immediate processing
        res = session.post(
            SERVER_URL + API_WEIGHT, 
            json=payload,
            timeout=(0.2, 1.0),     # Even faster: 200ms connect, 1s read
            stream=False,
            allow_redirects=False
        )
        
        # Format output
        if res.status_code == 200:
            response_data = res.json()
            broadcasted = response_data.get('broadcasted', False)
            print(f"🚀 IMMEDIATE: {sensor_name} {berat} KG | Status: {res.status_code} | WebSocket: {'✓' if broadcasted else '✗'}")
        else:
            print(f"⚠️ Server response: {sensor_name} {berat} KG | Status: {res.status_code}")
        
    except requests.exceptions.Timeout:
        print(f"Timeout: {sensor_name} {berat} KG")
    except requests.exceptions.ConnectionError:
        print(f"Connection error: {sensor_name} {berat} KG")
        # Reset session on connection error
        session = None
    except Exception as e:
        print(f"Error posting data: {e}")

# REMOVED: post_data_optimized function - using post_data_immediate instead

# API endpoints (unchanged)
@app.route('/api/available-ports', methods=['GET'])
def api_available_ports():
    ports = scan_ports()
    return jsonify({"ports": ports})

@app.route('/api/start-listener', methods=['POST'])
def api_start_listener():
    data = request.get_json() or {}
    left = data.get("left")
    right = data.get("right")

    if left or right:
        selected_ports["left"] = left
        selected_ports["right"] = right
        success = start_listeners(left, right)
        if success:
            return jsonify({"status": "ok"})
        else:
            return jsonify({"status": "error opening ports"}), 500
    else:
        return jsonify({"status": "missing ports"}), 400

@app.route('/api/stats', methods=['GET'])
def api_stats():
    stats = {
        "processing_mode": "ultra_real_time",
        "queue_system": "disabled",
        "threads_alive": len([t for t in serial_threads if t.is_alive()]),
        "immediate_processing": True,
        "selected_ports": selected_ports,
        "left_open": bool(ser_left and ser_left.is_open),
        "right_open": bool(ser_right and ser_right.is_open)
    }
    
    # Add HTTP session stats if available
    if session:
        try:
            adapter = session.get_adapter('http://')
            stats["http_pool_connections"] = adapter.config.get('pool_connections', 'N/A')
            stats["http_pool_maxsize"] = adapter.config.get('pool_maxsize', 'N/A')
        except:
            stats["http_session"] = "active"
    else:
        stats["http_session"] = "not_initialized"
    
    return jsonify(stats)

@app.route('/api/stop-listener', methods=['POST'])
def api_stop_listener():
    global ser_left, ser_right, serial_threads
    
    try:
        # Close serial connection
        if ser_left and ser_left.is_open:
            ser_left.close()
            print("[STOP] Serial connection closed")
        if ser_right and ser_right.is_open:
            ser_right.close()
            print("[STOP] Serial connection closed (right)")
        
        # Clear threads
        serial_threads = []
        
        # Clear Laravel cache
        clear_cache_request = requests.post(
            SERVER_URL + '/api/clear-weight-cache',
            headers=HEADERS,
            timeout=2.0
        )
        
        if clear_cache_request.status_code == 200:
            print("[STOP] Cache cleared successfully")
        else:
            print("[STOP] Failed to clear cache")
        
        return jsonify({"status": "stopped", "message": "Listener stopped and cache cleared"})
            
    except Exception as e:
        print(f"[STOP] Error stopping listener: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Start Flask server
    app.run(host="0.0.0.0", port=5001, debug=True)
