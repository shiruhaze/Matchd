<?php

namespace App\Actions\Fortify;

use App\Models\ApplicantProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     *
     * @throws ValidationException
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            // Admin accounts are never self-registered.
            'role' => ['required', Rule::in(['Applicant', 'Employer'])],
            'company_name' => ['required_if:role,Employer', 'nullable', 'string', 'max:255'],
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'company_name' => $input['role'] === 'Employer' ? $input['company_name'] : null,
                'password' => $input['password'], // hashed by the model cast
            ]);

            $user->assignRole($input['role']);

            if ($input['role'] === 'Applicant') {
                ApplicantProfile::create(['user_id' => $user->id]);
            }

            return $user;
        });
    }
}
