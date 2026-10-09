<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Interview;
use App\Models\JobPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $employerId = $request->user()->id;

        $applications = Application::whereHas('jobPost', fn ($q) => $q->where('employer_id', $employerId));

        $jobs = JobPost::where('employer_id', $employerId)
            ->withCount('applications')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn (JobPost $j) => [
                'id' => $j->id,
                'title' => $j->title,
                'status' => $j->status,
                'applicants' => $j->applications_count,
                'posted' => $j->created_at->diffForHumans(),
            ]);

        $recent = (clone $applications)
            ->with(['applicant:id,name', 'jobPost:id,title'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn (Application $a) => [
                'id' => $a->id,
                'applicant' => $a->applicant->name,
                'job' => $a->jobPost->title,
                'job_id' => $a->job_post_id,
                'status' => $a->status,
                'when' => $a->created_at->diffForHumans(),
            ]);

        $byStatus = (clone $applications)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('Employer/Dashboard', [
            'pipeline' => collect([
                Application::PENDING,
                Application::UNDER_REVIEW,
                Application::INTERVIEW_SCHEDULED,
                Application::DECLINED,
            ])->mapWithKeys(fn (string $status) => [$status => (int) ($byStatus[$status] ?? 0)]),
            'stats' => [
                'active_jobs' => JobPost::where('employer_id', $employerId)->published()->count(),
                'applicants' => (clone $applications)->count(),
                'pending' => (clone $applications)->where('status', Application::PENDING)->count(),
                'interviews' => Interview::where('status', 'scheduled')
                    ->whereHas('application.jobPost', fn ($q) => $q->where('employer_id', $employerId))
                    ->count(),
            ],
            'jobs' => $jobs,
            'recent' => $recent,
        ]);
    }
}
