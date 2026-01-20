<?php

namespace App\Http\Controllers;

use App\Models\Timbangan;
use App\Models\Sampah;
use App\Models\Truk;
use App\Models\Setting;
use App\Exports\TimbangansExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TimbanganController extends Controller
{
    /**
     * Display the dashboard with timbangan data
     */
    public function index()
    {
        // Ambil data timbangan dengan relasi sampah dan truk
        $timbangans = Timbangan::with(['sampah', 'truk'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('no_tiket', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'no_tiket' => $item->no_tiket,
                    'tanggal' => $item->tanggal,
                    'no_polisi' => $item->no_polisi,
                    'no_lambung' => $item->no_lambung,
                    'nama_supir' => $item->nama_supir,
                    'id_sampah' => $item->id_sampah,
                    'berat_masuk' => $item->berat_masuk,
                    'berat_keluar' => $item->berat_keluar,
                    'netto' => $item->netto,
                    'sampah' => $item->sampah ? [
                        'id' => $item->sampah->id,
                        'jenis_sampah' => $item->sampah->jenis_sampah,
                    ] : null,
                    'truk' => $item->truk ? [
                        'no_polisi' => $item->truk->no_polisi,
                        'nama_supir' => $item->truk->nama_supir,
                    ] : null,
                ];
            });

        $sampah = Sampah::all();
        $trucks = Truk::with('sampah')->get()
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
        $newTicketNumber = $this->generateNoTiket();

        return Inertia::render('Dashboard', [
            'timbangans' => $timbangans,
            'sampahs' => $sampah,
            'trucks' => $trucks,
            'newTicketNumber' => $newTicketNumber,
            'cctvIp' => Setting::get('cctv_ip', ''),
        ]);
    }

    /**
     * Store a new timbangan record
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'no_polisi' => ['required', 'string', 'max:20', Rule::exists('truk', 'no_polisi')],
            'no_lambung' => ['nullable', 'string', 'max:20', Rule::exists('truk', 'no_lambung')],
            'nama_supir' => 'required|string|max:255',
            'id_sampah' => 'required|exists:sampah,id',
            'berat_masuk' => 'required|numeric|min:0|max:999999.99',
            'berat_keluar' => 'nullable|numeric|min:0|max:999999.99',
        ], [
            'no_polisi.required' => 'Wajib diisi',
            'no_polisi.exists' => 'No. Polisi tidak terdaftar dalam sistem',
            'nama_supir.required' => 'Wajib diisi',
            'id_sampah.required' => 'Wajib diisi',
            'id_sampah.exists' => 'Jenis sampah tidak valid',
            'berat_masuk.required' => 'Wajib diisi',
            'berat_masuk.numeric' => 'Berat masuk harus berupa angka',
            'berat_masuk.min' => 'Berat masuk tidak boleh kurang dari 0',
            'berat_keluar.numeric' => 'Berat keluar harus berupa angka',
            'berat_keluar.min' => 'Berat keluar tidak boleh kurang dari 0',
        ]);

        try {
            DB::beginTransaction();

            $netto = $validated['berat_keluar'] ?
                $validated['berat_masuk'] - $validated['berat_keluar'] :
                null;

            if ($netto !== null && $netto < 0) {
                return back()->with('error', 'Berat keluar tidak boleh lebih besar dari berat masuk');
            }

            Timbangan::create([
                'no_tiket' => $this->generateNoTiket(),
                'tanggal' => Carbon::today(),
                ...$validated,
                'netto' => $netto,
            ]);

            DB::commit();

            return redirect()->route('dashboard')->with('success', 'Data timbangan berhasil disimpan');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Update timbangan record (for berat_keluar)
     */
    public function update(Request $request, $no_tiket)
    {
        try {
            $timbangan = Timbangan::where('no_tiket', $no_tiket)->firstOrFail();

            $validated = $request->validate([
                'berat_keluar' => 'required|numeric|min:0|max:999999.99',
            ], [
                'berat_keluar.required' => 'Berat keluar harus diisi',
                'berat_keluar.numeric' => 'Berat keluar harus berupa angka',
                'berat_keluar.min' => 'Berat keluar tidak boleh kurang dari 0',
            ]);

            if ($validated['berat_keluar'] > $timbangan->berat_masuk) {
                return back()->with('error', 'Berat keluar tidak boleh lebih besar dari berat masuk');
            }

            DB::beginTransaction();

            $timbangan->update([
                'berat_keluar' => $validated['berat_keluar'],
                'netto' => $timbangan->berat_masuk - $validated['berat_keluar'],
            ]);

            DB::commit();

            return redirect()->route('dashboard')->with('success', 'Berat keluar berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Delete timbangan record
     */
    public function destroy($no_tiket)
    {
        try {
            Timbangan::where('no_tiket', $no_tiket)->firstOrFail()->delete();
            return redirect()->route('dashboard')->with('success', 'Data berhasil dihapus');
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Get today's entries for a specific truck
     */
    public function getTodayEntries($no_polisi)
    {
        $today = Carbon::today();

        $entries = Timbangan::with(['sampah'])
            ->where('no_polisi', $no_polisi)
            ->whereDate('tanggal', $today)
            ->orderBy('no_tiket', 'desc')
            ->get();

        return response()->json([
            'entries' => $entries,
            'count' => $entries->count(),
            'incomplete_entry' => $entries->firstWhere('berat_keluar', null)
        ]);
    }

    public function getLastIncomplete($no_polisi)
    {
        $today = Carbon::today();

        $incomplete = Timbangan::where('no_polisi', $no_polisi)
            ->whereDate('tanggal', $today)
            ->whereNull('berat_keluar')
            ->orderByDesc('no_tiket')
            ->first();

        return response()->json([
            'entry' => $incomplete,
        ]);
    }

    public function generateNoTiketAPI()
    {
        return response()->json([
            'no_tiket' => $this->generateNoTiket()
        ]);
    }

    public function getAll(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        
        $query = Timbangan::select([
                'no_tiket',
                'tanggal',
                'no_polisi',
                'no_lambung',
                'nama_supir',
                'id_sampah',
                'berat_masuk',
                'berat_keluar',
                'netto',
            ])
            ->with([
                'sampah:id,jenis_sampah',
                'truk:no_polisi,nama_supir',
            ])
            ->orderBy('tanggal', 'desc')
            ->orderBy('no_tiket', 'desc');

        $year = $request->get('year');
        $month = $request->get('month');
        $day = $request->get('day');

        if (!empty($year)) {
            $startDate = Carbon::createFromDate((int) $year, 1, 1)->startOfDay();
            $endDate = Carbon::createFromDate((int) $year, 12, 31)->endOfDay();

            if (!empty($month)) {
                $startDate = Carbon::createFromDate((int) $year, (int) $month, 1)->startOfDay();
                $endDate = Carbon::createFromDate((int) $year, (int) $month, 1)->endOfMonth()->endOfDay();
            }

            if (!empty($day) && !empty($month)) {
                $startDate = Carbon::createFromDate((int) $year, (int) $month, (int) $day)->startOfDay();
                $endDate = Carbon::createFromDate((int) $year, (int) $month, (int) $day)->endOfDay();
            }

            $query->whereBetween('tanggal', [$startDate->toDateString(), $endDate->toDateString()]);
        }
            
        // If pagination parameters are provided, use pagination
        if ($request->has('page') || $request->has('per_page')) {
            $timbangans = $query->paginate($perPage, ['*'], 'page', $page);
            
            return response()->json([
                'data' => $timbangans->items(),
                'total' => $timbangans->total(),
                'per_page' => $timbangans->perPage(),
                'current_page' => $timbangans->currentPage(),
                'last_page' => $timbangans->lastPage(),
                'from' => $timbangans->firstItem(),
                'to' => $timbangans->lastItem(),
            ]);
        }
        
        // If no pagination parameters, return all data
        $timbangans = $query->get();
        return response()->json($timbangans);
    }


    /**
     * Generate automatic ticket number
     */
    private function generateNoTiket()
    {
        $today = Carbon::today();
        $dateString = $today->format('ymd');

        $lastTicket = Timbangan::where('tanggal', $today)
            ->where('no_tiket', 'like', $dateString . '%')
            ->orderBy('no_tiket', 'desc')
            ->first();

        if ($lastTicket) {
            $lastNumber = intval(substr($lastTicket->no_tiket, -3));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $dateString . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }
    public function storeFromExternal(Request $request)
    {
        $validated = $request->validate([
            'berat' => 'required|numeric',
        ]);

        // OPTIMIZED: Reduced cache timeout for faster data expiration
        cache()->put('berat-terakhir', [
            'berat' => $validated['berat'],
        ], now()->addMilliseconds(100)); // expired dalam 100ms

        return response()->json(['status' => 'berhasil simpan']);
    }

    /**
     * Get statistics for dashboard
     */
    public function getStats()
    {
        $today = Carbon::today();

        $todayStats = [
            'total_entries' => Timbangan::whereDate('tanggal', $today)->count(),
            'completed_entries' => Timbangan::whereDate('tanggal', $today)->whereNotNull('berat_keluar')->count(),
            'pending_entries' => Timbangan::whereDate('tanggal', $today)->whereNull('berat_keluar')->count(),
            'total_netto' => Timbangan::whereDate('tanggal', $today)->whereNotNull('netto')->sum('netto'),
        ];

        $weekStats = [
            'total_entries' => Timbangan::where('tanggal', '>=', $today->copy()->subDays(7))->count(),
            'total_netto' => Timbangan::where('tanggal', '>=', $today->copy()->subDays(7))->whereNotNull('netto')->sum('netto'),
        ];

        return response()->json([
            'today' => $todayStats,
            'week' => $weekStats
        ]);
    }

    /**
     * Get statistics for dashboard
     */
    public function getTodayStats()
    {
        $today = Carbon::today();

        $totalBeratHariIni = Timbangan::whereDate('tanggal', $today)
            ->whereNotNull('netto')
            ->sum('netto');

        return response()->json([
            'total_netto_today' => round($totalBeratHariIni, 2),
        ]);
    }

    /**
     * Print individual timbangan record
     */
    public function print($no_tiket)
    {
        $timbangan = Timbangan::with(['sampah', 'truk'])
            ->where('no_tiket', $no_tiket)
            ->firstOrFail();

        return view('prints.receive-note', ['t' => $timbangan]);
    }

    /**
     * Export all timbangan records to Excel
     */
    public function export(Request $request)
    {
        $exporter = new TimbangansExport();
        $data = $exporter->export([
            'year' => $request->query('year'),
            'month' => $request->query('month'),
            'day' => $request->query('day'),
        ]);
        
        // Create CSV response since Excel package is not working properly
        $filename = 'timbangan-' . date('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        
        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
}
