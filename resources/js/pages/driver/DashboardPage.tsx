// resources/js/pages/driver/DashboardPage.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Barcode from 'react-barcode'; // Impor kembali komponen Barcode

// const tpaArea = {
//     minLat: -7.9866951,
//     maxLat: -7.9803255,
//     minLon: 112.5757449,
//     maxLon: 112.5827502,
// };

const tpaArea = {
    minLat: -8.038,   // batas selatan Kota Malang
    maxLat: -7.930,   // batas utara Kota Malang
    minLon: 112.545,  // batas barat Kota Malang
    maxLon: 112.719,  // batas timur Kota Malang
};

// Fungsi untuk mengecek apakah lokasi berada di dalam area
function isInsideArea(latitude: number, longitude: number): boolean {
  const { minLat, maxLat, minLon, maxLon } = tpaArea;
  return latitude >= minLat && latitude <= maxLat && longitude >= minLon && longitude <= maxLon;
}

export default function DashboardPage() {
  const [nomorLambung, setNomorLambung] = useState('MEMUAT...');
  const [statusMessage, setStatusMessage] = useState('Menginisialisasi tracking...');
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const noLambungFromUrl = params.get('nomor_lambung');

    if (noLambungFromUrl) {
      setNomorLambung(noLambungFromUrl);
    } else {
      setStatusMessage('Nomor Lambung tidak valid. Silakan login kembali.');
      setIsTracking(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

            console.log('Browser mendeteksi lokasi:', { latitude, longitude });

        if (isInsideArea(latitude, longitude)) {
          setStatusMessage(`Lokasi berhasil dilacak di dalam TPA.`);
          setIsTracking(true);

          axios.post('/driver/track', {
              no_lambung: noLambungFromUrl,
              latitude: latitude,
              longitude: longitude,
          }).catch(err => {
              console.error("Gagal mengirim lokasi:", err);
              setStatusMessage('Gagal mengirim data lokasi ke server.');
          });

        } else {
          setStatusMessage('Anda telah keluar dari area TPA. Tracking dihentikan.');
          setIsTracking(false);
          navigator.geolocation.clearWatch(watchId);
        }
      },
      (error) => {
        setStatusMessage('GPS tidak aktif atau izin lokasi ditolak.');
        setIsTracking(false);
        console.error("Error GPS:", error);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Truk: {nomorLambung}</h1>

        <div className={`rounded-md border-l-4 p-4 ${isTracking ? 'border-blue-500 bg-blue-100 text-blue-900' : 'border-red-500 bg-red-100 text-red-900'}`}>
            <h3 className="font-bold">STATUS</h3>
            <p className="text-sm">{statusMessage}</p>
        </div>

        {/* ============================================== */}
        {/* BAGIAN BARCODE DITAMBAHKAN KEMBALI DI SINI */}
        {/* ============================================== */}

        {/* Tampilkan barcode HANYA JIKA tracking sedang aktif */}
        {isTracking && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900">Barcode untuk Gerbang</h2>
            <div className="mt-4 inline-block bg-white p-4">
              <Barcode value={nomorLambung} width={2} height={80} />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Aplikasi ini sedang melacak lokasi Anda. Jangan tutup halaman ini.
            </p>
          </div>
        )}

        {/* Tampilkan pesan terima kasih HANYA JIKA tracking sudah selesai */}
        {!isTracking && statusMessage.includes('keluar dari area') && (
            <p className="mt-6 text-lg font-semibold text-gray-700">
                Terima kasih, tugas Anda di area TPA telah selesai.
            </p>
        )}

      </div>
    </main>
  );
}
