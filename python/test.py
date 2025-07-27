import serial
import time
import random

# Ganti ini dengan COM port virtual transmitter kamu
PORT = 'COM4'
BAUDRATE = 9600

try:
    ser = serial.Serial(PORT, BAUDRATE)
    print(f"[INFO] Mengirim data ke {PORT} setiap 1 detik... Tekan Ctrl+C untuk berhenti.")
    
    while True:
        value = random.randint(1, 9999)  # bisa 1–9999
        angka_str = f"{value:05d}"       # 5 digit dengan leading zero
        data = f"{angka_str}KG\r\n"      # hasil: 00045KG, 01230KG, dll
        ser.write(data.encode())
        print(f"[SENT] {repr(data.strip())}")
        time.sleep(1)

except serial.SerialException:
    print(f"[ERROR] Tidak bisa membuka port {PORT}. Pastikan port tersedia.")
except KeyboardInterrupt:
    print("\n[STOPPED] Pengiriman dihentikan.")
finally:
    if 'ser' in locals() and ser.is_open:
        ser.close()
