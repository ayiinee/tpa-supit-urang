<?php

namespace App\Http\Controllers;

use App\Models\Sampah;

use Illuminate\Http\Request;

class SampahController extends Controller
{
    public function index()
    {
        $sampahs = Sampah::all();

        return inertia('Sampah', [
            'sampahs' => $sampahs
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'jenis_sampah' => 'required|string|max:255',
            // 'tujuan' => 'required|string|max:255',
        ]);

        sampah::create($request->all());

        return redirect()->route('sampah')->with('success', 'sampah created successfully.');
    }

    public function update(Request $request, $id)
    {
        $sampah = sampah::findOrFail($id);

        $request->validate([
            'jenis_sampah' => 'required|string|max:255',
            // 'tujuan' => 'required|string|max:255',
        ]);

        $sampah->update($request->all());

        return redirect()->route('sampah')->with('success', 'sampah updated successfully.');
    }
    
    public function destroy($id)
    {
        $sampah = sampah::findOrFail($id);
        $sampah->delete();

        return redirect()->route('sampah')->with('success', 'sampah deleted successfully.');
    }
}
