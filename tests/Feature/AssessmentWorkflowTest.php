<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Status;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use App\Notifications\AssignmentDueReminder;
use Tests\TestCase;

class AssessmentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_professor_can_create_randomized_quiz_and_student_gets_correction(): void
    {
        [$professor, $student, $course] = $this->context();

        $this->actingAs($professor)->postJson(route('professeur.evaluations.store'), [
            'course_id' => $course->id, 'type' => 'quiz', 'title' => 'Quiz test',
            'random_question_count' => 1, 'is_published' => true,
            'questions' => [
                ['type' => 'multiple_choice', 'prompt' => '2 + 2 ?', 'options' => ['3', '4'], 'correct_option' => 1],
                ['type' => 'true_false', 'prompt' => 'Le ciel est bleu.', 'options' => ['Vrai', 'Faux'], 'correct_option' => 0],
            ],
        ])->assertCreated();

        $assessment = Assessment::firstOrFail();
        $start = $this->actingAs($student)->postJson(route('etudiant.evaluations.quiz.start', $assessment))->assertOk();
        $this->assertCount(1, $start->json('questions'));
        $question = $start->json('questions.0');
        $correctOption = $assessment->questions()->with('options')->findOrFail($question['id'])->options->firstWhere('is_correct', true);

        $this->actingAs($student)->postJson(route('etudiant.evaluations.quiz.submit', [$assessment, $start->json('attempt_id')]), [
            'answers' => [$question['id'] => $correctOption->id],
        ])->assertOk()->assertJsonPath('score', 1)->assertJsonPath('results.0.correct_answer', $correctOption->option_text);

        $this->actingAs($student)->postJson(route('etudiant.evaluations.quiz.start', $assessment))->assertOk();
        $this->assertDatabaseCount('quiz_attempts', 2);
    }

    public function test_student_can_submit_supported_assignment_and_professor_can_grade_it(): void
    {
        Storage::fake('local');
        [$professor, $student, $course] = $this->context();
        $assessment = Assessment::create(['course_id' => $course->id, 'created_by' => $professor->id, 'type' => 'assignment', 'title' => 'Devoir', 'due_at' => now()->addDay(), 'is_published' => true]);

        $this->actingAs($student)->post(route('etudiant.evaluations.assignment.submit', $assessment), [
            'file' => UploadedFile::fake()->create('copie.pdf', 500, 'application/pdf'),
        ])->assertOk();

        $submission = $assessment->submissions()->firstOrFail();
        Storage::disk('local')->assertExists($submission->file_path);
        $this->actingAs($student)
            ->get(route('etudiant.evaluations.submission', [$assessment, $submission]))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf')
            ->assertHeader('content-disposition', 'inline');

        $this->actingAs($professor)->patchJson(route('professeur.evaluations.grade', [$assessment, $submission]), [
            'grade' => 84, 'feedback' => 'Bon travail, développez la conclusion.',
        ])->assertOk();
        $this->assertDatabaseHas('assignment_submissions', ['id' => $submission->id, 'grade' => 84, 'feedback' => 'Bon travail, développez la conclusion.']);
    }

    public function test_professor_can_create_assignment_with_subject_file(): void
    {
        Storage::fake('local');
        [$professor, , $course] = $this->context();

        $this->actingAs($professor)->post(route('professeur.evaluations.store'), [
            'course_id' => $course->id,
            'type' => 'assignment',
            'title' => 'Analyse de texte',
            'instructions' => 'Téléchargez le sujet puis remettez votre copie.',
            'due_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'is_published' => '1',
            'attachment' => UploadedFile::fake()->create('sujet.pdf', 500, 'application/pdf'),
            // Un ancien état du formulaire Quiz ne doit jamais bloquer un devoir.
            'questions' => [['type' => 'multiple_choice', 'prompt' => '', 'options' => ['', '', '', ''], 'correct_option' => 0]],
        ])->assertCreated();

        $assessment = Assessment::where('type', 'assignment')->firstOrFail();
        $this->assertSame('sujet.pdf', $assessment->attachment_name);
        Storage::disk('local')->assertExists($assessment->attachment_path);
        $this->actingAs($professor)
            ->get(route('professeur.evaluations.attachment', $assessment))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf')
            ->assertHeader('content-disposition', 'inline');
    }

    public function test_professor_cannot_manage_an_unassigned_course(): void
    {
        [$professor] = $this->context();
        $otherCourse = Course::create(['name' => 'Cours interdit']);
        $this->actingAs($professor)->postJson(route('professeur.evaluations.store'), ['course_id' => $otherCourse->id, 'type' => 'assignment', 'title' => 'Interdit', 'is_published' => true])->assertNotFound();
    }

    public function test_due_assignment_reminder_is_sent_once_to_student_without_submission(): void
    {
        Notification::fake();
        [$professor, $student, $course] = $this->context();
        $assessment = Assessment::create(['course_id' => $course->id, 'created_by' => $professor->id, 'type' => 'assignment', 'title' => 'À rendre', 'due_at' => now()->addHours(12), 'is_published' => true]);

        $this->artisan('assessments:send-reminders')->assertSuccessful();
        $this->artisan('assessments:send-reminders')->assertSuccessful();

        Notification::assertSentToTimes($student, AssignmentDueReminder::class, 1);
        $this->assertDatabaseHas('assessment_reminders', ['assessment_id' => $assessment->id, 'user_id' => $student->id]);
    }

    private function context(): array
    {
        $status = Status::factory()->create(['name' => 'actif']);
        $professorType = UserType::factory()->create(['name' => 'professeur']);
        $studentType = UserType::factory()->create(['name' => 'étudiant']);
        $professor = User::factory()->create(['id_1' => $professorType->id, 'id_2' => $status->id, 'must_change_password' => false]);
        $student = User::factory()->create(['id_1' => $studentType->id, 'id_2' => $status->id, 'must_change_password' => false]);
        $course = Course::create(['name' => 'Français']);
        $course->users()->attach([$professor->id, $student->id]);
        return [$professor, $student, $course];
    }
}
