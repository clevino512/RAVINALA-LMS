<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;
use App\Models\Assessment;
use App\Notifications\AssignmentDueReminder;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('assessments:send-reminders', function () {
    $assessments = Assessment::query()
        ->where('type', 'assignment')->where('is_published', true)
        ->whereBetween('due_at', [now(), now()->addDay()])
        ->with(['course.users.userType', 'submissions'])
        ->get();

    $sent = 0;
    foreach ($assessments as $assessment) {
        $submittedUserIds = $assessment->submissions->pluck('user_id');
        foreach ($assessment->course->users as $student) {
            if (! in_array(mb_strtolower((string) $student->userType?->name), ['étudiant', 'etudiant', 'student'], true)
                || $submittedUserIds->contains($student->id)
                || DB::table('assessment_reminders')->where(['assessment_id' => $assessment->id, 'user_id' => $student->id])->exists()) continue;

            $student->notify(new AssignmentDueReminder($assessment));
            DB::table('assessment_reminders')->insert(['assessment_id' => $assessment->id, 'user_id' => $student->id, 'sent_at' => now()]);
            $sent++;
        }
    }
    $this->info("{$sent} rappel(s) envoyé(s).");
})->purpose('Envoyer les rappels des devoirs arrivant à échéance dans les 24 heures.');

Schedule::command('assessments:send-reminders')->hourly()->withoutOverlapping();
