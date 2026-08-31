<?php

namespace App\Http\Controllers\Professeur;

use App\Http\Controllers\Controller;
use App\Models\CourseModule;
use App\Models\LessonType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $courses = $request->user()
            ->courses()
            ->with([
                'users' => fn ($query) => $query
                    ->whereHas('userType', fn ($typeQuery) => $typeQuery->whereIn('name', ['étudiant', 'etudiant', 'student']))
                    ->with('status')
                    ->orderBy('first_name'),
            ])
            ->orderBy('name')
            ->get()
            ->map(function ($course) {
                $modules = CourseModule::query()
                    ->with(['lessons.lessonType', 'lessons.files'])
                    ->where('course_id', $course->id)
                    ->orderBy('position')
                    ->get()
                    ->map(function (CourseModule $module) {
                        return [
                            'id' => $module->id,
                            'title' => $module->title,
                            'description' => $module->description,
                            'position' => $module->position,
                            'lessons' => $module->lessons->map(function ($lesson) {
                                $files = $lesson->files->map(fn ($file) => [
                                    'id' => $file->id,
                                    'file_path' => $file->file_path,
                                    'original_name' => $file->original_name,
                                    'mime_type' => $file->mime_type,
                                    'file_size' => $file->file_size,
                                    'position' => $file->position,
                                ]);

                                if ($files->isEmpty() && filled($lesson->file_path)) {
                                    $files = collect([[
                                        'id' => 'legacy-' . $lesson->id,
                                        'file_path' => $lesson->file_path,
                                        'original_name' => basename($lesson->file_path),
                                        'mime_type' => null,
                                        'file_size' => null,
                                        'position' => 1,
                                    ]]);
                                }

                                return [
                                    'id' => $lesson->id,
                                    'title' => $lesson->title,
                                    'description' => $lesson->description,
                                    'file_path' => $lesson->file_path,
                                    'duration' => $lesson->duration,
                                    'position' => $lesson->position,
                                    'is_published' => $lesson->is_published,
                                    'lesson_type_id' => $lesson->lesson_type_id,
                                    'lesson_type' => $lesson->lessonType ? [
                                        'id' => $lesson->lessonType->id,
                                        'name' => $lesson->lessonType->name,
                                    ] : null,
                                    'files' => $files->values(),
                                ];
                            })->values(),
                        ];
                    })
                    ->values();

                return [
                    'id' => $course->id,
                    'name' => $course->name,
                    'description' => $course->description,
                    'users_count' => $course->users->count(),
                    'modules_count' => $modules->count(),
                    'lessons_count' => $modules->sum(fn ($module) => $module['lessons']->count()),
                    'modules' => $modules,
                ];
            })
            ->values();

        return Inertia::render('Professeur/Courses/Index', [
            'courses' => $courses,
            'studentCount' => $request->user()
                ->courses()
                ->with(['users' => fn ($query) => $query->whereHas('userType', fn ($typeQuery) => $typeQuery->whereIn('name', ['étudiant', 'etudiant', 'student']))])
                ->get()
                ->flatMap->users
                ->unique('id')
                ->count(),
            'lessonTypes' => LessonType::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }
}
