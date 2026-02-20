<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PokemonController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [UserController::class, 'me']);
    Route::put('/me', [UserController::class, 'update']);

    Route::get('/pokemon', [PokemonController::class, 'index']);
    Route::get('/pokemon/{name}', [PokemonController::class, 'show']);
});
