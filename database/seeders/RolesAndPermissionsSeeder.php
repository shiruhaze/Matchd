<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            // Jobs
            'jobs.browse',
            'jobs.create',
            'jobs.manage',
            // Applications
            'applications.apply',
            'applications.view-own',
            'applications.review',
            // Interviews
            'interviews.view-own',
            'interviews.schedule',
            // Profile
            'profile.edit',
            // Administration
            'users.manage',
            'jobs.moderate',
        ];

        foreach ($permissions as $name) {
            Permission::findOrCreate($name, 'web');
        }

        Role::findOrCreate('Applicant', 'web')->syncPermissions([
            'jobs.browse',
            'applications.apply',
            'applications.view-own',
            'interviews.view-own',
            'profile.edit',
        ]);

        Role::findOrCreate('Employer', 'web')->syncPermissions([
            'jobs.create',
            'jobs.manage',
            'applications.review',
            'interviews.schedule',
        ]);

        Role::findOrCreate('Admin', 'web')->syncPermissions(Permission::all());
    }
}
