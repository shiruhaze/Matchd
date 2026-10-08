<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Interview;
use App\Services\MatchScore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    /** Approve Applicants: candidates for this employer's jobs, best matches first. */
    public function index(Request $request): Response
    {
        $query = Application::whereHas('jobPost', fn ($q) => $q->where('employer_id', $request->user()->id));

        $applications = (clone $query)
            ->with(['applicant.skills', 'jobPost.skills'])
            ->latest()
            ->get()
            ->map(function (Application $a) {
                $matched = MatchScore::matchedSkills($a->jobPost, $a->applicant);

                return [
                    'id' => $a->id,
                    'applicant' => $a->applicant->name,
                    'email' => $a->applicant->email,
                    'job' => $a->jobPost->title,
                    'matched_skills' => $matched,
                    'match' => MatchScore::percent($a->jobPost, $a->applicant->skills->pluck('id')),
                    'status' => $a->status,
                ];
            })
            ->sortByDesc('match')
            ->values();

        return Inertia::render('Employer/Applications', [
            'applications' => $applications,
            'stats' => [
                'total' => $applications->count(),
                'pending' => $applications->where('status', Application::PENDING)->count(),
                'interviews' => Interview::where('status', 'scheduled')
                    ->whereHas('application.jobPost', fn ($q) => $q->where('employer_id', $request->user()->id))
                    ->count(),
            ],
        ]);
    }

    public function decline(Application $application): RedirectResponse
    {
        Gate::authorize('manage', $application->jobPost);

        $application->update(['status' => Application::DECLINED]);

        return back()->with('success', 'Applicant declined.');
    }
}
