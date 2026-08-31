<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ModuleController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        $modules = CourseModule::query()
            ->with(['lessons.lessonType', 'lessons.files'])
            ->where('course_id', $course->id)
            ->orderBy('position')
            ->get();

        return response()->json([
            'data' => $modules,
            'course' => $course,
        ]);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:250'],
            'description' => ['nullable', 'string'],
            'position' => [
                'nullable',
                'integer',
                'min:1',
                Rule::unique('modules', 'position')->where(
                    fn ($query) => $query->where('course_id', $course->id)
                ),
            ],
        ]);

        $module = CourseModule::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'position' => $validated['position'] ?? ($this->nextPosition($course) + 1),
            'course_id' => $course->id,
        ]);

        return response()->json([
            'message' => 'Module created successfully.',
            'data' => $module->load('course'),
        ], 201);
    }

    public function show(Course $course, CourseModule $module): JsonResponse
    {
        abort_unless($module->course_id === $course->id, 404);

        $module->load(['course', 'lessons.lessonType', 'lessons.files']);

        return response()->json(['data' => $module]);
    }

    public function update(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        abort_unless($module->course_id === $course->id, 404);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:250'],
            'description' => ['nullable', 'string'],
            'position' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('modules', 'position')
                    ->ignore($module->id)
                    ->where(fn ($query) => $query->where('course_id', $course->id)),
            ],
        ]);

        $module->update($validated);

        return response()->json([
            'message' => 'Module updated successfully.',
            'data' => $module->fresh()->load('course'),
        ]);
    }

    public function destroy(Course $course, CourseModule $module): JsonResponse
    {
        abort_unless($module->course_id === $course->id, 404);

        $module->delete();

        return response()->json([
            'message' => 'Module deleted successfully.',
        ]);
    }

    private function nextPosition(Course $course): int
    {
        return (int) CourseModule::query()
            ->where('course_id', $course->id)
            ->max('position');
    }
}
