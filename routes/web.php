<?php

use App\Http\Controllers\TimbanganController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SampahController;
use App\Http\Controllers\RealtimeController;
use App\Http\Controllers\Settings\PortController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\TrukController;
use App\Http\Controllers\Driver\AuthController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware([
    // Middleware default dihapuskan
])->withoutMiddleware([
    VerifyCsrfToken::class,
    StartSession::class,
    ShareErrorsFromSession::class,
    AddQueuedCookiesToResponse::class,
])->group(function () {

    Route::post('/api/external/berat', [TimbanganController::class, 'storeFromExternal'])
        ->name('external.berat');

    Route::get('/api/external/berat-terakhir', function () {
        // OPTIMIZED: Use consistent cache key naming
        $berat = cache()->get('berat-terakhir');
        return response()->json($berat ?? []);
    });

    Route::get('/api/live-weight', [RealtimeController::class, 'getBerat']);

    Route::post('/api/live-weight', [RealtimeController::class, 'updateBerat']);

    Route::post('/api/clear-weight-cache', [RealtimeController::class, 'clearWeightCache']);

    Route::get('/api/available-ports', [PortController::class, 'getAvailablePorts']);

    Route::post('/api/set-ports', [PortController::class, 'setPorts']);
    
    Route::get('/api/current-ports', [PortController::class, 'getCurrentPorts']);

    Route::get('/api/websocket-status', [RealtimeController::class, 'getWebSocketStatus']);
    
    Route::post('/driver/track', [TrackingController::class, 'store'])->name('driver.track.store');
});

Route::get('/driver', function () {
    return Inertia::render('driver/LoginPage');
})->name('driver.login.page');

Route::get('/driver/dashboard', function () {
    return Inertia::render('driver/DashboardPage');
})->name('driver.dashboard');

Route::post('/driver/login', [AuthController::class, 'login'])->name('driver.login.action');




Route::middleware(['auth', 'verified'])->group(function () {

    Route::controller(TimbanganController::class)->group(function () {
        Route::get('/dashboard', 'index')->name('dashboard');
        Route::post('/dashboard', 'store')->name('dashboard.store');
        Route::put('/dashboard/{no_tiket}', 'update')->name('dashboard.update');
        Route::delete('/dashboard/{no_tiket}', 'destroy')->name('dashboard.destroy');
        Route::get('/dashboard/entries/{no_polisi}', 'getTodayEntries')->name('dashboard.entries');
    });

    Route::controller(SupplierController::class)->group(function () {
        Route::get('/supplier', 'index')->name('supplier');
        Route::post('/supplier', 'store')->name('supplier.store');
        Route::put('/supplier/{kode_supplier}', 'update')->name('supplier.update');
        Route::delete('/supplier/{kode_supplier}', 'destroy')->name('supplier.destroy');
    });

    Route::controller(SampahController::class)->group(function () {
        Route::get('/sampah', 'index')->name('sampah');
        Route::post('/sampah', 'store')->name('sampah.store');
        Route::put('/sampah/{id}', 'update')->name('sampah.update');
        Route::delete('/sampah/{id}', 'destroy')->name('sampah.destroy');
    });

    Route::controller(TrukController::class)->group(function () {
        Route::get('/truk', 'index')->name('truk');
        Route::post('/truk', 'store')->name('truk.store');
        Route::put('/truk/{id}', 'update')->name('truk.update');
        Route::delete('/truk/{id}', 'destroy')->name('truk.destroy');
    });

    // Print and Export routes
    Route::get('/timbangan/print/{no_tiket}', [TimbanganController::class, 'print'])->name('timbangan.print');
    Route::get('/timbangan/export', [TimbanganController::class, 'export'])->name('timbangan.export');

    Route::prefix('api')->group(function () {
        Route::get('/entries/{no_polisi}', [TimbanganController::class, 'getTodayEntries']);
        Route::get('/timbangan/incomplete/{no_polisi}', [TimbanganController::class, 'getLastIncomplete']);
        Route::get('/timbangan/next-ticket', [TimbanganController::class, 'generateNoTiketAPI']);
        Route::get('/timbangans', [TimbanganController::class, 'getAll']);
        Route::get('/truk-data', [TrukController::class, 'fetchAll']);
        Route::get('/trucks/search', [TrukController::class, 'search']);
        Route::post('/traccar', [TrackingController::class, 'store']);
        // Route::get('/trackings/latest', [TrackingController::class, 'latest']);
        Route::get('/dashboard/statistik', [TimbanganController::class, 'getTodayStats']);
        Route::get('/zone-stats', [TrackingController::class, 'getZoneStats']);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
