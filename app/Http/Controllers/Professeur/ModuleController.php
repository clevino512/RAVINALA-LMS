<?php

namespace App\Http\Controllers\Professeur;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ModuleController extends Controller
{
    public function update(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        $this->ensureProfessorAssignedToCourse($request, $course, $module);

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
            'message' => 'Le module a été mis à jour avec succès.',
            'data' => $module->fresh()->load('course'),
        ]);
    }

    private function ensureProfessorAssignedToCourse(Request $request, Course $course, CourseModule $module): void
    {
        abort_unless(
            $module->course_id === $course->id
            && $request->user()->courses()->whereKey($course->id)->exists(),
            404
        );
    }
}
