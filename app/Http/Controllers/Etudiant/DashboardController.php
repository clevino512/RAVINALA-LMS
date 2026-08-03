<?php

namespace App\Http\Controllers\Etudiant;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $progressByCourseId = CourseProgress::query()
            ->where('user_id', $user->id)
            ->get()
            ->keyBy('course_id');

        $courses = $user->courses()
            ->orderBy('name')
            ->get()
            ->map(function (Course $course) use ($progressByCourseId): array {
                $progress = $progressByCourseId->get($course->id);

                return [
                    'id' => $course->id,
                    'name' => $course->name,
                    'description' => $course->description,
                    'progress_percentage' => (float) ($progress?->progress_percentage ?? 0),
                    'is_completed' => $progress?->completed_at !== null,
                ];
            })
            ->values();

        return Inertia::render('Etudiant/Dashboard', [
            'courses' => $courses,
        ]);
    }
}
