<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobPost;
use App\Services\MatchScore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    /** My Applications: tracker with status filter. */
    public function index(Request $request): Response
    {
        $user = $request->user()->load('skills');
        $skillIds = $user->skills->pluck('id');

        $applications = $user->applications()
            ->with(['jobPost.employer:id,name,company_name', 'jobPost.skills:id,name', 'interviews'])
            ->latest()
            ->get()
            ->map(function (Application $a) use ($skillIds) {
                $interview = $a->interviews->where('status', 'scheduled')->sortBy('scheduled_at')->first();

                return [
                    'id' => $a->id,
                    'title' => $a->jobPost->title,
                    'company' => $a->jobPost->employer->company_name ?? $a->jobPost->employer->name,
                    'location' => $a->jobPost->location,
                    'salary_min' => $a->jobPost->salary_min,
                    'salary_max' => $a->jobPost->salary_max,
                    'status' => $a->status,
                    'applied_at' => $a->created_at->format('M j, Y'),
                    'viewed_at' => $a->viewed_at?->diffForHumans(),
                    'match' => MatchScore::percent($a->jobPost, $skillIds),
                    'interview' => $interview ? [
                        'at' => $interview->scheduled_at->format('l, M j \a\t g:i A'),
                        'link' => $interview->meeting_link,
                    ] : null,
                ];
            });

        return Inertia::render('Applicant/Applications', [
            'applications' => $applications,
            'stats' => [
                'applied' => $applications->count(),
                'under_review' => $applications->where('status', Application::UNDER_REVIEW)->count(),
                'interviews' => $applications->where('status', Application::INTERVIEW_SCHEDULED)->count(),
                'pending' => $applications->where('status', Application::PENDING)->count(),
            ],
        ]);
    }

    /** Apply to a job. */
    public function store(Request $request, JobPost $job): RedirectResponse
    {
        Gate::authorize('apply', $job);

        Application::firstOrCreate([
            'job_post_id' => $job->id,
            'applicant_id' => $request->user()->id,
        ]);

        return back()->with('success', "Application sent for {$job->title}.");
    }
}
