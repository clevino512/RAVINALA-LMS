<?php

namespace App\Http\Controllers\Professeur;

use App\Http\Controllers\Controller;
use App\Models\CourseModule;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $assignedCourses = $request->user()
            ->courses()
            ->with([
                'users' => fn ($query) => $query
                    ->whereHas('userType', fn ($typeQuery) => $typeQuery->whereIn('name', ['étudiant', 'etudiant', 'student']))
                    ->with('status')
                    ->orderBy('first_name'),
            ])
            ->orderBy('name')
            ->get();

        $courseIds = $assignedCourses->pluck('id');
        $studentIds = $assignedCourses->flatMap->users->pluck('id')->unique()->values();

        $lessonTotals = DB::table('modules')
            ->join('lessons', 'lessons.module_id', '=', 'modules.id')
            ->whereIn('modules.course_id', $courseIds)
            ->where('lessons.is_published', true)
            ->groupBy('modules.course_id')
            ->selectRaw('modules.course_id, COUNT(lessons.id) as total')
            ->pluck('total', 'course_id');

        $completedLessonTotals = DB::table('modules')
            ->join('lessons', 'lessons.module_id', '=', 'modules.id')
            ->join('lesson_progress', 'lesson_progress.lesson_id', '=', 'lessons.id')
            ->whereIn('modules.course_id', $courseIds)
            ->whereIn('lesson_progress.user_id', $studentIds)
            ->where('lessons.is_published', true)
            ->where('lesson_progress.is_completed', true)
            ->groupBy('modules.course_id', 'lesson_progress.user_id')
            ->selectRaw('modules.course_id, lesson_progress.user_id, COUNT(DISTINCT lessons.id) as total')
            ->get()
            ->keyBy(fn ($progress) => $progress->course_id . ':' . $progress->user_id);

        $courses = $assignedCourses
            ->map(function ($course) use ($lessonTotals, $completedLessonTotals) {
                $totalLessons = (int) ($lessonTotals[$course->id] ?? 0);

                return [
                    'id' => $course->id,
                    'name' => $course->name,
                    'description' => $course->description,
                    'users_count' => $course->users->count(),
                    'lessons_count' => $totalLessons,
                    'students' => $course->users->map(function ($student) use ($course, $totalLessons, $completedLessonTotals): array {
                        $completedLessons = (int) ($completedLessonTotals[$course->id . ':' . $student->id]->total ?? 0);
                        $progressPercentage = $totalLessons === 0
                            ? 0
                            : round(($completedLessons / $totalLessons) * 100, 2);

                        return [
                            'id' => $student->id,
                            'name' => $student->name,
                            'first_name' => $student->first_name,
                            'email' => $student->email,
                            'status' => $student->status ? ['name' => $student->status->name] : null,
                            'completed_lessons_count' => $completedLessons,
                            'lessons_count' => $totalLessons,
                            'progress_percentage' => $progressPercentage,
                            'is_completed' => $totalLessons > 0 && $completedLessons === $totalLessons,
                        ];
                    })->values(),
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
