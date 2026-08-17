<?php

namespace App\Http\Controllers\Etudiant;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\AssessmentOption;
use App\Models\AssignmentSubmission;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $courseIds = $user->courses()->pluck('courses.id');
        $assessments = Assessment::query()->whereIn('course_id', $courseIds)->where('is_published', true)->with(['course', 'attempts' => fn ($q) => $q->where('user_id', $user->id)->whereNotNull('completed_at'), 'submissions' => fn ($q) => $q->where('user_id', $user->id)])->latest()->get();

        return Inertia::render('Etudiant/Evaluations/Index', ['assessments' => $assessments->map(fn (Assessment $assessment) => [
            'id' => $assessment->id, 'course' => $assessment->course->name, 'type' => $assessment->type,
            'title' => $assessment->title, 'instructions' => $assessment->instructions,
            'attachment_name' => $assessment->attachment_name,
            'attachment_url' => $assessment->attachment_path ? route('etudiant.evaluations.attachment', $assessment) : null,
            'due_at' => $assessment->due_at?->toDateTimeString(), 'attempts_count' => $assessment->attempts->count(),
            'best_score' => $assessment->attempts->max('score'),
            'submission' => ($submission = $assessment->submissions->first()) ? ['original_name' => $submission->original_name, 'view_url' => route('etudiant.evaluations.submission', [$assessment, $submission]), 'submitted_at' => $submission->submitted_at?->toDateTimeString(), 'grade' => $submission->grade, 'feedback' => $submission->feedback] : null,
        ])->values()]);
    }

    public function start(Request $request, Assessment $assessment): JsonResponse
    {
        $this->ensureAccessible($request, $assessment, 'quiz');
        $assessment->load('questions.options');
        $questions = $assessment->questions->shuffle()->take($assessment->random_question_count ?: $assessment->questions->count())->values();
        abort_if($questions->isEmpty(), 422, 'Ce quiz ne contient aucune question.');
        $attempt = DB::transaction(function () use ($request, $assessment, $questions) {
            $attempt = QuizAttempt::create(['assessment_id' => $assessment->id, 'user_id' => $request->user()->id, 'total_questions' => $questions->count(), 'started_at' => now()]);
            $attempt->questions()->attach($questions->mapWithKeys(fn ($q, $i) => [$q->id => ['position' => $i + 1]])->all());
            return $attempt;
        });
        return response()->json(['attempt_id' => $attempt->id, 'questions' => $questions->map(fn ($q) => ['id' => $q->id, 'type' => $q->type, 'prompt' => $q->prompt, 'options' => $q->options->shuffle()->map(fn ($o) => ['id' => $o->id, 'text' => $o->option_text])->values()])]);
    }

    public function submitQuiz(Request $request, Assessment $assessment, QuizAttempt $attempt): JsonResponse
    {
        $this->ensureAccessible($request, $assessment, 'quiz');
        abort_unless($attempt->assessment_id === $assessment->id && $attempt->user_id === $request->user()->id && $attempt->completed_at === null, 404);
        $validated = $request->validate(['answers' => ['required', 'array'], 'answers.*' => ['nullable', 'integer']]);
        $attempt->load('questions.options');
        $score = 0; $results = [];
        DB::transaction(function () use ($attempt, $validated, &$score, &$results): void {
            foreach ($attempt->questions as $question) {
                $selectedId = $validated['answers'][$question->id] ?? null;
                $selected = $selectedId ? $question->options->firstWhere('id', (int) $selectedId) : null;
                $correct = $question->options->firstWhere('is_correct', true);
                $isCorrect = $selected?->id === $correct?->id;
                if ($isCorrect) $score++;
                QuizAnswer::create(['quiz_attempt_id' => $attempt->id, 'question_id' => $question->id, 'option_id' => $selected?->id, 'is_correct' => $isCorrect]);
                $results[] = ['question' => $question->prompt, 'selected_answer' => $selected?->option_text, 'correct_answer' => $correct?->option_text, 'is_correct' => $isCorrect];
            }
            $attempt->update(['score' => $score, 'completed_at' => now()]);
        });
        return response()->json(['score' => $score, 'total' => $attempt->total_questions, 'percentage' => round($score / max($attempt->total_questions, 1) * 100, 2), 'results' => $results]);
    }

    public function submitAssignment(Request $request, Assessment $assessment): JsonResponse
    {
        $this->ensureAccessible($request, $assessment, 'assignment');
        if ($assessment->due_at && now()->isAfter($assessment->due_at)) throw ValidationException::withMessages(['file' => 'La date limite de ce devoir est dépassée.']);
        $validated = $request->validate(['file' => ['required', 'file', 'mimetypes:application/pdf,video/mp4,image/jpeg,image/png', 'max:102400']]);
        $file = $validated['file'];
        $existing = AssignmentSubmission::where(['assessment_id' => $assessment->id, 'user_id' => $request->user()->id])->first();
        if ($existing) Storage::disk('local')->delete($existing->file_path);
        $relativePath = $file->store("assignments/{$assessment->id}/{$request->user()->id}", 'local');
        AssignmentSubmission::updateOrCreate(['assessment_id' => $assessment->id, 'user_id' => $request->user()->id], ['file_path' => $relativePath, 'original_name' => $file->getClientOriginalName(), 'mime_type' => $file->getMimeType(), 'file_size' => $file->getSize(), 'submitted_at' => now(), 'grade' => null, 'feedback' => null, 'graded_by' => null, 'graded_at' => null]);
        return response()->json(['message' => 'Devoir déposé avec succès.']);
    }

    public function downloadAttachment(Request $request, Assessment $assessment)
    {
        $this->ensureAccessible($request, $assessment, 'assignment');
        abort_unless($assessment->attachment_path && Storage::disk('local')->exists($assessment->attachment_path), 404);
        return response()->file(Storage::disk('local')->path($assessment->attachment_path), [
            'Content-Type' => $assessment->attachment_mime,
            'Content-Disposition' => 'inline',
        ]);
    }

    public function viewSubmission(Request $request, Assessment $assessment, AssignmentSubmission $submission)
    {
        $this->ensureAccessible($request, $assessment, 'assignment');
        abort_unless(
            $submission->assessment_id === $assessment->id
            && $submission->user_id === $request->user()->id
            && Storage::disk('local')->exists($submission->file_path),
            404
        );

        return response()->file(Storage::disk('local')->path($submission->file_path), [
            'Content-Type' => $submission->mime_type,
            'Content-Disposition' => 'inline',
        ]);
    }

    private function ensureAccessible(Request $request, Assessment $assessment, string $type): void
    {
        abort_unless($assessment->type === $type && $assessment->is_published && $request->user()->courses()->whereKey($assessment->course_id)->exists(), 404);
    }
}
