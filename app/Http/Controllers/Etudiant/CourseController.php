<?php

namespace App\Http\Controllers\Etudiant;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\CourseProgress;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\ModuleProgress;
use App\Models\ProgressStatus;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $statusIds = $this->progressStatusIds();

        $courses = $user->courses()
            ->orderBy('name')
            ->get()
            ->map(fn (Course $course) => $this->mapCourseForStudent($course, $user, $statusIds))
            ->values();

        return Inertia::render('Etudiant/Courses/Index', [
            'courses' => $courses,
            'initialCourseId' => $courses->contains('id', $request->integer('course'))
                ? $request->integer('course')
                : $courses->first()['id'] ?? null,
            'stats' => [
                'totalCourses' => $courses->count(),
                'totalModules' => $courses->sum('modules_count'),
                'completedModules' => $courses->sum(fn (array $course) => collect($course['modules'])->where('is_completed', true)->count()),
                'completedLessons' => $courses->sum(fn (array $course) => collect($course['modules'])->sum(fn (array $module) => collect($module['lessons'])->where('is_completed', true)->count())),
            ],
        ]);
    }

    public function completeLesson(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        $user = $request->user();

        abort_unless($user->courses()->whereKey($course->id)->exists(), 404);
        abort_unless((int) $module->course_id === (int) $course->id, 404);
        abort_unless((int) $lesson->module_id === (int) $module->id, 404);
        abort_unless((bool) $lesson->is_published, 404);

        $statusIds = $this->progressStatusIds();

        DB::transaction(function () use ($user, $course, $module, $lesson, $statusIds): void {
            $now = Carbon::now();

            $courseProgress = CourseProgress::firstOrNew([
                'user_id' => $user->id,
                'course_id' => $course->id,
            ]);
            $courseProgress->progress_status_id = $courseProgress->progress_status_id ?: $statusIds['in_progress'];
            $courseProgress->progress_percentage = $courseProgress->progress_percentage ?? 0;
            $courseProgress->started_at = $courseProgress->started_at ?: $now;
            $courseProgress->completed_at = null;
            $courseProgress->save();

            $moduleProgress = ModuleProgress::firstOrNew([
                'user_id' => $user->id,
                'module_id' => $module->id,
            ]);
            $moduleProgress->course_progress_id = $courseProgress->id;
            $moduleProgress->progress_status_id = $moduleProgress->progress_status_id ?: $statusIds['in_progress'];
            $moduleProgress->progress_percentage = $moduleProgress->progress_percentage ?? 0;
            $moduleProgress->is_active = true;
            $moduleProgress->started_at = $moduleProgress->started_at ?: $now;
            $moduleProgress->completed_at = null;
            $moduleProgress->save();

            LessonProgress::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'lesson_id' => $lesson->id,
                ],
                [
                    'module_progress_id' => $moduleProgress->id,
                    'is_completed' => true,
                    'completed_at' => $now,
                ]
            );

            $this->synchronizeCourseProgress($course, $user, $statusIds, $now);
        });

        return response()->json([
            'message' => 'La progression de la leçon a été enregistrée avec succès.',
        ]);
    }

    private function mapCourseForStudent(Course $course, User $user, array $statusIds): array
    {
        $modules = CourseModule::query()
            ->with([
                'lessons' => fn ($query) => $query
                    ->where('is_published', true)
                    ->with(['lessonType', 'files'])
                    ->orderBy('position'),
            ])
            ->where('course_id', $course->id)
            ->orderBy('position')
            ->get();

        $lessonIds = $modules->flatMap(fn (CourseModule $module) => $module->lessons->pluck('id'))->values();
        $lessonProgressById = LessonProgress::query()
            ->where('user_id', $user->id)
            ->whereIn('lesson_id', $lessonIds)
            ->get()
            ->keyBy('lesson_id');

        $preparedModules = $modules->map(function (CourseModule $module) use ($lessonProgressById) {
            $lessons = $module->lessons->map(function (Lesson $lesson) use ($lessonProgressById) {
                $progress = $lessonProgressById->get($lesson->id);
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
                    'duration' => $lesson->duration,
                    'position' => $lesson->position,
                    'is_completed' => (bool) ($progress?->is_completed),
                    'completed_at' => optional($progress?->completed_at)?->toDateTimeString(),
                    'lesson_type' => $lesson->lessonType ? [
                        'id' => $lesson->lessonType->id,
                        'name' => $lesson->lessonType->name,
                    ] : null,
                    'files' => $files->values(),
                ];
            })->values();

            $totalLessons = $lessons->count();
            $completedLessons = $lessons->where('is_completed', true)->count();
            $isCompleted = $totalLessons === 0 ? true : $completedLessons === $totalLessons;
            $progressPercentage = $totalLessons === 0 ? 100 : round(($completedLessons / max($totalLessons, 1)) * 100, 2);

            return [
                'id' => $module->id,
                'title' => $module->title,
                'description' => $module->description,
                'position' => $module->position,
                'lessons_count' => $totalLessons,
                'completed_lessons_count' => $completedLessons,
                'progress_percentage' => $progressPercentage,
                'is_completed' => $isCompleted,
                'lessons' => $lessons,
            ];
        })->values();

        $firstIncompleteIndex = $preparedModules->search(fn (array $module) => ! $module['is_completed']);
        $hasIncompleteModule = $firstIncompleteIndex !== false;

        $finalModules = $preparedModules->values()->map(function (array $module, int $index) use ($hasIncompleteModule, $firstIncompleteIndex) {
            $isLocked = $hasIncompleteModule && $index > $firstIncompleteIndex;

            return [
                ...$module,
                'is_locked' => $isLocked,
                'is_accessible' => ! $isLocked,
                'is_current' => $hasIncompleteModule ? $index === $firstIncompleteIndex : false,
            ];
        })->values();

        $completedModules = $finalModules->where('is_completed', true)->count();
        $modulesCount = $finalModules->count();
        $totalCourseLessons = $finalModules->sum('lessons_count');
        $completedCourseLessons = $finalModules->sum('completed_lessons_count');
        $courseProgressPercentage = $totalCourseLessons === 0
            ? 0
            : round(($completedCourseLessons / $totalCourseLessons) * 100, 2);
        $activeModule = $finalModules->firstWhere('is_current', true) ?? $finalModules->first();

        return [
            'id' => $course->id,
            'name' => $course->name,
            'description' => $course->description,
            'modules_count' => $modulesCount,
            'lessons_count' => $totalCourseLessons,
            'completed_lessons_count' => $completedCourseLessons,
            'completed_modules_count' => $completedModules,
            'progress_percentage' => $courseProgressPercentage,
            'is_completed' => $totalCourseLessons > 0 && $completedCourseLessons === $totalCourseLessons,
            'current_module_id' => $activeModule['id'] ?? null,
            'modules' => $finalModules,
        ];
    }

    private function synchronizeCourseProgress(Course $course, User $user, array $statusIds, Carbon $now): void
    {
        $modules = CourseModule::query()
            ->with(['lessons' => fn ($query) => $query->where('is_published', true)->orderBy('position')])
            ->where('course_id', $course->id)
            ->orderBy('position')
            ->get();

        $courseProgress = CourseProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'course_id' => $course->id,
            ],
            [
                'progress_status_id' => $statusIds['not_started'],
                'progress_percentage' => 0,
            ]
        );

        $lessonProgressById = LessonProgress::query()
            ->where('user_id', $user->id)
            ->whereIn('lesson_id', $modules->flatMap(fn (CourseModule $module) => $module->lessons->pluck('id'))->values())
            ->get()
            ->keyBy('lesson_id');

        $moduleSnapshots = [];

        foreach ($modules as $module) {
            $totalLessons = $module->lessons->count();
            $completedLessons = $module->lessons->filter(fn (Lesson $lesson) => (bool) optional($lessonProgressById->get($lesson->id))->is_completed)->count();
            $isCompleted = $totalLessons === 0 ? true : $completedLessons === $totalLessons;
            $hasStarted = $completedLessons > 0;
            $progressPercentage = $totalLessons === 0 ? 100 : round(($completedLessons / max($totalLessons, 1)) * 100, 2);

            $moduleSnapshots[] = [
                'id' => $module->id,
                'is_completed' => $isCompleted,
                'has_started' => $hasStarted,
                'total_lessons' => $totalLessons,
                'completed_lessons' => $completedLessons,
                'progress_percentage' => $progressPercentage,
            ];
        }

        $firstIncompleteIndex = collect($moduleSnapshots)->search(fn (array $snapshot) => ! $snapshot['is_completed']);
        $hasIncompleteModule = $firstIncompleteIndex !== false;

        foreach ($moduleSnapshots as $index => $snapshot) {
            $moduleProgress = ModuleProgress::firstOrNew([
                'user_id' => $user->id,
                'module_id' => $snapshot['id'],
            ]);

            $moduleProgress->course_progress_id = $courseProgress->id;
            $moduleProgress->progress_percentage = $snapshot['progress_percentage'];
            $moduleProgress->is_active = $hasIncompleteModule && $index === $firstIncompleteIndex;
            $moduleProgress->started_at = ($snapshot['has_started'] || $moduleProgress->is_active)
                ? ($moduleProgress->started_at ?: $now)
                : $moduleProgress->started_at;
            $moduleProgress->progress_status_id = $snapshot['is_completed']
                ? $statusIds['completed']
                : ($snapshot['has_started'] || $moduleProgress->is_active ? $statusIds['in_progress'] : $statusIds['not_started']);
            $moduleProgress->completed_at = $snapshot['is_completed'] ? ($moduleProgress->completed_at ?: $now) : null;
            $moduleProgress->save();
        }

        $totalCourseLessons = collect($moduleSnapshots)->sum('total_lessons');
        $completedCourseLessons = collect($moduleSnapshots)->sum('completed_lessons');
        $courseIsCompleted = $totalCourseLessons > 0 && $completedCourseLessons === $totalCourseLessons;
        $courseProgress->progress_percentage = $totalCourseLessons === 0
            ? 0
            : round(($completedCourseLessons / $totalCourseLessons) * 100, 2);
        $courseProgress->started_at = $courseProgress->started_at ?: $now;
        $courseProgress->progress_status_id = $courseIsCompleted
            ? $statusIds['completed']
            : ($courseProgress->progress_percentage > 0 ? $statusIds['in_progress'] : $statusIds['not_started']);
        $courseProgress->completed_at = $courseIsCompleted ? ($courseProgress->completed_at ?: $now) : null;
        $courseProgress->save();
    }

    private function progressStatusIds(): array
    {
        $statusIds = ProgressStatus::query()->pluck('id', 'name')->all();

        return [
            'not_started' => $statusIds['not_started'] ?? null,
            'in_progress' => $statusIds['in_progress'] ?? null,
            'completed' => $statusIds['completed'] ?? null,
        ];
    }
}
