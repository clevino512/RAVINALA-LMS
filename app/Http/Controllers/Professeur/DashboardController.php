<?php

namespace App\Http\Controllers\Professeur;

use App\Http\Controllers\Controller;
use App\Models\CourseModule;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
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
                return [
                    'id' => $course->id,
                    'name' => $course->name,
                    'description' => $course->description,
                    'users_count' => $course->users->count(),
                    'students' => $course->users->map(fn ($student) => [
                        'id' => $student->id,
                        'name' => $student->name,
                        'first_name' => $student->first_name,
                        'email' => $student->email,
                        'status' => $student->status ? ['name' => $student->status->name] : null,
                    ])->values(),
                ];
            })
            ->values();

        return Inertia::render('Professeur/Dashboard', [
            'courses' => $courses,
            'stats' => [
                'totalCourses' => $courses->count(),
                'totalStudents' => $courses->flatMap(fn ($course) => $course['students'])->unique('id')->count(),
                'totalModules' => CourseModule::query()->whereIn('course_id', $courses->pluck('id'))->count(),
                'totalLessons' => Lesson::query()->whereIn('module_id', CourseModule::query()->whereIn('course_id', $courses->pluck('id'))->select('id'))->count(),
            ],
        ]);
    }
}
