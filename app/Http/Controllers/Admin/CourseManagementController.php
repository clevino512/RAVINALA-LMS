<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\LessonType;
use Inertia\Inertia;
use Inertia\Response;

class CourseManagementController extends Controller
{
    public function index(): Response
    {
        $courses = Course::query()
            ->with('users')
            ->latest()
            ->get()
            ->map(function (Course $course) {
                $modules = CourseModule::query()
                    ->with('lessons.lessonType')
                    ->where('course_id', $course->id)
                    ->orderBy('position')
                    ->get()
                    ->map(function (CourseModule $module) {
                        return [
                            'id' => $module->id,
                            'title' => $module->title,
                            'description' => $module->description,
                            'position' => $module->position,
                            'created_at' => $module->created_at,
                            'updated_at' => $module->updated_at,
                            'lessons' => $module->lessons->map(fn ($lesson) => [
                                'id' => $lesson->id,
                                'title' => $lesson->title,
                                'description' => $lesson->description,
                                'file_path' => $lesson->file_path,
                                'duration' => $lesson->duration,
                                'position' => $lesson->position,
                                'is_published' => $lesson->is_published,
                                'created_at' => $lesson->created_at,
                                'updated_at' => $lesson->updated_at,
                                'lesson_type_id' => $lesson->lesson_type_id,
                                'lesson_type' => $lesson->lessonType ? [
                                    'id' => $lesson->lessonType->id,
                                    'name' => $lesson->lessonType->name,
                                ] : null,
                            ])->values(),
                        ];
                    })
                    ->values();

                return [
                    'id' => $course->id,
                    'name' => $course->name,
                    'description' => $course->description,
                    'created_at' => $course->created_at,
                    'updated_at' => $course->updated_at,
                    'users_count' => $course->users->count(),
                    'modules_count' => $modules->count(),
                    'lessons_count' => $modules->sum(fn ($module) => $module['lessons']->count()),
                    'modules' => $modules,
                ];
            })
            ->values();

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
            'lessonTypes' => LessonType::query()
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }
}
