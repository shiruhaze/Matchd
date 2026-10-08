<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (Request $request) {
    if ($request->user()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Landing');
})->name('home');

// Sends each authenticated user to the home screen of their role.
Route::get('/dashboard', function (Request $request) {
    $user = $request->user();

    return match (true) {
        $user->hasRole('Admin') => redirect()->route('admin.users.index'),
        $user->hasRole('Employer') => redirect()->route('employer.dashboard'),
        default => redirect()->route('applicant.jobs.index'),
    };
})->middleware('auth')->name('dashboard');

require __DIR__.'/applicant.php';
require __DIR__.'/employer.php';
require __DIR__.'/admin.php';
