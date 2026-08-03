<?php

namespace App\Http\Controllers\Etudiant;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $assignedCourses = $user->courses()
            ->orderBy('name')
            ->get();
        $courseIds = $assignedCourses->pluck('id');

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
            ->where('lessons.is_published', true)
            ->where('lesson_progress.user_id', $user->id)
            ->where('lesson_progress.is_completed', true)
            ->groupBy('modules.course_id')
            ->selectRaw('modules.course_id, COUNT(DISTINCT lessons.id) as total')
            ->pluck('total', 'course_id');

        $courses = $assignedCourses
            ->map(function (Course $course) use ($lessonTotals, $completedLessonTotals): array {
                $totalLessons = (int) ($lessonTotals[$course->id] ?? 0);
                $completedLessons = (int) ($completedLessonTotals[$course->id] ?? 0);
                $progressPercentage = $totalLessons === 0
                    ? 0
                    : round(($completedLessons / $totalLessons) * 100, 2);

                return [
                    'id' => $course->id,
                    'name' => $course->name,
                    'description' => $course->description,
                    'progress_percentage' => $progressPercentage,
                    'is_completed' => $totalLessons > 0 && $completedLessons === $totalLessons,
                ];
            })
            ->values();

        return Inertia::render('Etudiant/Dashboard', [
            'courses' => $courses,
        ]);
    }
}
