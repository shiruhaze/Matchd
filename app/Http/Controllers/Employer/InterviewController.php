<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Interview;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InterviewController extends Controller
{
    /** Set Interview: scheduling form plus the upcoming schedule. */
    public function index(Request $request): Response
    {
        $employerId = $request->user()->id;

        $candidates = Application::with(['applicant:id,name', 'jobPost:id,title'])
            ->whereHas('jobPost', fn ($q) => $q->where('employer_id', $employerId))
            ->where('status', '!=', Application::DECLINED)
            ->latest()
            ->get()
            ->map(fn (Application $a) => [
                'id' => $a->id,
                'label' => "{$a->applicant->name} ({$a->jobPost->title})",
                'name' => $a->applicant->name,
                'job' => $a->jobPost->title,
                'status' => $a->status,
                'applied' => $a->created_at->diffForHumans(),
            ]);

        $upcoming = Interview::with(['application.applicant:id,name', 'application.jobPost:id,title'])
            ->where('status', 'scheduled')
            ->where('scheduled_at', '>=', now()->startOfDay())
            ->whereHas('application.jobPost', fn ($q) => $q->where('employer_id', $employerId))
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn (Interview $i) => [
                'id' => $i->id,
                'applicant' => $i->application->applicant->name,
                'job' => $i->application->jobPost->title,
                'day' => $i->scheduled_at->isToday() ? 'Today' : ($i->scheduled_at->isTomorrow() ? 'Tomorrow' : $i->scheduled_at->format('M j')),
                'is_today' => $i->scheduled_at->isToday(),
                'time_range' => $i->scheduled_at->format('g:i A').' - '.$i->scheduled_at->copy()->addMinutes($i->duration_minutes)->format('g:i A'),
                'link' => $i->meeting_link,
                'round' => $i->round,
                'date' => $i->scheduled_at->toDateString(),
            ]);

        return Inertia::render('Employer/Interviews', [
            'candidates' => $candidates,
            'upcoming' => $upcoming,
            'selectedApplication' => $request->integer('application') ?: null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'application_id' => ['required', 'integer', 'exists:applications,id'],
            'round' => ['required', 'in:initial,technical,final'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'time' => ['required', 'date_format:H:i'],
            'duration_minutes' => ['required', 'in:30,45,60'],
            'meeting_link' => ['nullable', 'url', 'max:255'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $application = Application::with('jobPost')->findOrFail($data['application_id']);
        Gate::authorize('manage', $application->jobPost);

        $scheduledAt = Carbon::parse("{$data['date']} {$data['time']}");

        if ($scheduledAt->isPast()) {
            return back()->withErrors(['time' => 'The interview must be scheduled in the future.']);
        }

        Interview::create([
            'application_id' => $application->id,
            'round' => $data['round'],
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => $data['duration_minutes'],
            'meeting_link' => $data['meeting_link'] ?? null,
            'note' => $data['note'] ?? null,
        ]);

        $application->update(['status' => Application::INTERVIEW_SCHEDULED]);

        return redirect()->route('employer.interviews.index')->with('success', 'Interview invitation sent.');
    }

    public function destroy(Interview $interview): RedirectResponse
    {
        Gate::authorize('manage', $interview->application->jobPost);

        $interview->update(['status' => 'cancelled']);

        return back()->with('success', 'Interview cancelled.');
    }
}
