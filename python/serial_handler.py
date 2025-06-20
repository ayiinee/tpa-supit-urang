import serial
import serial.tools.list_ports
import re
import requests
import time

# KONFIGURASI
SERVER_URL = 'http://localhost:8000'
API_STORE = '/dashboard/store'       # POST untuk berat masuk
API_UPDATE = '/dashboard/update/'    # PUT untuk berat keluar, tambahkan {no_tiket}
HEADERS = {'Content-Type': 'application/json', 'Accept': 'application/json'}

# Data tetap/manual bisa kamu integrasikan dengan scanner/input lainnya
DATA_TRUK = {
    'no_polisi': 'N1234AB',
    'nama_supir': 'Budi',
    'id_sampah': 1  # ID dari tabel sampah di DB
}

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

def get_today_entries(no_polisi):
    try:
        res = requests.get(f"{SERVER_URL}/dashboard/entries/{no_polisi}")
        if res.status_code == 200:
            return res.json()
    except Exception as e:
        print("Gagal fetch data hari ini:", e)
    return None

def kirim_data_masuk(berat):
    payload = {
        **DATA_TRUK,
        'berat_masuk': berat
    }
    try:
        res = requests.post(SERVER_URL + API_STORE, json=payload, headers=HEADERS)
        print("Data masuk dikirim:", res.status_code, res.text)
    except Exception as e:
        print("Gagal kirim berat masuk:", e)

def kirim_data_keluar(no_tiket, berat_keluar):
    payload = {
        'berat_keluar': berat_keluar
    }
    try:
        res = requests.put(f"{SERVER_URL}{API_UPDATE}{no_tiket}", json=payload, headers=HEADERS)
        print("Data keluar dikirim:", res.status_code, res.text)
    except Exception as e:
        print("Gagal kirim berat keluar:", e)

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
        today_data = get_today_entries(DATA_TRUK['no_polisi'])

        if not today_data or not today_data['entries']:
            # Tidak ada entry hari ini → berat masuk
            kirim_data_masuk(berat)
        else:
            incomplete = today_data['incomplete_entry']
            if incomplete:
                # Ada entry yang belum keluar → update
                kirim_data_keluar(incomplete['no_tiket'], berat)
            else:
                # Semua sudah lengkap → buat baru
                kirim_data_masuk(berat)

        time.sleep(1.5)  # Delay agar tidak spam

if __name__ == '__main__':
    main()
