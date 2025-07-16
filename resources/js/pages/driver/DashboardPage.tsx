// resources/js/pages/driver/DashboardPage.tsx

import { useEffect, useState } from 'react';
import Barcode from 'react-barcode';

export default function DashboardPage() {
    const [nomorLambung, setNomorLambung] = useState('MEMUAT...');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const noLambungFromUrl = params.get('nomor_lambung');

        if (noLambungFromUrl) {
            setNomorLambung(noLambungFromUrl);
        } else {
            setNomorLambung('DATA TIDAK DITEMUKAN');
        }
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-md">
                <div className="mb-6 rounded-md border-l-4 border-yellow-500 bg-yellow-200 p-4 text-yellow-900">
                    <h3 className="font-bold">PERHATIAN!</h3>
                    <p className="text-sm">Jangan tutup halaman ini sampai Anda keluar dari area TPA.</p>
                </div>

                <h1 className="mb-2 text-xl font-bold text-gray-900">Barcode untuk Gerbang</h1>

                <div className="mt-4 inline-block bg-white p-4">
                    <Barcode value={nomorLambung} width={2} height={80} />
                </div>

                <p className="mt-4 font-mono text-2xl tracking-widest">{nomorLambung}</p>
            </div>
        </main>
    );
}
