<?php

namespace App\Http\Controllers;
use App\Models\Supplier;

use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::all();

        return inertia('Supplier', [
            'suppliers' => $suppliers
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'kode_supplier' => 'required|string|max:255',
            'nama_supplier' => 'required|string|max:255',
            'alamat' => 'required|string|max:255',
        ], [
            'kode_supplier.required' => 'Wajib diisi.',
            'nama_supplier.required' => 'Wajib diisi.',
            'alamat.required' => 'Wajib diisi.',
        ]);

        Supplier::create($request->all());

        return redirect()->route('supplier')->with('success', 'Supplier created successfully.');
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $request->validate([
            'kode_supplier' => 'required|string|max:255',
            'nama_supplier' => 'required|string|max:255',
            'alamat' => 'required|string|max:255',
        ], [
            'kode_supplier.required' => 'Wajib diisi.',
            'nama_supplier.required' => 'Wajib diisi.',
            'alamat.required' => 'Wajib diisi.',
        ]
    );

        $supplier->update($request->all());

        return redirect()->route('supplier')->with('success', 'Supplier updated successfully.');
}
    
    public function destroy($id)
    {
        $supplier = Supplier::where('id', $id)->firstOrFail();
        $supplier->delete();

        return redirect()->route('supplier')->with('success', 'Supplier deleted successfully.');
    }
}
