<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InterviewController extends Controller
{
    public const ROUND_LABELS = [
        'initial' => 'HR Screening',
        'technical' => 'Technical Assessment',
        'final' => 'Final Interview',
    ];

    public function index(Request $request): Response
    {
        $interviews = Interview::with('application.jobPost.employer:id,name,company_name')
            ->whereHas('application', fn ($q) => $q->where('applicant_id', $request->user()->id))
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn (Interview $i) => [
                'id' => $i->id,
                'title' => $i->application->jobPost->title,
                'company' => $i->application->jobPost->employer->company_name ?? $i->application->jobPost->employer->name,
                'round' => self::ROUND_LABELS[$i->round] ?? $i->round,
                'at' => $i->scheduled_at->format('D, M j, Y \a\t g:i A'),
                'time_range' => $i->scheduled_at->format('g:i A').' - '.$i->scheduled_at->copy()->addMinutes($i->duration_minutes)->format('g:i A'),
                'is_today' => $i->scheduled_at->isToday(),
                'duration' => $i->duration_minutes,
                'link' => $i->meeting_link,
                'note' => $i->note,
                'status' => $i->status,
                'is_past' => $i->scheduled_at->isPast() && ! $i->scheduled_at->isToday(),
                'starts_at' => $i->scheduled_at->toIso8601String(),
                'ends_at' => $i->scheduled_at->copy()->addMinutes($i->duration_minutes)->toIso8601String(),
                'relative' => $i->scheduled_at->diffForHumans(),
            ]);

        return Inertia::render('Applicant/Interviews', [
            'upcoming' => $interviews->where('status', 'scheduled')->where('is_past', false)->values(),
            'completed' => $interviews->filter(fn ($i) => $i['status'] !== 'scheduled' || $i['is_past'])->values(),
        ]);
    }
}
