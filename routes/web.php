<?php

use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Etudiant\CourseController as EtudiantCourseController;
use App\Http\Controllers\Etudiant\DashboardController as EtudiantDashboardController;
use App\Http\Controllers\LessonMediaController;
use App\Http\Controllers\Professeur\CourseController as ProfesseurCourseController;
use App\Http\Controllers\Professeur\DashboardController as ProfesseurDashboardController;
use App\Http\Controllers\Professeur\LessonController as ProfesseurLessonController;
use App\Http\Controllers\Professeur\ModuleController as ProfesseurModuleController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login');

Route::get('/dashboard', function () {
    return redirect()->route(request()->user()->dashboardRouteName());
})->middleware(['auth', 'verified', 'password.changed'])->name('dashboard');

Route::middleware(['auth', 'verified', 'password.changed'])->group(function () {
    Route::get('/lesson-media', [LessonMediaController::class, 'show'])->name('lesson.media');

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

    Route::middleware('user.type:etudiant,student,étudiant')->prefix('etudiant')->name('etudiant.')->group(function () {
        Route::get('dashboard', [EtudiantDashboardController::class, 'index'])->name('dashboard');
        Route::get('courses', [EtudiantCourseController::class, 'index'])->name('courses.index');
        Route::patch('courses/{course}/modules/{module}/lessons/{lesson}/complete', [EtudiantCourseController::class, 'completeLesson'])
            ->name('courses.modules.lessons.complete');
    });

    Route::middleware('user.type:professeur,teacher')->prefix('professeur')->name('professeur.')->group(function () {
        Route::get('dashboard', [ProfesseurDashboardController::class, 'index'])->name('dashboard');
        Route::get('courses', [ProfesseurCourseController::class, 'index'])->name('courses.index');
        Route::match(['put', 'patch'], 'courses/{course}/modules/{module}', [ProfesseurModuleController::class, 'update'])
            ->name('courses.modules.update');
        Route::post('courses/{course}/modules/{module}/lessons', [ProfesseurLessonController::class, 'store'])
            ->name('courses.modules.lessons.store');
        Route::patch('courses/{course}/modules/{module}/lessons/{lesson}/publication', [ProfesseurLessonController::class, 'updatePublication'])
            ->name('courses.modules.lessons.publication');
        Route::match(['put', 'patch'], 'courses/{course}/modules/{module}/lessons/{lesson}', [ProfesseurLessonController::class, 'update'])
            ->name('courses.modules.lessons.update');
        Route::delete('courses/{course}/modules/{module}/lessons/{lesson}', [ProfesseurLessonController::class, 'destroy'])
            ->name('courses.modules.lessons.destroy');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/lms.php';
