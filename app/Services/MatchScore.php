<?php

namespace App\Services;

use App\Models\JobPost;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Skill-tag matching: the share of a job's required skills that an applicant has.
 */
class MatchScore
{
    /**
     * @param  Collection<int, int>|array<int, int>  $applicantSkillIds
     */
    public static function percent(JobPost $job, Collection|array $applicantSkillIds): int
    {
        $required = $job->skills->pluck('id');

        if ($required->isEmpty()) {
            return 0;
        }

        $matched = $required->intersect($applicantSkillIds)->count();

        return (int) round($matched / $required->count() * 100);
    }

    /**
     * Names of the skills that both the job requires and the applicant has.
     *
     * @return array<int, string>
     */
    public static function matchedSkills(JobPost $job, User $applicant): array
    {
        $applicantSkillIds = $applicant->skills->pluck('id');

        return $job->skills
            ->whereIn('id', $applicantSkillIds)
            ->pluck('name')
            ->values()
            ->all();
    }
}
