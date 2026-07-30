<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    public function index(): JsonResponse
    {
        $courses = Course::query()
            ->with('users')
            ->latest()
            ->get();

        $courses->each(function (Course $course): void {
            $course->setRelation('modules', $this->modulesForCourse($course));
        });

        return response()->json(['data' => $courses]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('courses', 'name')],
            'description' => ['nullable', 'string'],
        ]);

        $course = Course::create($validated);
        $course->setRelation('modules', collect());

        return response()->json([
            'message' => 'Course created successfully.',
            'data' => $course,
        ], 201);
    }

    public function show(Course $course): JsonResponse
    {
        $course->load('users');
        $course->setRelation('modules', $this->modulesForCourse($course));

        return response()->json(['data' => $course]);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('courses', 'name')->ignore($course->id)],
            'description' => ['nullable', 'string'],
        ]);

        $course->update($validated);
        $course = $course->fresh();
        $course->load('users');
        $course->setRelation('modules', $this->modulesForCourse($course));

        return response()->json([
            'message' => 'Course updated successfully.',
            'data' => $course,
        ]);
    }

    public function destroy(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully.',
        ]);
    }

    private function modulesForCourse(Course $course)
    {
        return CourseModule::query()
            ->with('lessons.lessonType')
            ->where('course_id', $course->id)
            ->orderBy('position')
            ->get();
    }
}
