import serial
import serial.tools.list_ports
import re
import requests
import threading
import time
from queue import Queue
from flask import Flask, request, jsonify
import asyncio
import aiohttp
import json

app = Flask(__name__)

# Gunakan Queue dengan maxsize untuk mencegah bottleneck
queue = Queue(maxsize=100)
serial_threads = []
fifo_thread = None
ser_left = None
selected_ports = {"left": None}

SERVER_URL = 'http://192.168.0.116:8000'
API_WEIGHT = '/api/live-weight'
HEADERS = {'Content-Type': 'application/json', 'Accept': 'application/json'}

def scan_ports():
    ports = [port.device for port in serial.tools.list_ports.comports()]
    return ports

def read_serial_data(ser, sensor_name):
    """Optimized serial data reading dengan parsing sesuai kode lama"""
    buffer = ""
    
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
                        # Parsing sesuai kode lama
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

                        # Check indicator sesuai kode lama
                        if indicator_timbang == "KG":
                            print(f"[{sensor_name}] Data accepted")
                            print(f"[{sensor_name}] Add ke queue: ({sensor_name}, {value})")
                            
                            # Non-blocking queue put
                            try:
                                queue.put_nowait((sensor_name, value))
                            except:
                                # Queue full, skip oldest data
                                try:
                                    queue.get_nowait()
                                    queue.put_nowait((sensor_name, value))
                                except:
                                    pass

                    except IndexError:
                        print(f"[{sensor_name}] Parsing error: {data}")
                    except ValueError as ve:
                        print(f"[{sensor_name}] ValueError saat parsing: {ve} | data: {data}")
                        
            else:
                # Minimal sleep jika tidak ada data
                time.sleep(0.001)  # 1ms
                
        except Exception as e:
            print(f"[{sensor_name}] Error reading serial: {e}")
            time.sleep(0.01)

def start_listeners(left_port):
    """Start optimized serial listener dengan pilihan FIFO mode"""
    global ser_left, serial_threads, fifo_thread

    try:
        # Optimized serial settings dengan timeout sesuai kode lama
        ser_left = serial.Serial(
            left_port, 
            baudrate=9600, 
            timeout=1,  # Timeout sama seperti kode lama
            bytesize=serial.EIGHTBITS,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            xonxoff=False,
            rtscts=False,
            dsrdtr=False
        )
        
        # Clear buffer
        ser_left.flushInput()
        ser_left.flushOutput()
        
    except Exception as e:
        print("Failed opening serial ports:", e)
        return False

    # Initialize HTTP session untuk connection pooling
    initialize_session()

    # Start optimized FIFO thread dengan pilihan mode
    if fifo_thread is None or not fifo_thread.is_alive():
        # Pilihan mode FIFO:
        # 1. optimized_fifo_loop = Batch processing dengan session reuse
        # 2. async_fifo_loop = Concurrent processing dengan aiohttp
        
        # Mode 1: Synchronous dengan optimisasi (recommended untuk stabilitas)
        fifo_thread = threading.Thread(target=optimized_fifo_loop, daemon=True)
        
        # Mode 2: Asynchronous untuk throughput maksimal (uncomment jika diperlukan)
        # fifo_thread = threading.Thread(target=async_fifo_loop, daemon=True)
        
        fifo_thread.start()
        print("[FIFO] Optimized FIFO thread started")

    # Start optimized serial thread
    t1 = threading.Thread(target=read_serial_data, args=(ser_left, 'LEFT'), daemon=True)
    t1.start()

    serial_threads = [t1]
    return True

