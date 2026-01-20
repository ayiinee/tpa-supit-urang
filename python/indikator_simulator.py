#!/usr/bin/env python3
"""
Simulator indikator berat via SERIAL untuk 2 sensor (LEFT/RIGHT) pada 2 port berbeda.

Pola:
- Mulai dari "000mkg"
- Naik (mkg)
- Stabil (kg tanpa 'm')
- Turun (mkg)
- Kembali ke "000mkg"
"""

import argparse
import time
import threading
from dataclasses import dataclass

import serial


def format_weight_string(weight: int, stable: bool) -> str:
    suffix = "kg" if stable else "mkg"
    if weight <= 999:
        return f"{weight:03d}{suffix}"
    return f"{weight}{suffix}"


@dataclass
class SerialTarget:
    name: str
    port: str
    baud: int


class SerialWriter:
    def __init__(self, target: SerialTarget):
        self.target = target
        self.ser = serial.Serial(
            port=target.port,
            baudrate=target.baud,
            bytesize=serial.EIGHTBITS,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            timeout=0,          # non-blocking read
            write_timeout=0.2,  # fail fast
        )
        self.lock = threading.Lock()

    def send_line(self, line: str) -> None:
        # Banyak alat timbangan mengirim line-based data
        payload = (line + "\r\n").encode("ascii", errors="ignore")
        with self.lock:
            self.ser.write(payload)
            self.ser.flush()

    def close(self) -> None:
        with self.lock:
            try:
                self.ser.close()
            except Exception:
                pass


def run_cycle(
    left: SerialWriter,
    right: SerialWriter,
    max_weight: int,
    step: int,
    interval: float,
    stable_seconds: float,
    idle_seconds: float,
) -> None:
    def send_both(raw: str) -> None:
        # “bersamaan” secara praktis: kirim back-to-back dengan timestamp sama
        left.send_line(raw)
        right.send_line(raw)

    # IDLE awal: 000mkg
    raw0 = format_weight_string(0, stable=False)
    t_end = time.time() + idle_seconds
    while time.time() < t_end:
        send_both(raw0)
        time.sleep(interval)

    # RAMP UP: mkg
    for w in range(0, max_weight + 1, step):
        raw = format_weight_string(w, stable=False)
        send_both(raw)
        time.sleep(interval)

    # STABLE: kg (tanpa m)
    raw_stable = format_weight_string(max_weight, stable=True)
    t_end = time.time() + stable_seconds
    while time.time() < t_end:
        send_both(raw_stable)
        time.sleep(interval)

    # RAMP DOWN: mkg
    for w in range(max_weight, -1, -step):
        raw = format_weight_string(w, stable=False)
        send_both(raw)
        time.sleep(interval)

    # END: 000mkg (tetap kirim sekali)
    send_both(raw0)


def main() -> None:
    p = argparse.ArgumentParser(description="Serial simulator indikator berat (2 port).")
    p.add_argument("--left-port", required=True, help="Port serial untuk LEFT (writer side). Contoh: COM10 atau /dev/pts/3")
    p.add_argument("--right-port", required=True, help="Port serial untuk RIGHT (writer side). Contoh: COM12 atau /dev/pts/5")
    p.add_argument("--baud", type=int, default=9600, help="Baudrate serial (sesuaikan dengan app).")
    p.add_argument("--max-weight", type=int, default=150)
    p.add_argument("--step", type=int, default=5)
    p.add_argument("--interval", type=float, default=0.2)
    p.add_argument("--stable-seconds", type=float, default=3.0)
    p.add_argument("--idle-seconds", type=float, default=2.0, help="Durasi awal kirim 000mkg sebelum naik.")
    p.add_argument("--cycles", type=int, default=0, help="0=loop terus, N=jumlah siklus.")
    args = p.parse_args()

    left = SerialWriter(SerialTarget("LEFT", args.left_port, args.baud))
    right = SerialWriter(SerialTarget("RIGHT", args.right_port, args.baud))

    try:
        if args.cycles == 0:
            while True:
                run_cycle(left, right, args.max_weight, args.step, args.interval, args.stable_seconds, args.idle_seconds)
        else:
            for _ in range(args.cycles):
                run_cycle(left, right, args.max_weight, args.step, args.interval, args.stable_seconds, args.idle_seconds)
    finally:
        left.close()
        right.close()


if __name__ == "__main__":
    main()
