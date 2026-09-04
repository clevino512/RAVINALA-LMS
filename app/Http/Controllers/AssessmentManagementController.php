<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AssignmentSubmission;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $routePrefix = $this->isAdmin($request) ? 'admin.evaluations' : 'professeur.evaluations';
        $courses = $this->manageableCourses($request)->with(['users' => fn ($query) => $query->whereHas('userType', fn ($type) => $type->whereIn('name', ['étudiant', 'etudiant', 'student']))])->orderBy('name')->get();
        $assessments = Assessment::query()->whereIn('course_id', $courses->pluck('id'))->with(['course', 'questions.options', 'submissions.user', 'attempts.user'])->latest()->get();

        return Inertia::render('Evaluations/Manage', [
            'courses' => $courses->map(fn ($course) => ['id' => $course->id, 'name' => $course->name]),
            'assessments' => $assessments->map(fn (Assessment $assessment) => [
                'id' => $assessment->id,
                'course' => ['id' => $assessment->course->id, 'name' => $assessment->course->name],
                'type' => $assessment->type,
                'title' => $assessment->title,
                'instructions' => $assessment->instructions,
                'attachment_name' => $assessment->attachment_name,
                'attachment_url' => $assessment->attachment_path ? route($routePrefix.'.attachment', $assessment) : null,
                'due_at' => $assessment->due_at?->format('Y-m-d\TH:i'),
                'is_published' => $assessment->is_published,
                'questions_count' => $assessment->questions->count(),
                'random_question_count' => $assessment->random_question_count,
                'attempts' => $assessment->attempts->whereNotNull('completed_at')->map(fn ($attempt) => [
                    'id' => $attempt->id,
                    'student' => $attempt->user->name,
                    'score' => $attempt->score,
                    'total' => $attempt->total_questions,
                    'percentage' => round($attempt->score / max($attempt->total_questions, 1) * 100, 2),
                    'completed_at' => $attempt->completed_at?->toDateTimeString(),
                ])->values(),
                'submissions' => $assessment->submissions->map(fn (AssignmentSubmission $submission) => [
                    'id' => $submission->id,
                    'student' => $submission->user->name,
                    'original_name' => $submission->original_name,
                    'file_path' => $submission->file_path,
                    'download_url' => route($routePrefix.'.download', [$assessment, $submission]),
                    'submitted_at' => $submission->submitted_at?->toDateTimeString(),
                    'grade' => $submission->grade,
                    'feedback' => $submission->feedback,
                ])->values(),
            ])->values(),
            'routePrefix' => $routePrefix,
            'flashSuccess' => $request->session()->get('success'),
        ]);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $courseIds = collect($this->manageableCourses($request)->pluck('courses.id'));
        abort_unless($courseIds->contains((int) $request->input('course_id')), 404);
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'type' => ['required', Rule::in(['quiz', 'assignment'])],
            'title' => ['required', 'string', 'max:255'],
            'instructions' => ['nullable', 'string'],
            'attachment' => ['required_if:type,assignment', 'nullable', 'file', 'mimetypes:application/pdf,video/mp4,image/jpeg,image/png', 'max:102400'],
            'due_at' => ['required_if:type,assignment', 'nullable', 'date', 'after:now'],
            'random_question_count' => ['nullable', 'integer', 'min:1'],
            'is_published' => ['required', 'boolean'],
            'questions' => ['required_if:type,quiz', 'array', 'min:1'],
            'questions.*.type' => ['exclude_unless:type,quiz', 'required', Rule::in(['multiple_choice', 'true_false'])],
            'questions.*.prompt' => ['exclude_unless:type,quiz', 'required', 'string'],
            'questions.*.options' => ['exclude_unless:type,quiz', 'required', 'array', 'min:2'],
            'questions.*.options.*' => ['exclude_unless:type,quiz', 'required', 'string', 'max:1000'],
            'questions.*.correct_option' => ['exclude_unless:type,quiz', 'required', 'integer', 'min:0'],
        ], [
            'course_id.required' => 'Veuillez sélectionner un cours.',
            'title.required' => 'Le titre est obligatoire.',
            'due_at.required_if' => 'La date limite est obligatoire pour un devoir.',
            'due_at.after' => 'La date limite doit être située dans le futur.',
            'attachment.required_if' => 'Le fichier du devoir est obligatoire.',
            'attachment.file' => 'Le fichier du devoir est invalide.',
            'attachment.mimetypes' => 'Le devoir doit être un PDF, MP4, JPG ou PNG.',
            'attachment.max' => 'Le fichier du devoir ne doit pas dépasser 100 Mo.',
            'questions.required_if' => 'Ajoutez au moins une question au quiz.',
            'questions.*.prompt.required' => 'Chaque question doit avoir un énoncé.',
            'questions.*.options.*.required' => 'Toutes les propositions de réponse doivent être renseignées.',
        ]);

        $assessment = DB::transaction(function () use ($validated, $request): Assessment {
            $questions = $validated['type'] === 'quiz' ? ($validated['questions'] ?? []) : [];
            $attachment = $validated['type'] === 'assignment' ? ($validated['attachment'] ?? null) : null;
            $attachmentPath = $attachment?->store("assignments/subjects/{$request->user()->id}", 'local');
            $assessment = Assessment::create([
                'course_id' => $validated['course_id'], 'created_by' => $request->user()->id,
                'type' => $validated['type'], 'title' => $validated['title'],
                'instructions' => $validated['instructions'] ?? null,
                'attachment_path' => $attachmentPath,
                'attachment_name' => $attachment?->getClientOriginalName(),
                'attachment_mime' => $attachment?->getMimeType(),
                'attachment_size' => $attachment?->getSize(),
                'due_at' => $validated['type'] === 'assignment' ? ($validated['due_at'] ?? null) : null,
                'random_question_count' => $validated['type'] === 'quiz' ? min((int) ($validated['random_question_count'] ?? count($questions)), count($questions)) : null,
                'is_published' => $validated['is_published'],
            ]);

            foreach ($questions as $questionIndex => $questionData) {
                $options = $questionData['type'] === 'true_false' ? ['Vrai', 'Faux'] : $questionData['options'];
                abort_if($questionData['correct_option'] >= count($options), 422, 'La bonne réponse est invalide.');
                $question = $assessment->questions()->create(['type' => $questionData['type'], 'prompt' => $questionData['prompt'], 'position' => $questionIndex + 1]);
                foreach ($options as $optionIndex => $optionText) {
                    $question->options()->create(['option_text' => $optionText, 'is_correct' => $optionIndex === (int) $questionData['correct_option'], 'position' => $optionIndex + 1]);
                }
            }
            return $assessment;
        });

        $assessment->refresh();

        if ($request->header('X-Inertia')) {
            return redirect()->route($this->isAdmin($request) ? 'admin.evaluations.index' : 'professeur.evaluations.index')
                ->with('success', $assessment->type === 'assignment'
                    ? 'Le devoir a été créé et ajouté à la liste.'
                    : 'Le quiz a été créé et ajouté à la liste.');
        }

        return response()->json([
            'message' => 'Évaluation créée.',
            'id' => $assessment->id,
            'type' => $assessment->type,
        ], 201);
    }

    public function updatePublication(Request $request, Assessment $assessment): JsonResponse
    {
        $this->authorizeAssessment($request, $assessment);
        $validated = $request->validate(['is_published' => ['required', 'boolean']]);
        $assessment->update($validated);
        return response()->json(['message' => 'Publication mise à jour.']);
    }

    public function grade(Request $request, Assessment $assessment, AssignmentSubmission $submission): JsonResponse
    {
        $this->authorizeAssessment($request, $assessment);
        abort_unless($assessment->type === 'assignment' && $submission->assessment_id === $assessment->id, 404);
        $validated = $request->validate(['grade' => ['required', 'numeric', 'min:0', 'max:100'], 'feedback' => ['required', 'string', 'max:5000']]);
        $submission->update([...$validated, 'graded_by' => $request->user()->id, 'graded_at' => now()]);
        return response()->json(['message' => 'Correction enregistrée.']);
    }

    public function destroy(Request $request, Assessment $assessment): JsonResponse
    {
        $this->authorizeAssessment($request, $assessment);
        $assessment->load('submissions');
        foreach ($assessment->submissions as $submission) Storage::disk('local')->delete($submission->file_path);
        if ($assessment->attachment_path) Storage::disk('local')->delete($assessment->attachment_path);
        $assessment->delete();
        return response()->json(['message' => 'Évaluation supprimée.']);
    }

    public function download(Request $request, Assessment $assessment, AssignmentSubmission $submission): BinaryFileResponse
    {
        $this->authorizeAssessment($request, $assessment);
        abort_unless($submission->assessment_id === $assessment->id && Storage::disk('local')->exists($submission->file_path), 404);
        return response()->file(Storage::disk('local')->path($submission->file_path), [
            'Content-Type' => $submission->mime_type,
            'Content-Disposition' => 'inline',
        ]);
    }

    public function downloadAttachment(Request $request, Assessment $assessment): BinaryFileResponse
    {
        $this->authorizeAssessment($request, $assessment);
        abort_unless($assessment->attachment_path && Storage::disk('local')->exists($assessment->attachment_path), 404);
        return response()->file(Storage::disk('local')->path($assessment->attachment_path), [
            'Content-Type' => $assessment->attachment_mime,
            'Content-Disposition' => 'inline',
        ]);
    }

    private function manageableCourses(Request $request)
    {
        return $this->isAdmin($request) ? Course::query() : $request->user()->courses();
    }

    private function authorizeAssessment(Request $request, Assessment $assessment): void
    {
        abort_unless($this->isAdmin($request) || $request->user()->courses()->whereKey($assessment->course_id)->exists(), 404);
    }

    private function isAdmin(Request $request): bool
    {
        return in_array(mb_strtolower((string) $request->user()->userType?->name), ['admin', 'administrateur'], true);
    }
}