def post_data_fast(sensor_name, berat):
    """Optimized HTTP POST dengan connection pooling dan retry"""
    payload = {
        "sensor": sensor_name,
        "berat": berat
    }
    
    # Maksimum 2 retry attempts
    max_retries = 2
    retry_delay = 0.1  # 100ms delay between retries
    
    for attempt in range(max_retries + 1):
        try:
            # Optimized request dengan connection reuse
            res = requests.post(
                SERVER_URL + API_WEIGHT, 
                json=payload, 
                headers=HEADERS, 
                timeout=(0.5, 2.0),  # Connection timeout 500ms, Read timeout 2s
                stream=False,  # Don't stream response
                allow_redirects=False  # No redirects for faster response
            )
            
            # Format output sesuai kode lama
            print(f"Sent to server: {sensor_name} {berat} KG | Status: {res.status_code}")
            return  # Success, exit function
            
        except requests.exceptions.Timeout:
            if attempt < max_retries:
                print(f"Timeout {sensor_name} {berat} KG (attempt {attempt+1}/{max_retries+1})")
                time.sleep(retry_delay)
                continue
            else:
                print(f"Final timeout: {sensor_name} {berat} KG")
                
        except requests.exceptions.ConnectionError:
            if attempt < max_retries:
                print(f"Connection error {sensor_name} {berat} KG (attempt {attempt+1}/{max_retries+1})")
                time.sleep(retry_delay * 2)  # Longer delay for connection issues
                continue
            else:
                print(f"Final connection error: {sensor_name} {berat} KG")
                
        except Exception as e:
            print(f"Error posting data: {e}")
            break  # Don't retry for other exceptions

# Global session untuk connection reuse
session = None

def initialize_session():
    """Initialize optimized requests session dengan connection pooling"""
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

def post_data_optimized(sensor_name, berat):
    """Super optimized HTTP POST dengan session reuse"""
    global session
    
    # Initialize session if not exists
    if session is None:
        initialize_session()
    
    payload = {
        "sensor": sensor_name,
        "berat": berat
    }
    
    try:
        # Ultra fast request dengan session reuse
        res = session.post(
            SERVER_URL + API_WEIGHT, 
            json=payload,
            timeout=(0.3, 1.5),     # Very fast: 300ms connect, 1.5s read
            stream=False,
            allow_redirects=False
        )
        
        # Format output sesuai kode lama
        print(f"Sent to server: {sensor_name} {berat} KG | Status: {res.status_code}")
        
    except requests.exceptions.Timeout:
        print(f"Fast timeout: {sensor_name} {berat} KG")
    except requests.exceptions.ConnectionError:
        print(f"🔌Connection error: {sensor_name} {berat} KG")
        # Reset session on connection error
        session = None
    except Exception as e:
        print(f"Error posting data: {e}")

def optimized_fifo_loop():
    """Super optimized FIFO loop dengan batch processing"""
    print("[FIFO] FIFO loop dimulai")
    
    batch_size = 3          # Process up to 3 items at once
    batch_timeout = 0.02    # 20ms max wait for batch
    batch = []
    last_batch_time = time.time()
    
    while True:
        try:
            # Try to get item with short timeout
            try:
                sensor_name, berat = queue.get(timeout=batch_timeout)
                batch.append((sensor_name, berat))
                print(f"[FIFO] Mengambil dari queue: {sensor_name} = {berat}")
            except:
                # No item available
                pass
            
            current_time = time.time()
            time_since_last = current_time - last_batch_time
            
            # Process batch if:
            # 1. Batch is full, OR
            # 2. Timeout reached and batch is not empty
            should_process = (
                len(batch) >= batch_size or 
                (batch and time_since_last >= batch_timeout)
            )
            
            if should_process and batch:
                # Process all items in batch rapidly
                for sensor_name, berat in batch:
                    post_data_optimized(sensor_name, berat)
                    queue.task_done()
                
                batch.clear()
                last_batch_time = current_time
                
            elif not batch:
                # No items to process, small sleep
                time.sleep(0.01)  # 10ms sleep
                last_batch_time = current_time
                
        except Exception as e:
            print(f"[FIFO] Error in loop: {e}")
            time.sleep(0.05)

# Alternative: Async version untuk performance lebih baik
async def async_post_data_optimized(session, sensor_name, berat):
    """Ultra optimized async HTTP POST"""
    payload = {
        "sensor": sensor_name,
        "berat": berat
    }
    try:
        async with session.post(
            SERVER_URL + API_WEIGHT,
            json=payload,
            headers=HEADERS,
            timeout=aiohttp.ClientTimeout(total=1.0, connect=0.3)  # Fast timeouts
        ) as response:
            print(f"Sent to server: {sensor_name} {berat} KG | Status: {response.status}")
    except asyncio.TimeoutError:
        print(f"Async timeout: {sensor_name} {berat} KG")
    except Exception as e:
        print(f"Async error: {e}")

