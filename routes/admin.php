<?php

use App\Http\Controllers\Admin\JobPostController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:Admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::patch('users/{user}/role', [UserController::class, 'updateRole'])->name('users.role');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        Route::get('jobs', [JobPostController::class, 'index'])->name('jobs.index');
        Route::patch('jobs/{job}/close', [JobPostController::class, 'close'])->name('jobs.close');
        Route::delete('jobs/{job}', [JobPostController::class, 'destroy'])->name('jobs.destroy');
    });
