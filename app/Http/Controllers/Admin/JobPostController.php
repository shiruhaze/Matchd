<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobPost;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class JobPostController extends Controller
{
    public function index(): Response
    {
        $jobs = JobPost::with('employer:id,name,company_name')
            ->withCount('applications')
            ->latest()
            ->get()
            ->map(fn (JobPost $j) => [
                'id' => $j->id,
                'title' => $j->title,
                'company' => $j->employer->company_name ?? $j->employer->name,
                'status' => $j->status,
                'applicants' => $j->applications_count,
                'posted' => $j->created_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/Jobs', ['jobs' => $jobs]);
    }

    public function close(JobPost $job): RedirectResponse
    {
        $job->update(['status' => JobPost::STATUS_CLOSED]);

        return back()->with('success', 'Job closed.');
    }

    public function destroy(JobPost $job): RedirectResponse
    {
        $job->delete();

        return back()->with('success', 'Job deleted.');
    }
}