def async_fifo_loop():
    """Ultra optimized async FIFO loop dengan concurrent processing"""
    print("[FIFO] Starting ultra-fast async FIFO loop")
    
    async def process_queue():
        # Optimized connector settings
        connector = aiohttp.TCPConnector(
            limit=20,                    # Increase connection pool
            limit_per_host=15,           # More connections per host
            ttl_dns_cache=600,           # Longer DNS cache
            use_dns_cache=True,
            keepalive_timeout=30,        # Keep connections alive longer
            enable_cleanup_closed=True,  # Clean up closed connections
            force_close=False            # Reuse connections
        )
        
        # Custom timeout settings
        timeout = aiohttp.ClientTimeout(
            total=2.0,      # Total timeout
            connect=0.5,    # Connection timeout  
            sock_read=1.0   # Socket read timeout
        )
        
        async with aiohttp.ClientSession(
            connector=connector, 
            timeout=timeout
        ) as session:
            
            concurrent_tasks = []
            max_concurrent = 10  # Maximum concurrent requests
            
            while True:
                try:
                    # Collect multiple items for concurrent processing
                    batch = []
                    batch_start = time.time()
                    
                    # Collect items for up to 50ms or until batch full
                    while len(batch) < max_concurrent and (time.time() - batch_start) < 0.05:
                        try:
                            sensor_name, berat = queue.get_nowait()
                            batch.append((sensor_name, berat))
                            print(f"[FIFO] Mengambil dari queue: {sensor_name} = {berat}")
                        except:
                            if batch:
                                break  # Process what we have
                            await asyncio.sleep(0.01)  # Wait for data
                            break
                    
                    # Process batch concurrently
                    if batch:
                        tasks = []
                        for sensor_name, berat in batch:
                            task = asyncio.create_task(
                                async_post_data_optimized(session, sensor_name, berat)
                            )
                            tasks.append(task)
                        
                        # Wait for all tasks to complete
                        await asyncio.gather(*tasks, return_exceptions=True)
                        
                        # Mark queue items as done
                        for _ in batch:
                            queue.task_done()
                    
                    else:
                        await asyncio.sleep(0.01)  # No data, short sleep
                        
                except Exception as e:
                    print(f"[ASYNC FIFO] Error: {e}")
                    await asyncio.sleep(0.05)
    
    # Run async loop in thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(process_queue())

# API endpoints (unchanged)
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

@app.route('/api/stats', methods=['GET'])
def api_stats():
    """Endpoint untuk monitoring performance dengan detail HTTP stats"""
    stats = {
        "queue_size": queue.qsize(),
        "max_queue_size": queue.maxsize,
        "threads_alive": len([t for t in serial_threads if t.is_alive()]),
        "fifo_alive": fifo_thread.is_alive() if fifo_thread else False
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

@app.route('/api/switch-mode', methods=['POST'])
def api_switch_mode():
    """Endpoint untuk mengganti mode FIFO (sync/async)"""
    global fifo_thread
    
    data = request.get_json()
    mode = data.get("mode", "sync")  # "sync" atau "async"
    
    try:
        # Stop current FIFO thread
        if fifo_thread and fifo_thread.is_alive():
            print(f"[API] Stopping current FIFO thread...")
            # Note: Thread akan berhenti secara natural karena daemon=True
        
        # Start new thread dengan mode yang dipilih
        if mode == "async":
            fifo_thread = threading.Thread(target=async_fifo_loop, daemon=True)
            fifo_thread.start()
            print(f"[API] Started ASYNC FIFO thread")
            return jsonify({"status": "switched to async mode"})
        else:
            fifo_thread = threading.Thread(target=optimized_fifo_loop, daemon=True)
            fifo_thread.start()
            print(f"[API] Started SYNC FIFO thread")
            return jsonify({"status": "switched to sync mode"})
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
        # Start Flask server
    app.run(host="0.0.0.0", port=5001, debug=True)  # Debug=True seperti kode lama