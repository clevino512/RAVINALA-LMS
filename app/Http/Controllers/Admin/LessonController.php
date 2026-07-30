<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LessonController extends Controller
{
    public function index(Course $course, CourseModule $module): JsonResponse
    {
        abort_unless($module->course_id === $course->id, 404);

        $lessons = Lesson::query()
            ->with('lessonType')
            ->where('module_id', $module->id)
            ->orderBy('position')
            ->get();

        return response()->json([
            'data' => $lessons,
            'course' => $course,
            'module' => $module,
        ]);
    }

    public function store(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        abort_unless($module->course_id === $course->id, 404);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:250'],
            'description' => ['nullable', 'string'],
            'lesson_file' => ['nullable', 'file', 'max:51200'],
            'duration' => ['nullable', 'numeric', 'min:0'],
            'position' => [
                'nullable',
                'integer',
                'min:1',
                Rule::unique('lessons', 'position')->where(
                    fn ($query) => $query->where('module_id', $module->id)
                ),
            ],
            'is_published' => ['nullable', 'boolean'],
            'lesson_type_id' => ['required', 'exists:lesson_types,id'],
        ]);

        $lesson = Lesson::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_path' => $request->hasFile('lesson_file') ? $this->storeLessonFile($request) : null,
            'duration' => $validated['duration'] ?? null,
            'position' => $validated['position'] ?? ($this->nextPosition($module) + 1),
            'is_published' => $validated['is_published'] ?? false,
            'lesson_type_id' => $validated['lesson_type_id'],
            'module_id' => $module->id,
        ]);

        return response()->json([
            'message' => 'Lesson created successfully.',
            'data' => $lesson->load(['lessonType', 'module']),
        ], 201);
    }

    public function show(Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        $this->ensureBelongsToModule($course, $module, $lesson);

        $lesson->load(['lessonType', 'module.course']);

        return response()->json(['data' => $lesson]);
    }

    public function update(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        $this->ensureBelongsToModule($course, $module, $lesson);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:250'],
            'description' => ['nullable', 'string'],
            'existing_file_path' => ['nullable', 'string', 'max:500'],
            'lesson_file' => ['nullable', 'file', 'max:51200'],
            'duration' => ['nullable', 'numeric', 'min:0'],
            'position' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('lessons', 'position')
                    ->ignore($lesson->id)
                    ->where(fn ($query) => $query->where('module_id', $module->id)),
            ],
            'is_published' => ['required', 'boolean'],
            'lesson_type_id' => ['required', 'exists:lesson_types,id'],
        ]);

        $filePath = $validated['existing_file_path'] ?? $lesson->file_path;

        if ($request->hasFile('lesson_file')) {
            $this->deleteStoredLessonFile($lesson->file_path);
            $filePath = $this->storeLessonFile($request);
        }

        $lesson->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_path' => $filePath,
            'duration' => $validated['duration'] ?? null,
            'position' => $validated['position'],
            'is_published' => $validated['is_published'],
            'lesson_type_id' => $validated['lesson_type_id'],
        ]);

        return response()->json([
            'message' => 'Lesson updated successfully.',
            'data' => $lesson->fresh()->load(['lessonType', 'module']),
        ]);
    }

    public function destroy(Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        $this->ensureBelongsToModule($course, $module, $lesson);

        $this->deleteStoredLessonFile($lesson->file_path);
        $lesson->delete();

        return response()->json([
            'message' => 'Lesson deleted successfully.',
        ]);
    }

    private function ensureBelongsToModule(Course $course, CourseModule $module, Lesson $lesson): void
    {
        abort_unless($module->course_id === $course->id && $lesson->module_id === $module->id, 404);
    }

    private function nextPosition(CourseModule $module): int
    {
        return (int) Lesson::query()
            ->where('module_id', $module->id)
            ->max('position');
    }

    private function storeLessonFile(Request $request): string
    {
        return $request->file('lesson_file')->store('lessons', 'public');
    }

    private function deleteStoredLessonFile(?string $storedPath): void
    {
        if (! $storedPath) {
            return;
        }

        Storage::disk('public')->delete($storedPath);
    }
}
