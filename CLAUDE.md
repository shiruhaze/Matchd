# CLAUDE.md — Matchd Job Portal (FinalTermLaravel)

Matchd is a skill-tag-based job matching portal ("Match-a-JOB-today?"). Employers tag jobs with required skills, applicants tag their profile with skills, and the overlap becomes a **match %** shown to both sides.

This is the INTECH 3112 final project: the original static HTML/PHP prototype converted into **Laravel 12 + Inertia.js + React**, with **Fortify** for headless auth and **Spatie Permission** for RBAC. The old prototype is backed up outside the repo at `C:\Odysseus\matchd-prototype-backup`.

## Stack

| Layer | Choice |
|---|---|
| Backend | Laravel 12, PHP 8.2, MySQL 8 (XAMPP-era server on port **3307**) |
| Auth | Laravel Fortify (headless; registration, login, password reset) |
| RBAC | spatie/laravel-permission (`HasRoles` on `User`) |
| Frontend | React 19 + Inertia.js (`@inertiajs/react`), Vite 7, `@vitejs/plugin-react` v5 |
| Styling | Tailwind CSS v4 (`resources/css/app.css`, theme tokens `brand`, `success`) |
| Icons | `lucide-react` |
| Tests | PHPUnit feature tests on in-memory SQLite (never touch the MySQL data) |

## Setup / commands

```
php ..\composer.phar install      # Composer lives at C:\Odysseus\composer.phar (not on PATH)
npm install
copy .env.example .env && php artisan key:generate
# .env: DB_HOST=127.0.0.1 DB_PORT=3307 DB_DATABASE=matchd DB_USERNAME=root DB_PASSWORD=password
php artisan migrate:fresh --seed  # recreates everything + demo data
php artisan storage:link          # resume uploads
php artisan serve                 # http://127.0.0.1:8000
npm run dev                       # Vite dev server (or `npm run build`)
php artisan test                  # 18 feature tests
```

Gotchas: the `mysql` CLI shipped with XAMPP can't authenticate to this MySQL 8 server (caching_sha2). Use PHP/PDO or `artisan tinker`. In bash on this machine, a stray `python`/`python3` call hangs. Do not use it.

### Demo accounts (password `password`)
| Role | Email |
|---|---|
| Admin | admin@matchd.test |
| Employer | hr@mcorp.test, hr@securetech.test, hr@nexus.test |
| Applicant | john@example.test, jane@example.test, michael@example.test |

## Architecture

```
app/Models/            User (HasRoles), ApplicantProfile, Skill, JobPost, Application, Interview
app/Http/Controllers/
  Applicant/           JobController, ApplicationController, InterviewController, ProfileController
  Employer/            DashboardController, JobPostController (resource), ApplicationController, InterviewController
  Admin/               UserController, JobPostController
app/Actions/Fortify/   CreateNewUser (role + company_name, assigns role, creates profile)
app/Providers/FortifyServiceProvider.php   Fortify views -> Inertia pages
app/Http/Middleware/HandleInertiaRequests.php   shared props: auth.user(roles, permissions), flash, badges
app/Policies/JobPostPolicy.php             manage (owner or Admin), apply (published only)
app/Services/MatchScore.php                match % = matched required skills / required skills
routes/web.php (landing, /dashboard role redirect) + applicant.php + employer.php + admin.php
resources/js/app.jsx, Layouts/{AppLayout,AuthLayout}.jsx, Components/{ui,TagInput}.jsx, Pages/**
database/migrations, seeders (RolesAndPermissionsSeeder, DatabaseSeeder)
tests/Feature/MatchdFlowTest.php
```

Controllers validate with `$request->validate()` and return `Inertia::render('Area/Page', $data)`. Pages call the backend by hard-coded URLs (no Ziggy).

### Database (the `jobs` name is taken by Laravel's queue table, so postings are `job_posts`)
- `users` (+ `company_name`), Spatie tables (`roles`, `permissions`, pivots)
- `applicant_profiles` (1:1 user): headline, location, phone, bio, resume_path, github/portfolio URLs, preferred_setup, expected_salary, open_to_work
- `skills` + `skill_user` (applicant skills) + `job_post_skill` (required skills)
- `job_posts` (employer_id -> users): title, employment_type, work_setup, location, salary_min/max, description, requirements, status (draft/published/closed)
- `applications` (job_post_id, applicant_id; unique pair): status pending / under_review / interview_scheduled / declined, viewed_at
- `interviews` (application_id): round (initial/technical/final), scheduled_at, duration_minutes, meeting_link, note, status

