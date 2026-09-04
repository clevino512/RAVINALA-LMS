<?php

namespace App\Notifications;

use App\Models\Assessment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssignmentDueReminder extends Notification
{
    use Queueable;

    public function __construct(public Assessment $assessment) {}

    public function via(object $notifiable): array { return ['mail']; }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Rappel : devoir à rendre bientôt')
            ->greeting('Bonjour '.$notifiable->first_name.',')
            ->line('Le devoir « '.$this->assessment->title.' » du cours '.$this->assessment->course->name.' arrive à échéance.')
            ->line('Date limite : '.$this->assessment->due_at->format('d/m/Y à H:i'))
            ->action('Déposer mon devoir', route('etudiant.evaluations.index'))
            ->line('Ce rappel est envoyé automatiquement par EduCampus.');
    }
}
