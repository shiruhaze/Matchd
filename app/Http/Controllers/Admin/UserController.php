<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::with('roles:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'company_name' => $u->company_name,
                'role' => $u->roles->first()?->name,
                'joined' => $u->created_at?->format('M j, Y'),
            ]);

        return Inertia::render('Admin/Users', ['users' => $users]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate(['role' => ['required', 'in:Admin,Employer,Applicant']]);

        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot change your own role.');
        }

        $user->syncRoles([$data['role']]);

        return back()->with('success', "{$user->name} is now {$data['role']}.");
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return back()->with('success', 'User deleted.');
    }
}