All FKs use `cascadeOnDelete()`; all models define `$fillable`. Skill names are normalized to lowercase without `#`.

## Roles & permissions (Spatie)

| Role | Permissions | Home |
|---|---|---|
| Applicant | jobs.browse, applications.apply, applications.view-own, interviews.view-own, profile.edit | /applicant/jobs |
| Employer | jobs.create, jobs.manage, applications.review, interviews.schedule | /employer/dashboard |
| Admin | all (incl. users.manage, jobs.moderate) | /admin/users |

Route middleware: `auth` + `role:Applicant|Employer|Admin` per route file (aliases registered in `bootstrap/app.php`). Ownership checks use `Gate::authorize('manage', $job)`. Registration only allows Applicant or Employer; Admins are created by seeding or by another Admin. React hides UI based on `auth.user.roles` / `permissions` (helpers `can()` / `hasRole()` in `resources/js/lib/utils.js`).

## Features

**Public**: landing page (Sign Up / Log in), Fortify login, register (role picker; company name required for employers), forgot/reset password.

**Applicant**: Explore Jobs (ranked by match %, search by role/skill/company, Apply Now, side panel of active applications, profile completion); My Applications (tabs All/Active/Interviews, stats, interview card with Join Room); Interviews (Upcoming/Completed, "Starting Today" banner, recruiter instructions, Join Call); Profile & Skills (details, tag editor, resume upload PDF/DOC/DOCX 5 MB, links, completion checklist, work-setup and salary preferences).

**Employer**: Dashboard (stats, recent jobs, recent applications); My Jobs list with Create/Edit/Delete/Show (draft / publish / close, skill tags); Approve Applicants (match %, matched tags, filter tabs, search, Approve & Set Interview, Decline); Set Interview (candidate, round, date/time, duration, link, note, upcoming schedule with cancel).

**Admin**: Users & Roles (change role, delete; not self), Job Moderation (close/delete any job).

## Flow

```
Landing -> Register (role) / Login -> /dashboard -> role home

Employer: Create Job (+ skill tags) -> published
Applicant: Profile skill tags -> Explore Jobs (match %) -> Apply
Employer: Approve Applicants (matched tags) -> Approve & Set Interview / Decline
   -> Set Interview: application becomes interview_scheduled
Applicant: Applications + Interviews show schedule, note, meeting link
```

## UI design

Shared shell (`AppLayout`): dark `slate-900` sidebar (`w-64`, logo + role pill, role-specific nav, active item = solid `#1f48ff` pill with glow, count badges, user card + Sign out), sticky translucent top bar (optional search, bell, **Create a Job** for users with `jobs.create`), content `p-8 space-y-6` centered at `max-w-4xl`..`7xl`; page background `blue-50/50`. Below `md` the sidebar becomes a horizontal scrolling nav strip. Auth screens use `AuthLayout` (dark brand panel + white form card).

Components (`Components/ui.jsx`): `Card` (`rounded-2xl border-slate-200/80 shadow-xs`), `StatCard`, `StatusBadge`, `SkillChip`, `CompanyAvatar`, `Field` (label + inline server error), `Button` (primary/success/secondary/danger), `Tabs` (segmented control), `EmptyState`, `PageTitle`; `TagInput` for skill tags.

Palette: brand blue `#1f48ff` (hover `#1a3ed6`), success green `#457a00`, `slate-900/800` dark surfaces, emerald for match %, amber for pending/under review, red for errors/declined. Type is small and dense (`text-xs`/`text-sm`, Inter via bunny.net fonts). Landing page keeps the original artwork (`public/images`) with lime Sign Up and glass Log in buttons.

Forms use Inertia `useForm`: server validation errors render under each field and clear as the user edits; success/error flashes show in a dismissing banner.

## Conventions & caveats

- Keep new pages inside `AppLayout`; add routes to the matching `routes/*.php` file with names and role middleware.
- Add skills via the shared normalization (lowercase, strip `#`).
- Tests: add to `tests/Feature`; they use in-memory SQLite, so they are safe to run any time.
- Git: the original commit tracked `node_modules/`; it is now in `.gitignore` but old tracked files still show as modified, so run `git rm -r --cached node_modules` before committing. The user makes all commits, so do not commit.
- Not done: email verification, 2FA/passkeys (Fortify features disabled), real notifications behind the bell, e-mail delivery of interview invites, and automated browser testing. Verify "zero console errors" manually in the browser.
