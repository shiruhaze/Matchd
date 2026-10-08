<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\JobPost;
use App\Models\Skill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class JobPostController extends Controller
{
    public function index(Request $request): Response
    {
        $jobs = JobPost::where('employer_id', $request->user()->id)
            ->withCount('applications')
            ->with('skills:id,name')
            ->latest()
            ->get()
            ->map(fn (JobPost $j) => $this->summary($j));

        return Inertia::render('Employer/Jobs/Index', ['jobs' => $jobs]);
    }

    public function create(): Response
    {
        return Inertia::render('Employer/Jobs/Form', [
            'job' => null,
            'skillSuggestions' => Skill::orderBy('name')->pluck('name'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $job = $request->user()->jobPosts()->create(collect($data)->except('skills')->all());
        $this->syncSkills($job, $data['skills'] ?? []);

        return redirect()->route('employer.jobs.index')
            ->with('success', $job->status === JobPost::STATUS_PUBLISHED ? 'Job published.' : 'Draft saved.');
    }

    public function show(JobPost $job): Response
    {
        Gate::authorize('manage', $job);

        $job->load(['skills:id,name', 'applications.applicant:id,name,email']);

        return Inertia::render('Employer/Jobs/Show', [
            'job' => [
                ...$this->summary($job->loadCount('applications')),
                'description' => $job->description,
                'requirements' => $job->requirements,
                'applicants' => $job->applications->map(fn ($a) => [
                    'id' => $a->id,
                    'name' => $a->applicant->name,
                    'email' => $a->applicant->email,
                    'status' => $a->status,
                ]),
            ],
        ]);
    }

    public function edit(JobPost $job): Response
    {
        Gate::authorize('manage', $job);

        return Inertia::render('Employer/Jobs/Form', [
            'job' => [
                ...$job->only([
                    'id', 'title', 'employment_type', 'work_setup', 'location',
                    'salary_min', 'salary_max', 'description', 'requirements', 'status',
                ]),
                'skills' => $job->skills()->pluck('name'),
            ],
            'skillSuggestions' => Skill::orderBy('name')->pluck('name'),
        ]);
    }

    public function update(Request $request, JobPost $job): RedirectResponse
    {
        Gate::authorize('manage', $job);

        $data = $this->validated($request);

        $job->update(collect($data)->except('skills')->all());
        $this->syncSkills($job, $data['skills'] ?? []);

        return redirect()->route('employer.jobs.index')->with('success', 'Job updated.');
    }

    public function destroy(JobPost $job): RedirectResponse
    {
        Gate::authorize('manage', $job);

        $job->delete();

        return redirect()->route('employer.jobs.index')->with('success', 'Job deleted.');
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'employment_type' => ['required', 'in:full-time,part-time,contract,internship'],
            'work_setup' => ['required', 'in:remote,hybrid,onsite'],
            'location' => ['nullable', 'string', 'max:255'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'gte:salary_min'],
            'description' => ['nullable', 'string', 'max:5000'],
            'requirements' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', 'in:draft,published,closed'],
            'skills' => ['array', 'max:20'],
            'skills.*' => ['string', 'max:40'],
        ]);
    }

    /** @param  array<int, string>  $names */
    private function syncSkills(JobPost $job, array $names): void
    {
        $ids = collect($names)
            ->map(fn ($n) => strtolower(ltrim(trim($n), '#')))
            ->filter()
            ->unique()
            ->map(fn ($n) => Skill::firstOrCreate(['name' => $n])->id);

        $job->skills()->sync($ids);
    }

    /** @return array<string, mixed> */
    private function summary(JobPost $j): array
    {
        return [
            'id' => $j->id,
            'title' => $j->title,
            'status' => $j->status,
            'work_setup' => $j->work_setup,
            'location' => $j->location,
            'salary_min' => $j->salary_min,
            'salary_max' => $j->salary_max,
            'applicants' => $j->applications_count ?? 0,
            'skills' => $j->skills->pluck('name'),
            'posted' => $j->created_at->diffForHumans(),
        ];
    }
}
