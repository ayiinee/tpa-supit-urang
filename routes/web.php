<?php

use App\Http\Controllers\TimbanganController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SampahController;
use App\Http\Controllers\RealtimeController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\TrukController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::controller(TimbanganController::class)->group(function () {
        Route::get('/dashboard', 'index')->name('dashboard');
        Route::post('/dashboard', 'store')->name('dashboard.store');
        Route::put('/dashboard/{no_tiket}', [TimbanganController::class, 'update'])->name('dashboard.update');
        Route::delete('/dashboard/{no_tiket}', [TimbanganController::class, 'destroy'])->name('dashboard.destroy');
        Route::get('/dashboard/entries/{no_polisi}', [TimbanganController::class, 'getTodayEntries'])->name('dashboard.entries');
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

    Route::prefix('api')->group(function () {
        Route::get('/entries/{no_polisi}', [TimbanganController::class, 'getTodayEntries']);
        Route::get('/timbangan/incomplete/{no_polisi}', [TimbanganController::class, 'getLastIncomplete']);
        Route::get('/timbangan/next-ticket', [TimbanganController::class, 'generateNoTiketAPI']);
        Route::get('/timbangans', [TimbanganController::class, 'getAll']);
        Route::get('/truk-data', [TrukController::class, 'fetchAll']);
Route::post('/traccar', [TrackingController::class, 'store']);
Route::get('/trackings/latest', [TrackingController::class, 'latest']); // frontend fetch lokasi


        Route::post('/live-weight', [RealtimeController::class, 'updateBerat']);
        Route::get('/live-weight', [RealtimeController::class, 'getBerat']);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
