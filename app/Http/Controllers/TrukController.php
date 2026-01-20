<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\Truk;
use App\Models\Sampah;
use Inertia\Inertia;

use Illuminate\Http\Request;

class TrukController extends Controller
{
    public function index()
    {
        return Inertia::render('Truk', $this->getTrukData());
    }

    public function store(Request $request)
    {
        $request->validate([
            'no_lambung' => 'required|string|max:255|unique:truk,no_lambung',
            'no_polisi' => 'required|string|max:255',
            'nama_supir' => 'required|string|max:255',
            'kode_supplier' => 'required|string|exists:supplier,kode_supplier',
            'barang' => 'required|integer|exists:sampah,id',
        ], [
            'no_lambung.required' => 'Wajib diisi.',
            'no_polisi.required' => 'Wajib diisi.',
            'nama_supir.required' => 'Wajib diisi.',
            'kode_supplier.required' => 'Wajib diisi.',
            'barang.required' => 'Wajib diisi.',
            'kode_supplier.exists' => 'Kode supplier tidak ditemukan.',
            'barang.exists' => 'Barang tidak ditemukan.',
        ]);


        Truk::create($request->all());

        return redirect()->route('truk')->with('success', 'Truk created successfully.');
    }

    public function update(Request $request, $id)
    {
        $truk = Truk::findOrFail($id);

        $request->validate([
            'no_lambung' => 'required|string|max:255|unique:truk,no_lambung,' . $id,
            'no_polisi' => 'required|string|max:255',
            'nama_supir' => 'required|string|max:255',
            'kode_supplier' => 'required|string|max:255',
            'barang' => 'required|string|max:255',
            'nama_supir' => 'required|string|max:255',
        ], [
            'no_lambung.required' => 'Wajib diisi.',
            'no_polisi.required' => 'Wajib diisi.',
            'nama_supir.required' => 'Wajib diisi.',
            'kode_supplier.required' => 'Wajib diisi.',
            'barang.required' => 'Wajib diisi.',
            'kode_supplier.exists' => 'Kode supplier tidak ditemukan.',
            'barang.exists' => 'Barang tidak ditemukan.',
        ]);

        $truk->update($request->all());

        return redirect()->route('truk')->with('success', 'Truk updated successfully.');
    }

    public function destroy($id)
    {
        $truk = Truk::findOrFail($id);
        $truk->delete();

        return redirect()->route('truk')->with('success', 'Truk deleted successfully.');
    }

    public function fetchAll()
    {
        return response()->json($this->getTrukData());
    }

    public function search(Request $request)
    {
        $query = trim($request->get('query', ''));
        $limit = (int) $request->get('limit', 50);
        $limit = $limit > 0 ? $limit : 50;

        $trucks = Truk::with('sampah')
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where('no_polisi', 'like', '%' . $query . '%');
            })
            ->orderBy('no_polisi')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'no_lambung' => $item->no_lambung,
                    'no_polisi' => $item->no_polisi,
                    'nama_supir' => $item->nama_supir,
                    'barang' => $item->sampah ? [
                        'jenis_sampah' => $item->sampah->jenis_sampah,
                    ] : null,
                ];
            });

        return response()->json(['trucks' => $trucks]);
    }
    private function getTrukData()
    {
        $trucks = Truk::with(['supplier', 'sampah'])->orderBy('id', 'desc')->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'no_lambung' => $item->no_lambung,
                    'no_polisi' => $item->no_polisi,
                    'nama_supir' => $item->nama_supir,
                    'kode_supplier' => [
                        'kode_supplier' => $item->supplier->kode_supplier ?? null,
                        'nama_supplier' => $item->supplier->nama_supplier ?? null,
                    ],
                    'barang' => [
                        'id' => $item->sampah->id ?? null,
                        'jenis_sampah' => $item->sampah->jenis_sampah ?? null,
                    ],
                ];
            });

        $suppliers = Supplier::select('kode_supplier', 'nama_supplier')->get();
        $sampahs = Sampah::select('id', 'jenis_sampah')->get();

        return compact('trucks', 'suppliers', 'sampahs');
    }
}
