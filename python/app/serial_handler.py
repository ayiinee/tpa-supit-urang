import serial
import serial.tools.list_ports
import re
import requests
import threading
import time
from queue import Queue

queue = Queue()
serial_threads = []
fifo_thread = None
ser_left = None
selected_ports = {"left": None}

SERVER_URL = 'http://localhost:8000'
API_WEIGHT = '/api/live-weight'
HEADERS = {'Content-Type': 'application/json', 'Accept': 'application/json'}

def scan_ports():
    ports = [port.device for port in serial.tools.list_ports.comports()]
    return ports

def read_serial_data(ser, sensor_name):
    while True:
        try:
            data = ser.readline().decode('utf-8', errors='ignore').strip('\x02 \r\n')
            if not data:
                continue
            indicator_list = re.findall(r'\D+', data)
            angka_list = re.findall(r'\d+', data)
            if not indicator_list or not angka_list:
                continue
            indicator_timbang = indicator_list[0].strip()
            nilai_timbang_raw = angka_list[0]
            nilai_timbang = nilai_timbang_raw.lstrip('0') or '0'
            value = int(nilai_timbang)
            if indicator_timbang == "KG":
                queue.put((sensor_name, value))
        except Exception as e:
            print(f"[{sensor_name}] Error: {e}")

def post_data(sensor_name, berat):
    payload = {"sensor": sensor_name, "berat": berat}
    try:
        requests.post(SERVER_URL + API_WEIGHT, json=payload, headers=HEADERS, timeout=3)
    except Exception as e:
        print("Error posting data:", e)

def fifo_loop():
    while True:
        if not queue.empty():
            sensor_name, berat = queue.get()
            post_data(sensor_name, berat)
        time.sleep(0.1)

def start_listeners(left_port):
    global ser_left, fifo_thread
    try:
        ser_left = serial.Serial(left_port, 9600, timeout=1)
    except Exception as e:
        print("Error opening port:", e)
        return False

    if fifo_thread is None or not fifo_thread.is_alive():
        threading.Thread(target=fifo_loop, daemon=True).start()

    t1 = threading.Thread(target=read_serial_data, args=(ser_left, 'LEFT'), daemon=True)
    t1.start()
    serial_threads.append(t1)
    return True
