<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobPost;
use App\Services\MatchScore;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobController extends Controller
{
    /** Explore Jobs: published jobs ranked by skill-tag match score. */
    public function index(Request $request): Response
    {
        $user = $request->user()->load(['skills', 'profile']);
        $skillIds = $user->skills->pluck('id');
        $search = ltrim(trim((string) $request->query('q', '')), '#');

        $jobs = JobPost::published()
            ->with(['employer:id,name,company_name', 'skills:id,name'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('employer', fn ($e) => $e->where('company_name', 'like', "%{$search}%"))
                        ->orWhereHas('skills', fn ($s) => $s->where('name', 'like', "%{$search}%"));
                });
            })
            ->get()
            ->map(fn (JobPost $job) => [
                'id' => $job->id,
                'title' => $job->title,
                'company' => $job->employer->company_name ?? $job->employer->name,
                'location' => $job->location,
                'work_setup' => $job->work_setup,
                'salary_min' => $job->salary_min,
                'salary_max' => $job->salary_max,
                'description' => $job->description,
                'skills' => $job->skills->pluck('name'),
                'match' => MatchScore::percent($job, $skillIds),
            ])
            ->sortByDesc('match')
            ->values();

        $activeApplications = $user->applications()
            ->with(['jobPost.employer:id,name,company_name', 'interviews'])
            ->latest()
            ->take(3)
            ->get()
            ->map(fn (Application $a) => [
                'id' => $a->id,
                'title' => $a->jobPost->title,
                'company' => $a->jobPost->employer->company_name ?? $a->jobPost->employer->name,
                'status' => $a->status,
                'applied_at' => $a->created_at->diffForHumans(),
                'interview_at' => optional($a->interviews->sortBy('scheduled_at')->first())->scheduled_at?->format('M j, g:i A'),
            ]);

        return Inertia::render('Applicant/Jobs', [
            'jobs' => $jobs,
            'filters' => ['q' => $request->query('q', '')],
            'appliedJobIds' => $user->applications()->pluck('job_post_id'),
            'activeApplications' => $activeApplications,
            'matchedCount' => $jobs->where('match', '>', 0)->count(),
            'profileCompletion' => ProfileController::completion($user),
        ]);
    }
}
