import serial
import serial.tools.list_ports
import re
import time
import threading
import socketio

# WebSocket client
sio = socketio.Client()

SERVER_URL = "http://localhost:8000"  # pastikan server kamu support websocket/socketio

latest_value = None
lock = threading.Lock()

# ============ WebSocket Events ============
@sio.event
def connect():
    print("[WS] Connected ke server!")

@sio.event
def disconnect():
    print("[WS] Disconnected dari server!")

# ============ Serial Reader ============
def scan_ports():
    ports = [port.device for port in serial.tools.list_ports.comports()]
    return ports

def read_serial_data(ser, sensor_name):
    global latest_value
    buffer = ""
    while True:
        try:
            if ser.in_waiting > 0:
                chunk = ser.read(ser.in_waiting).decode("utf-8", errors="ignore")
                buffer += chunk

                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    data = line.strip("\x02 \r\n ")
                    if not data:
                        continue

                    angka_list = re.findall(r"\d+", data)
                    indicator_list = re.findall(r"\D+", data)
                    if angka_list and indicator_list and indicator_list[0].strip() == "KG":
                        value = int(angka_list[0].lstrip("0") or "0")
                        with lock:
                            latest_value = (sensor_name, value)
                        print(f"[{sensor_name}] {value} KG")
        except Exception as e:
            print(f"[{sensor_name}] Error: {e}")
            time.sleep(0.01)

# ============ Real-time Sender ============
def real_time_sender():
    global latest_value
    while True:
        if latest_value:
            with lock:
                sensor_name, value = latest_value
            sio.emit("weight_update", {"sensor": sensor_name, "berat": value})
            print(f"[WS] Sent: {sensor_name} = {value} KG")
        time.sleep(0.05)  # kirim tiap 50ms

# ============ Main ============
if __name__ == "__main__":
    # Connect ke server websocket
    sio.connect(SERVER_URL)

    # Pilih port (contoh otomatis ambil port pertama)
    ports = scan_ports()
    if not ports:
        print("Tidak ada port serial terdeteksi")
        exit()

    ser = serial.Serial(ports[0], baudrate=9600, timeout=1)

    # Start serial thread
    t1 = threading.Thread(target=read_serial_data, args=(ser, "LEFT"), daemon=True)
    t1.start()

    # Start real-time sender
    real_time_sender()
