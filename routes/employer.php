<?php

use App\Http\Controllers\Employer\ApplicationController;
use App\Http\Controllers\Employer\DashboardController;
use App\Http\Controllers\Employer\InterviewController;
use App\Http\Controllers\Employer\JobPostController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:Employer'])
    ->prefix('employer')
    ->name('employer.')
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        Route::resource('jobs', JobPostController::class)->parameters(['jobs' => 'job']);

        Route::get('applications', [ApplicationController::class, 'index'])->name('applications.index');
        Route::patch('applications/{application}/decline', [ApplicationController::class, 'decline'])->name('applications.decline');

        Route::get('interviews', [InterviewController::class, 'index'])->name('interviews.index');
        Route::post('interviews', [InterviewController::class, 'store'])->name('interviews.store');
        Route::delete('interviews/{interview}', [InterviewController::class, 'destroy'])->name('interviews.destroy');
    });
