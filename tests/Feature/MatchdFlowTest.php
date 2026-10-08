<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Interview;
use App\Models\JobPost;
use App\Models\Skill;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MatchdFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function userWithRole(string $role, array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        return $user;
    }

    private function publishedJob(User $employer, array $skills = []): JobPost
    {
        $job = JobPost::create([
            'employer_id' => $employer->id,
            'title' => 'Frontend Engineer',
            'status' => JobPost::STATUS_PUBLISHED,
        ]);
        $job->skills()->sync(collect($skills)->map(fn ($s) => Skill::firstOrCreate(['name' => $s])->id));

        return $job;
    }

    public function test_landing_page_renders_for_guests(): void
    {
        $this->get('/')->assertInertia(fn (Assert $page) => $page->component('Landing'));
    }

    public function test_applicant_can_register_and_gets_role_and_profile(): void
    {
        $this->post('/register', [
            'role' => 'Applicant',
            'name' => 'Ada Applicant',
            'email' => 'ada@example.test',
            'password' => 'password-123',
            'password_confirmation' => 'password-123',
        ])->assertRedirect('/dashboard');

        $user = User::where('email', 'ada@example.test')->firstOrFail();
        $this->assertTrue($user->hasRole('Applicant'));
        $this->assertNotNull($user->profile);
    }

    public function test_employer_registration_requires_company_name(): void
    {
        $this->post('/register', [
            'role' => 'Employer',
            'name' => 'Eve Employer',
            'email' => 'eve@example.test',
            'password' => 'password-123',
            'password_confirmation' => 'password-123',
        ])->assertSessionHasErrors('company_name');
    }

    public function test_nobody_can_self_register_as_admin(): void
    {
        $this->post('/register', [
            'role' => 'Admin',
            'name' => 'Mallory',
            'email' => 'mallory@example.test',
            'password' => 'password-123',
            'password_confirmation' => 'password-123',
        ])->assertSessionHasErrors('role');

        $this->assertDatabaseMissing('users', ['email' => 'mallory@example.test']);
    }

    public function test_dashboard_redirects_each_role_to_its_home(): void
    {
        $this->actingAs($this->userWithRole('Applicant'))->get('/dashboard')->assertRedirect('/applicant/jobs');
        $this->actingAs($this->userWithRole('Employer'))->get('/dashboard')->assertRedirect('/employer/dashboard');
        $this->actingAs($this->userWithRole('Admin'))->get('/dashboard')->assertRedirect('/admin/users');
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/applicant/jobs')->assertRedirect('/login');
        $this->get('/employer/dashboard')->assertRedirect('/login');
    }

    public function test_roles_cannot_cross_into_other_portals(): void
    {
        $applicant = $this->userWithRole('Applicant');
        $employer = $this->userWithRole('Employer');

        $this->actingAs($applicant)->get('/employer/dashboard')->assertForbidden();
        $this->actingAs($applicant)->get('/admin/users')->assertForbidden();
        $this->actingAs($employer)->get('/applicant/jobs')->assertForbidden();
        $this->actingAs($employer)->get('/admin/users')->assertForbidden();
    }

    public function test_jobs_are_ranked_by_skill_match_percent(): void
    {
        $employer = $this->userWithRole('Employer');
        $applicant = $this->userWithRole('Applicant');
        $applicant->skills()->sync([Skill::create(['name' => 'react'])->id, Skill::create(['name' => 'css'])->id]);

        $this->publishedJob($employer, ['php', 'sql']);
        $this->publishedJob($employer, ['react', 'css']);
        $this->publishedJob($employer, ['react', 'node']);

        $this->actingAs($applicant)->get('/applicant/jobs')->assertInertia(
            fn (Assert $page) => $page
                ->component('Applicant/Jobs')
                ->where('jobs.0.match', 100)
                ->where('jobs.1.match', 50)
                ->where('jobs.2.match', 0)
        );
    }

    public function test_applicant_can_apply_once_and_not_to_unpublished_jobs(): void
    {
        $employer = $this->userWithRole('Employer');
        $applicant = $this->userWithRole('Applicant');
        $job = $this->publishedJob($employer);
        $draft = JobPost::create(['employer_id' => $employer->id, 'title' => 'Draft', 'status' => 'draft']);

        $this->actingAs($applicant)->post("/applicant/jobs/{$job->id}/apply")->assertRedirect();
        $this->actingAs($applicant)->post("/applicant/jobs/{$job->id}/apply")->assertRedirect();
        $this->assertSame(1, Application::count());

        $this->actingAs($applicant)->post("/applicant/jobs/{$draft->id}/apply")->assertForbidden();
    }

    public function test_employer_job_validation_is_server_side(): void
    {
        $employer = $this->userWithRole('Employer');

        $this->actingAs($employer)->post('/employer/jobs', [
            'title' => '',
            'employment_type' => 'nonsense',
            'work_setup' => 'remote',
            'status' => 'published',
            'salary_min' => 5000,
            'salary_max' => 1000,
        ])->assertSessionHasErrors(['title', 'employment_type', 'salary_max']);
    }

    public function test_employer_can_create_job_with_skill_tags(): void
    {
        $employer = $this->userWithRole('Employer');

        $this->actingAs($employer)->post('/employer/jobs', [
            'title' => 'Backend Dev',
            'employment_type' => 'full-time',
            'work_setup' => 'remote',
            'status' => 'published',
            'skills' => ['#PHP', 'laravel', 'php'],
        ])->assertRedirect('/employer/jobs');

        $job = JobPost::firstOrFail();
        $this->assertEqualsCanonicalizing(['php', 'laravel'], $job->skills->pluck('name')->all());
    }

    public function test_employer_cannot_edit_or_delete_another_employers_job(): void
    {
        $owner = $this->userWithRole('Employer');
        $other = $this->userWithRole('Employer');
        $job = $this->publishedJob($owner);

        $this->actingAs($other)->get("/employer/jobs/{$job->id}/edit")->assertForbidden();
        $this->actingAs($other)->delete("/employer/jobs/{$job->id}")->assertForbidden();
        $this->assertModelExists($job);
    }

    public function test_scheduling_an_interview_updates_application_status(): void
    {
        $employer = $this->userWithRole('Employer');
        $applicant = $this->userWithRole('Applicant');
        $job = $this->publishedJob($employer);
        $application = Application::create(['job_post_id' => $job->id, 'applicant_id' => $applicant->id]);

        $this->actingAs($employer)->post('/employer/interviews', [
            'application_id' => $application->id,
            'round' => 'technical',
            'date' => now()->addDay()->toDateString(),
            'time' => '10:00',
            'duration_minutes' => 45,
            'meeting_link' => 'https://meet.google.com/abc-defg-hij',
        ])->assertRedirect('/employer/interviews');

        $this->assertSame(Application::INTERVIEW_SCHEDULED, $application->fresh()->status);
        $this->assertSame(1, Interview::count());

        $this->actingAs($applicant)->get('/applicant/interviews')->assertInertia(
            fn (Assert $page) => $page->component('Applicant/Interviews')->has('upcoming', 1)
        );
    }

    public function test_employer_cannot_schedule_for_another_employers_applicant(): void
    {
        $owner = $this->userWithRole('Employer');
        $intruder = $this->userWithRole('Employer');
        $applicant = $this->userWithRole('Applicant');
        $application = Application::create(['job_post_id' => $this->publishedJob($owner)->id, 'applicant_id' => $applicant->id]);

        $this->actingAs($intruder)->post('/employer/interviews', [
            'application_id' => $application->id,
            'round' => 'initial',
            'date' => now()->addDay()->toDateString(),
            'time' => '10:00',
            'duration_minutes' => 30,
        ])->assertForbidden();

        $this->assertSame(0, Interview::count());
    }

    public function test_decline_is_limited_to_the_jobs_owner(): void
    {
        $owner = $this->userWithRole('Employer');
        $intruder = $this->userWithRole('Employer');
        $applicant = $this->userWithRole('Applicant');
        $application = Application::create(['job_post_id' => $this->publishedJob($owner)->id, 'applicant_id' => $applicant->id]);

        $this->actingAs($intruder)->patch("/employer/applications/{$application->id}/decline")->assertForbidden();
        $this->actingAs($owner)->patch("/employer/applications/{$application->id}/decline")->assertRedirect();

        $this->assertSame(Application::DECLINED, $application->fresh()->status);
    }

    public function test_profile_update_syncs_skills_and_validates(): void
    {
        $applicant = $this->userWithRole('Applicant');

        $this->actingAs($applicant)->put('/applicant/profile', [
            'name' => 'Ada',
            'preferred_setup' => 'moon-base',
            'github_url' => 'not-a-url',
        ])->assertSessionHasErrors(['preferred_setup', 'github_url']);

        $this->actingAs($applicant)->put('/applicant/profile', [
            'name' => 'Ada Lovelace',
            'preferred_setup' => 'hybrid',
            'skills' => ['#React', 'react', 'TypeScript'],
        ])->assertSessionHasNoErrors();

        $this->assertEqualsCanonicalizing(['react', 'typescript'], $applicant->fresh()->skills->pluck('name')->all());
    }

    public function test_admin_can_change_roles_but_not_their_own(): void
    {
        $admin = $this->userWithRole('Admin');
        $user = $this->userWithRole('Applicant');

        $this->actingAs($admin)->patch("/admin/users/{$user->id}/role", ['role' => 'Employer'])->assertRedirect();
        $this->assertTrue($user->fresh()->hasRole('Employer'));

        $this->actingAs($admin)->patch("/admin/users/{$admin->id}/role", ['role' => 'Applicant']);
        $this->assertTrue($admin->fresh()->hasRole('Admin'));
    }

    public function test_inertia_shares_roles_and_permissions_for_conditional_ui(): void
    {
        $employer = $this->userWithRole('Employer');

        $this->actingAs($employer)->get('/employer/dashboard')->assertInertia(
            fn (Assert $page) => $page
                ->where('auth.user.roles', ['Employer'])
                ->where('auth.user.permissions', fn ($permissions) => collect($permissions)->contains('jobs.create'))
        );
    }
}
