<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Profile completion checklist, shared by the jobs and profile pages.
     *
     * @return array{percent: int, checks: array<int, array{label: string, done: bool}>}
     */
    public static function completion(User $user): array
    {
        $user->loadMissing(['profile', 'skills']);
        $profile = $user->profile;

        $checks = [
            ['label' => 'Basic contact details', 'done' => filled($profile?->phone) && filled($profile?->headline)],
            ['label' => 'Added 5+ key skill tags', 'done' => $user->skills->count() >= 5],
            ['label' => 'Resume uploaded', 'done' => filled($profile?->resume_path)],
            ['label' => 'Professional bio', 'done' => filled($profile?->bio)],
            ['label' => 'Portfolio or GitHub link', 'done' => filled($profile?->github_url) || filled($profile?->portfolio_url)],
        ];

        $done = collect($checks)->where('done', true)->count();

        return ['percent' => (int) round($done / count($checks) * 100), 'checks' => $checks];
    }

    public function edit(Request $request): Response
    {
        $user = $request->user()->load(['profile', 'skills']);
        $profile = $user->profile;

        return Inertia::render('Applicant/Profile', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'headline' => $profile?->headline,
                'location' => $profile?->location,
                'phone' => $profile?->phone,
                'bio' => $profile?->bio,
                'github_url' => $profile?->github_url,
                'portfolio_url' => $profile?->portfolio_url,
                'preferred_setup' => $profile?->preferred_setup ?? 'remote',
                'expected_salary' => $profile?->expected_salary,
                'open_to_work' => $profile?->open_to_work ?? true,
                'resume_name' => $profile?->resume_path ? basename($profile->resume_path) : null,
                'skills' => $user->skills->pluck('name')->values(),
            ],
            'completion' => self::completion($user),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'headline' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'portfolio_url' => ['nullable', 'url', 'max:255'],
            'preferred_setup' => ['required', 'in:remote,hybrid,onsite'],
            'expected_salary' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'open_to_work' => ['boolean'],
            'skills' => ['array', 'max:30'],
            'skills.*' => ['string', 'max:40'],
            'resume' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

        $user = $request->user();
        $user->update(['name' => $data['name']]);

        $attributes = collect($data)->only([
            'headline', 'location', 'phone', 'bio', 'github_url', 'portfolio_url',
            'preferred_setup', 'expected_salary', 'open_to_work',
        ])->all();

        if ($request->hasFile('resume')) {
            $existing = $user->profile?->resume_path;
            if ($existing) {
                Storage::disk('public')->delete($existing);
            }
            $attributes['resume_path'] = $request->file('resume')->store('resumes', 'public');
        }

        $user->profile()->updateOrCreate(['user_id' => $user->id], $attributes);

        $skillIds = collect($data['skills'] ?? [])
            ->map(fn ($name) => strtolower(ltrim(trim($name), '#')))
            ->filter()
            ->unique()
            ->map(fn ($name) => Skill::firstOrCreate(['name' => $name])->id);

        $user->skills()->sync($skillIds);

        return back()->with('success', 'Profile updated.');
    }
}
