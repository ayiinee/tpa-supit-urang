<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TrackingController;

Route::post('/traccar', [TrackingController::class, 'store']); // data dari traccar
Route::get('/trackings/latest', [TrackingController::class, 'latest']); // frontend fetch lokasi
