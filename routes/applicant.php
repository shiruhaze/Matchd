<?php

use App\Http\Controllers\Applicant\ApplicationController;
use App\Http\Controllers\Applicant\InterviewController;
use App\Http\Controllers\Applicant\JobController;
use App\Http\Controllers\Applicant\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:Applicant'])
    ->prefix('applicant')
    ->name('applicant.')
    ->group(function () {
        Route::get('jobs', [JobController::class, 'index'])->name('jobs.index');
        Route::post('jobs/{job}/apply', [ApplicationController::class, 'store'])->name('jobs.apply');

        Route::get('applications', [ApplicationController::class, 'index'])->name('applications.index');
        Route::get('interviews', [InterviewController::class, 'index'])->name('interviews.index');

        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
    });
