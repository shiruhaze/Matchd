<?php

namespace App\Http\Middleware;

use App\Models\Application;
use App\Models\Interview;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'company_name' => $user->company_name,
                    'roles' => $user->getRoleNames()->values(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->values(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
            'badges' => fn () => $this->sidebarBadges($request),
        ];
    }

    /**
     * Counts shown next to sidebar navigation items.
     *
     * @return array<string, int>
     */
    private function sidebarBadges(Request $request): array
    {
        $user = $request->user();

        if (! $user) {
            return [];
        }

        if ($user->hasRole('Applicant')) {
            return [
                'applications' => $user->applications()->count(),
                'interviews' => Interview::where('status', 'scheduled')
                    ->where('scheduled_at', '>=', now()->startOfDay())
                    ->whereHas('application', fn ($q) => $q->where('applicant_id', $user->id))
                    ->count(),
            ];
        }

        if ($user->hasRole('Employer')) {
            return [
                'pending' => Application::where('status', Application::PENDING)
                    ->whereHas('jobPost', fn ($q) => $q->where('employer_id', $user->id))
                    ->count(),
            ];
        }

        return [];
    }
}
