import serial
import serial.tools.list_ports
import re
import requests
import time

SERVER_URL = 'http://localhost:8000'
API_WEIGHT = '/api/live-weight'
HEADERS = {'Content-Type': 'application/json', 'Accept': 'application/json'}

def read_serial_data(ser):
    while True:
        try:
            raw = ser.readline().decode('utf-8').strip('\x02 \r\n')
            indicator = re.findall(r'\D+', raw)[0]
            angka = re.findall(r'\d+', raw)[0]
            if indicator == 'KG':
                return int(angka)
        except Exception as e:
            print(f"Gagal baca serial: {e}")
            return None

def kirim_berat_ke_server(berat):
    payload = {'berat': berat}
    try:
        res = requests.post(SERVER_URL + API_WEIGHT, json=payload, headers=HEADERS)
        print("Data dikirim ke server:", res.status_code, res.text)
    except Exception as e:
        print("Gagal kirim data ke server:", e)

def main():
    ports = [port.device for port in serial.tools.list_ports.comports()]
    for idx, port in enumerate(ports):
        print(f"[{idx}] {port}")
    idx = int(input("Pilih port: "))
    port = ports[idx]
    
    ser = serial.Serial(port, 9600, timeout=1)
    print(f"Tersambung ke {port}")

    while True:
        berat = read_serial_data(ser)
        if berat is None:
            continue

        print("Berat terbaca:", berat)
        kirim_berat_ke_server(berat)
        time.sleep(1.5)

if __name__ == '__main__':
    main()
