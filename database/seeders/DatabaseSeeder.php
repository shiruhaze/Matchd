<?php

namespace Database\Seeders;

use App\Models\ApplicantProfile;
use App\Models\Application;
use App\Models\Interview;
use App\Models\JobPost;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        $skills = collect([
            'reactjs', 'tailwindcss', 'typescript', 'javascript', 'figma', 'frontend',
            'css', 'php', 'laravel', 'nodejs', 'cybersec', 'networking', 'python', 'sql',
        ])->mapWithKeys(fn ($name) => [$name => Skill::firstOrCreate(['name' => $name])]);

        User::factory()->create([
            'name' => 'Matchd Admin',
            'email' => 'admin@matchd.test',
        ])->assignRole('Admin');

        $employers = collect([
            ['MCorp HR', 'hr@mcorp.test', 'MCorp Tech Solutions'],
            ['SecureTech HR', 'hr@securetech.test', 'SecureTech Corp'],
            ['Nexus HR', 'hr@nexus.test', 'Nexus Labs'],
        ])->map(function (array $e) {
            $user = User::factory()->create([
                'name' => $e[0],
                'email' => $e[1],
                'company_name' => $e[2],
            ]);
            $user->assignRole('Employer');

            return $user;
        });

        $jobDefinitions = [
            [0, 'Senior Frontend Engineer', 'remote', 'Manila, PH', 3500, 4500, ['reactjs', 'tailwindcss', 'typescript', 'frontend']],
            [0, 'Backend Laravel Developer', 'hybrid', 'Manila, PH', 3000, 4000, ['php', 'laravel', 'sql']],
            [1, 'Cyber Security Analyst', 'onsite', 'Manila, PH', 3000, 4200, ['cybersec', 'networking', 'python']],
            [2, 'UI/UX Web Developer', 'hybrid', 'Cebu, PH', 2800, 3600, ['figma', 'frontend', 'css']],
            [2, 'Full Stack Engineer', 'remote', 'Remote', 3200, 4400, ['reactjs', 'nodejs', 'sql', 'javascript']],
        ];

        $jobs = collect($jobDefinitions)->map(function (array $d) use ($employers, $skills) {
            $job = JobPost::create([
                'employer_id' => $employers[$d[0]]->id,
                'title' => $d[1],
                'employment_type' => 'full-time',
                'work_setup' => $d[2],
                'location' => $d[3],
                'salary_min' => $d[4],
                'salary_max' => $d[5],
                'description' => "We are looking for a {$d[1]} to join our team and build products people love.",
                'requirements' => "- 3+ years of relevant experience\n- Strong communication skills\n- Comfortable working in an agile team",
                'status' => JobPost::STATUS_PUBLISHED,
            ]);
            $job->skills()->sync(collect($d[6])->map(fn ($s) => $skills[$s]->id));

            return $job;
        });

        $applicantDefinitions = [
            ['John Doe', 'john@example.test', 'Senior Frontend Engineer', ['reactjs', 'tailwindcss', 'typescript', 'javascript', 'frontend']],
            ['Jane Smith', 'jane@example.test', 'Security Analyst', ['cybersec', 'networking', 'python']],
            ['Michael Khan', 'michael@example.test', 'UI/UX Designer', ['figma', 'css', 'frontend']],
        ];

        $applicants = collect($applicantDefinitions)->map(function (array $a) use ($skills) {
            $user = User::factory()->create(['name' => $a[0], 'email' => $a[1]]);
            $user->assignRole('Applicant');
            ApplicantProfile::create([
                'user_id' => $user->id,
                'headline' => $a[2],
                'location' => 'Manila, Philippines',
                'phone' => '+63 917 123 4567',
                'bio' => "{$a[2]} with a passion for building great products.",
                'expected_salary' => 3500,
            ]);
            $user->skills()->sync(collect($a[3])->map(fn ($s) => $skills[$s]->id));

            return $user;
        });

        [$john, $jane, $michael] = $applicants->all();

        Application::create(['job_post_id' => $jobs[0]->id, 'applicant_id' => $john->id, 'status' => Application::UNDER_REVIEW, 'viewed_at' => now()->subDay()]);
        Application::create(['job_post_id' => $jobs[4]->id, 'applicant_id' => $john->id, 'status' => Application::PENDING]);
        Application::create(['job_post_id' => $jobs[3]->id, 'applicant_id' => $michael->id, 'status' => Application::PENDING]);

        $janeApplication = Application::create(['job_post_id' => $jobs[2]->id, 'applicant_id' => $jane->id, 'status' => Application::INTERVIEW_SCHEDULED]);
        Interview::create([
            'application_id' => $janeApplication->id,
            'round' => 'initial',
            'scheduled_at' => now()->setTime(14, 0),
            'duration_minutes' => 45,
            'meeting_link' => 'https://meet.google.com/abc-defg-hij',
            'note' => 'Please test your microphone and camera before joining.',
        ]);
    }
}
