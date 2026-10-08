<?php

namespace App\Policies;

use App\Models\JobPost;
use App\Models\User;

class JobPostPolicy
{
    /** Employers manage their own posts; Admins may manage all. */
    public function manage(User $user, JobPost $job): bool
    {
        return $user->hasRole('Admin')
            || ($user->hasPermissionTo('jobs.manage') && $job->employer_id === $user->id);
    }

    /** Applicants may apply to published jobs only. */
    public function apply(User $user, JobPost $job): bool
    {
        return $user->hasPermissionTo('applications.apply')
            && $job->status === JobPost::STATUS_PUBLISHED;
    }
}
