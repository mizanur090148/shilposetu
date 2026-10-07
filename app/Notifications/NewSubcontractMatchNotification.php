<?php

namespace App\Notifications;

use App\Models\SubcontractPost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewSubcontractMatchNotification extends Notification
{
    use Queueable;

    public function __construct(
        public SubcontractPost $post,
        public string $matchReason = 'স্পেশালাইজেশন ও এলাকা ম্যাচ'
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.url', 'http://silposetu.test');
        $url = rtrim($frontendUrl, '/') . '/feed/' . $this->post->id;
        $posterName = $this->post->factory?->business_name ?? $this->post->user?->name ?? 'শিল্পসেতু মেম্বার';

        return (new MailMessage)
            ->subject("🏭 নতুন সাবকন্ট্রাক্ট কাজের সুযোগ: {$this->post->title} ({$this->post->district})")
            ->view('emails.subcontract_matched', [
                'post' => $this->post,
                'matchReason' => $this->matchReason,
                'recipient' => $notifiable,
                'url' => $url,
                'posterName' => $posterName,
            ]);
    }

    /**
     * Get the array representation of the notification for database storage.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'post_id' => $this->post->id,
            'title' => $this->post->title,
            'category' => $this->post->category,
            'target_quantity' => $this->post->target_quantity,
            'unit' => $this->post->unit,
            'district' => $this->post->district,
            'target_rate' => $this->post->target_rate,
            'rate_negotiable' => (bool) $this->post->rate_negotiable,
            'is_urgent' => (bool) $this->post->is_urgent,
            'deadline' => $this->post->deadline ? (is_string($this->post->deadline) ? $this->post->deadline : $this->post->deadline->format('Y-m-d')) : null,
            'poster_name' => $this->post->factory?->business_name ?? $this->post->user?->name ?? 'Verified Industry Member',
            'poster_district' => $this->post->factory?->district ?? $this->post->district,
            'match_reason' => $this->matchReason,
            'action_url' => '/feed/' . $this->post->id,
            'type' => 'subcontract_match',
        ];
    }
}
