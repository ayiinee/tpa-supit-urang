import serial

try:
    ser = serial.Serial('COM4', 9600, timeout=1)
    print(f"Opened {ser.name}")
    
    while True:
        line = ser.readline().decode(errors='ignore').strip()
        if line:
            print(f"Received: {line}")
except Exception as e:
    print(f"Error: {e}")
