import serial
import serial.tools.list_ports
import re
import requests
import threading
import time
from queue import Queue
from flask import Flask, request, jsonify

app = Flask(__name__)

queue = Queue()
serial_threads = []
fifo_thread = None
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
    while True:
        try:
            data = ser.readline().decode('utf-8', errors='ignore').strip('\x02 \r\n')
            if not data:
                continue

            print(f"[{sensor_name}] RAW repr: {repr(data)}")  # Debug untuk melihat isi mentah

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

            except IndexError:
                print(f"[{sensor_name}] Parsing error: {data}")
            except ValueError as ve:
                print(f"[{sensor_name}] ValueError saat parsing: {ve} | data: {data}")

        except Exception as e:
            print(f"[{sensor_name}] Error reading serial: {e}")


def start_listeners(left_port):
    global ser_left, ser_right, serial_threads, fifo_thread

    try:
        ser_left = serial.Serial(left_port, 9600, timeout=1)
        # ser_right = serial.Serial(right_port, 9600, timeout=1)
    except Exception as e:
        print("Failed opening serial ports:", e)
        return False

    # Start FIFO thread if not already started
    if fifo_thread is None or not fifo_thread.is_alive():
        fifo_thread = threading.Thread(target=fifo_loop, daemon=True)
        fifo_thread.start()
        print("[FIFO] FIFO thread started")

    # Start threads
    t1 = threading.Thread(target=read_serial_data, args=(ser_left, 'LEFT'))
    # t2 = threading.Thread(target=read_serial_data, args=(ser_right, 'RIGHT'))
    t1.daemon = True
    # t2.daemon = True
    t1.start()
    # t2.start()

    serial_threads = [t1]
    return True

def post_data(sensor_name, berat):
    payload = {
        "sensor": sensor_name,
        "berat": berat
    }
    try:
        res = requests.post(SERVER_URL + API_WEIGHT, json=payload, headers=HEADERS, timeout=3)
        print(f"Sent to server: {sensor_name} {berat} KG | Status: {res.status_code}")
    except Exception as e:
        print("Error posting data:", e)

def fifo_loop():
    print("[FIFO] FIFO loop dimulai")
    while True:
        if not queue.empty():
            sensor_name, berat = queue.get()
            print(f"[FIFO] Mengambil dari queue: {sensor_name} = {berat}")
            post_data(sensor_name, berat)
        time.sleep(0.1)

# API endpoints

@app.route('/api/available-ports', methods=['GET'])
def api_available_ports():
    ports = scan_ports()
    return jsonify({"ports": ports})

@app.route('/api/start-listener', methods=['POST'])
def api_start_listener():
    data = request.get_json()
    left = data.get("left")
    # right = data.get("right")

    if left:
        selected_ports["left"] = left
        # selected_ports["right"] = right
        success = start_listeners(left)
        if success:
            return jsonify({"status": "ok"})
        else:
            return jsonify({"status": "error opening ports"}), 500
    else:
        return jsonify({"status": "missing ports"}), 400

if __name__ == '__main__':
    # Start Flask server
    app.run(host="0.0.0.0", port=5001, debug=True)