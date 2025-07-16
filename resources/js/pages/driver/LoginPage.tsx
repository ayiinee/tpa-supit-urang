// resources/js/pages/driver/LoginPage.tsx

import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios'; // DITAMBAHKAN

export default function LoginPage() {
  const [nomorLambung, setNomorLambung] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ nomorLambung?: string; password?: string; api?: string }>({});
  const [loading, setLoading] = useState(false); // DITAMBAHKAN: untuk loading state

  const validate = () => {
    // ... fungsi validate tidak berubah ...
    const newErrors: { nomorLambung?: string; password?: string } = {};

    if (!nomorLambung) newErrors.nomorLambung = 'Nomor lambung wajib diisi.';
    else if (nomorLambung.length !== 5) newErrors.nomorLambung = 'Nomor lambung harus 5 karakter.';

    if (!password) newErrors.password = 'Password wajib diisi.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    setLoading(true);

    try {

      const response = await axios.post('/driver/login', {
        nomor_lambung: nomorLambung,
        password: password,
      });

          console.log('Login success:', response.data);

      router.get('/driver/dashboard', { nomor_lambung: response.data.truk.no_lambung });

    } catch (error) {

      if (axios.isAxiosError(error) && error.response) {

        setErrors({ api: error.response.data.message || 'Terjadi kesalahan' });
      } else {
        setErrors({ api: 'Tidak dapat terhubung ke server.' });
      }
    } finally {
      setLoading(false); // Selesai loading
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl text-gray-900 font-bold text-center">Login Truck</h1>
        {errors.api && <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">{errors.api}</div>}

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div>
            <label htmlFor="nomor_lambung" className="block text-sm font-medium text-gray-700">Nomor Lambung</label>
            <input id="nomor_lambung" type="text" className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.nomorLambung ? 'border-red-500' : 'border-gray-300'}`} placeholder="Contoh: TRK01" value={nomorLambung} onChange={(e) => setNomorLambung(e.target.value)} maxLength={5} />
            {errors.nomorLambung && <p className="mt-1 text-xs text-red-600">{errors.nomorLambung}</p>}
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-gray-600">{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <button
            type="submit"
            // DIUBAH: Button akan disable saat loading
            disabled={loading}
            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}
