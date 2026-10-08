<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantProfile extends Model
{
    protected $fillable = [
        'user_id',
        'headline',
        'location',
        'phone',
        'bio',
        'resume_path',
        'github_url',
        'portfolio_url',
        'preferred_setup',
        'expected_salary',
        'open_to_work',
    ];

    protected function casts(): array
    {
        return ['open_to_work' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
