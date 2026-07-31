<?php

use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\CourseManagementController;
use App\Http\Controllers\Admin\LessonController;
use App\Http\Controllers\Admin\ModuleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'password.changed', 'user.type:admin,administrateur'])
    ->prefix('admin/lms')
    ->name('admin.lms.')
    ->group(function () {
        Route::get('management', [CourseManagementController::class, 'index'])->name('management');
        Route::apiResource('courses', CourseController::class);

        Route::get('courses/{course}/modules', [ModuleController::class, 'index'])->name('courses.modules.index');
        Route::post('courses/{course}/modules', [ModuleController::class, 'store'])->name('courses.modules.store');
        Route::get('courses/{course}/modules/{module}', [ModuleController::class, 'show'])->name('courses.modules.show');
        Route::match(['put', 'patch'], 'courses/{course}/modules/{module}', [ModuleController::class, 'update'])->name('courses.modules.update');
        Route::delete('courses/{course}/modules/{module}', [ModuleController::class, 'destroy'])->name('courses.modules.destroy');

        Route::get('courses/{course}/modules/{module}/lessons', [LessonController::class, 'index'])->name('courses.modules.lessons.index');
        Route::post('courses/{course}/modules/{module}/lessons', [LessonController::class, 'store'])->name('courses.modules.lessons.store');
        Route::get('courses/{course}/modules/{module}/lessons/{lesson}', [LessonController::class, 'show'])->name('courses.modules.lessons.show');
        Route::patch('courses/{course}/modules/{module}/lessons/{lesson}/publication', [LessonController::class, 'updatePublication'])->name('courses.modules.lessons.publication');
        Route::match(['put', 'patch'], 'courses/{course}/modules/{module}/lessons/{lesson}', [LessonController::class, 'update'])->name('courses.modules.lessons.update');
        Route::delete('courses/{course}/modules/{module}/lessons/{lesson}', [LessonController::class, 'destroy'])->name('courses.modules.lessons.destroy');
    });
