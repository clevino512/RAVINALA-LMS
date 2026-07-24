<?php

use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Etudiant\DashboardController as EtudiantDashboardController;
use App\Http\Controllers\Professeur\DashboardController as ProfesseurDashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => false,
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return redirect()->route(request()->user()->dashboardRouteName());
})->middleware(['auth', 'verified', 'password.changed'])->name('dashboard');

Route::middleware(['auth', 'verified', 'password.changed'])->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
        ->middleware('user.type:admin,administrateur')
        ->name('admin.dashboard');

    Route::resource('/admin/users', AdminUserController::class)
        ->only(['index', 'show', 'store', 'update', 'destroy'])
        ->middleware('user.type:admin,administrateur')
        ->names('admin.users');

    Route::middleware('user.type:admin,administrateur')->prefix('admin')->name('admin.')->group(function () {
        Route::resource('products', ProductController::class);
        Route::resource('clients', ClientController::class);
    });

    Route::get('/etudiant/dashboard', [EtudiantDashboardController::class, 'index'])
        ->middleware('user.type:étudiant,etudiant,student')
        ->name('etudiant.dashboard');

    Route::get('/professeur/dashboard', [ProfesseurDashboardController::class, 'index'])
        ->middleware('user.type:professeur,teacher')
        ->name('professeur.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
