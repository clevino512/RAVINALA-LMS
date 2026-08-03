<?php

namespace App\Http\Controllers\Professeur;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\LessonFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class LessonController extends Controller
{
    public function store(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        $this->ensureProfessorAssignedToCourse($request, $course, $module);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:250'],
            'description' => ['nullable', 'string'],
            'lesson_files' => ['nullable', 'array', 'max:4'],
            'lesson_files.*' => ['nullable', 'file', 'mimetypes:image/*,video/*,audio/*,application/pdf', 'max:512000'],
            'duration' => ['nullable', 'numeric', 'min:0'],
            'position' => [
                'nullable',
                'integer',
                'min:1',
                Rule::unique('lessons', 'position')->where(fn ($query) => $query->where('module_id', $module->id)),
            ],
            'is_published' => ['nullable', 'boolean'],
            'lesson_type_id' => ['required', 'exists:lesson_types,id'],
        ]);

        $lesson = Lesson::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_path' => null,
            'duration' => $validated['duration'] ?? null,
            'position' => $validated['position'] ?? ($this->nextPosition($module) + 1),
            'is_published' => $validated['is_published'] ?? false,
            'lesson_type_id' => $validated['lesson_type_id'],
            'module_id' => $module->id,
        ]);

        $this->storeLessonFiles($lesson, $request);

        return response()->json([
            'message' => 'La leçon a été créée avec succès.',
            'data' => $lesson->fresh()->load(['lessonType', 'module', 'files']),
        ], 201);
    }

    public function update(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        $this->ensureProfessorAssignedToCourse($request, $course, $module, $lesson);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:250'],
            'description' => ['nullable', 'string'],
            'lesson_files' => ['nullable', 'array', 'max:4'],
            'lesson_files.*' => ['nullable', 'file', 'mimetypes:image/*,video/*,audio/*,application/pdf', 'max:512000'],
            'deleted_file_ids' => ['nullable', 'array'],
            'deleted_file_ids.*' => [
                'integer',
                Rule::exists('lesson_files', 'id')->where(fn ($query) => $query->where('lesson_id', $lesson->id)),
            ],
            'duration' => ['nullable', 'numeric', 'min:0'],
            'position' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('lessons', 'position')->ignore($lesson->id)->where(fn ($query) => $query->where('module_id', $module->id)),
            ],
            'is_published' => ['required', 'boolean'],
            'lesson_type_id' => ['required', 'exists:lesson_types,id'],
        ]);

        $lesson->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'duration' => $validated['duration'] ?? null,
            'position' => $validated['position'],
            'is_published' => $validated['is_published'],
            'lesson_type_id' => $validated['lesson_type_id'],
        ]);

        LessonFile::query()
            ->where('lesson_id', $lesson->id)
            ->whereIn('id', $validated['deleted_file_ids'] ?? [])
            ->get()
            ->each(function (LessonFile $file): void {
                $this->deleteStoredLessonFile($file->file_path);
                $file->delete();
            });

        $this->storeLessonFiles($lesson, $request);
        $this->syncPrimaryLessonFilePath($lesson);

        return response()->json([
            'message' => 'La leçon a été mise à jour avec succès.',
            'data' => $lesson->fresh()->load(['lessonType', 'module', 'files']),
        ]);
    }

    public function updatePublication(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        $this->ensureProfessorAssignedToCourse($request, $course, $module, $lesson);

        $validated = $request->validate([
            'is_published' => ['required', 'boolean'],
        ]);

        $lesson->update(['is_published' => $validated['is_published']]);

        return response()->json([
            'message' => $lesson->is_published ? 'La leçon est maintenant publiée.' : 'La leçon est maintenant en brouillon.',
            'data' => $lesson->fresh()->load('lessonType'),
        ]);
    }

    public function destroy(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        $this->ensureProfessorAssignedToCourse($request, $course, $module, $lesson);

        $lesson->load('files');
        $lesson->files->each(fn (LessonFile $file) => $this->deleteStoredLessonFile($file->file_path));
        $lesson->delete();

        return response()->json([
            'message' => 'La leçon a été supprimée avec succès.',
        ]);
    }

    private function ensureProfessorAssignedToCourse(Request $request, Course $course, CourseModule $module, ?Lesson $lesson = null): void
    {
        $belongs = $module->course_id === $course->id
            && $request->user()->courses()->whereKey($course->id)->exists()
            && ($lesson === null || $lesson->module_id === $module->id);

        abort_unless($belongs, 404);
    }

    private function nextPosition(CourseModule $module): int
    {
        return (int) Lesson::query()->where('module_id', $module->id)->max('position');
    }

    private function storeLessonFiles(Lesson $lesson, Request $request): void
    {
        $files = $request->file('lesson_files', []);
        $nextPosition = (int) $lesson->files()->max('position');
        $firstStoredPath = null;
        $targetDirectory = public_path('lessons/data');

        File::ensureDirectoryExists($targetDirectory);

        foreach ($files as $uploadedFile) {
            $originalName = $uploadedFile->getClientOriginalName();
            $mimeType = $uploadedFile->getMimeType();
            $fileSize = $uploadedFile->getSize();
            $storedFileName = $this->resolveStoredLessonFileName($targetDirectory, $originalName);

            $uploadedFile->move($targetDirectory, $storedFileName);

            $storedPath = '/lessons/data/' . $storedFileName;
            $firstStoredPath ??= $storedPath;

            $lesson->files()->create([
                'file_path' => $storedPath,
                'original_name' => $originalName,
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'position' => ++$nextPosition,
            ]);
        }

        if ($firstStoredPath !== null && blank($lesson->file_path)) {
            $lesson->forceFill(['file_path' => $firstStoredPath])->save();
        }
    }

    private function resolveStoredLessonFileName(string $targetDirectory, string $originalName): string
    {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $baseName = pathinfo($originalName, PATHINFO_FILENAME);
        $safeBaseName = Str::of($baseName)->ascii()->replaceMatches('/[^A-Za-z0-9._-]+/', '_')->trim('_')->value();
        $safeBaseName = $safeBaseName !== '' ? $safeBaseName : 'fichier';
        $safeExtension = Str::lower($extension);
        $candidate = $safeExtension !== '' ? "{$safeBaseName}.{$safeExtension}" : $safeBaseName;
        $counter = 1;

        while (File::exists($targetDirectory . DIRECTORY_SEPARATOR . $candidate)) {
            $counter++;
            $candidate = $safeExtension !== '' ? "{$safeBaseName}-{$counter}.{$safeExtension}" : "{$safeBaseName}-{$counter}";
        }

        return $candidate;
    }

    private function syncPrimaryLessonFilePath(Lesson $lesson): void
    {
        $lesson->loadMissing('files');
        $primaryPath = $lesson->files->sortBy('position')->first()?->file_path;

        if ($lesson->file_path !== $primaryPath) {
            $lesson->forceFill(['file_path' => $primaryPath])->save();
        }
    }

    private function deleteStoredLessonFile(?string $storedPath): void
    {
        if (! $storedPath) {
            return;
        }

        if (str_starts_with($storedPath, '/lessons/data/')) {
            File::delete(public_path(ltrim($storedPath, '/')));
            return;
        }

        if (str_starts_with($storedPath, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $storedPath));
            return;
        }

        Storage::disk('public')->delete(ltrim($storedPath, '/'));
    }
}
