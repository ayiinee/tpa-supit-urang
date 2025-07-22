import axios from 'axios';
import { useEffect, useState } from 'react';

// tinggal diatur koordinat areanya
const zoneAreas = {
    'Sorting Zone': {
        minLat: -6.25,
maxLat: -6.10,
minLon: 106.70,
maxLon: 106.95,
    },
    'Composting Zone': {
        minLat: -6.20, maxLat: -6.15,
        minLon: 106.75, maxLon: 106.80,
    },
    'Sanitary Landfill': {
        minLat: -6.15, maxLat: -6.10,
        minLon: 106.80, maxLon: 106.85,
    },
};

function detectZone(latitude: number, longitude: number): string | null {
    for (const [zoneName, area] of Object.entries(zoneAreas)) {
        const { minLat, maxLat, minLon, maxLon } = area;
        if (latitude >= minLat && latitude <= maxLat && 
            longitude >= minLon && longitude <= maxLon) {
            return zoneName;
        }
    }
    return null;
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
                const zone = detectZone(latitude, longitude);

                if (zone) {
                    setStatusMessage(`Lokasi berhasil dilacak di dalam TPA.`);
                    setIsTracking(true);

                    axios
                        .post('/driver/track', {
                            no_lambung: noLambungFromUrl,
                            latitude: latitude,
                            longitude: longitude,
                            zone: zone,
                        })
                        .catch((err) => {
                            console.error('Gagal mengirim lokasi:', err);
                            setStatusMessage('Gagal mengirim data lokasi ke server.');
                        });
                } else {
                    setStatusMessage('Anda telah keluar dari area TPA. Tracking dihentikan.');
                    setIsTracking(true);
                    navigator.geolocation.clearWatch(watchId);
                }
            },
            (error) => {
                setStatusMessage('GPS tidak aktif atau izin lokasi ditolak.');
                setIsTracking(false);
                console.error('Error GPS:', error);
            },
            { enableHighAccuracy: true },
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-md">
                <h1 className="mb-4 text-2xl font-bold text-gray-900">Truk: {nomorLambung}</h1>

                <div
                    className={`rounded-md border-l-4 p-4 ${isTracking ? 'border-blue-500 bg-blue-100 text-blue-900' : 'border-red-500 bg-red-100 text-red-900'}`}
                >
                    <h3 className="font-bold">STATUS</h3>
                    <p className="text-sm">{statusMessage}</p>
                </div>

                {isTracking && <p className="mt-4 text-sm text-gray-600">Aplikasi ini sedang melacak lokasi Anda. Jangan tutup halaman ini.</p>}
            </div>
        </main>
    );
}
