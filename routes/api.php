<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DataController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('register', [UserController::class, 'register']);
Route::post('login', [UserController::class, 'authenticate']);
Route::get('user', [UserController::class, 'getAuthenticatedUser']);
Route::get('nuser', [UserController::class, 'getNumberOfUser']);

Route::group(['middleware' => ['jwt.verify']], function() {
    Route::post('/import', [DataController::class, 'import']);
    Route::get('/{type}', [DataController::class, 'index']);
    Route::get('/{type}/{id}', [DataController::class, 'show']);
    Route::post('/{type}', [DataController::class, 'store']);
    Route::put('/{type}/{id}', [DataController::class, 'update']);
    Route::delete('/{type}/{id}', [DataController::class, 'destroy']);
});