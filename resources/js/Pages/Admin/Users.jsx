import { router, usePage } from '@inertiajs/react';
import { Briefcase, Building2, Mail, ShieldCheck, Trash2, UserRound, Users as UsersIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useConfirm } from '../../Components/ConfirmDialog';
import { FilterTabs, NoResults, RowMenuButton, SearchField, StatTile } from '../../Components/DataView';
import { Menu, MenuDivider, MenuItem, Select } from '../../Components/Popover';
import { HeaderAction } from '../../Components/PageHeader';
import AppLayout from '../../Layouts/AppLayout';
import { can, initials } from '../../lib/utils';

const ROLE_OPTIONS = [
    {
        value: 'Applicant',
        label: 'Applicant',
        description: 'Browses jobs, applies and attends interviews.',
        icon: Briefcase,
        tone: { chip: 'bg-emerald-50 text-emerald-600', icon: 'bg-emerald-50 text-emerald-600' },
    },
    {
        value: 'Employer',
        label: 'Employer',
        description: 'Posts jobs, reviews applicants and schedules interviews.',
        icon: Building2,
        tone: { chip: 'bg-brand/10 text-brand', icon: 'bg-brand/10 text-brand' },
    },
    {
        value: 'Admin',
        label: 'Admin',
        description: 'Full access: users, roles and job moderation.',
        icon: ShieldCheck,
        tone: { chip: 'bg-violet-50 text-violet-600', icon: 'bg-violet-50 text-violet-600' },
    },
];

const AVATAR_TONES = {
    Applicant: 'from-emerald-400 to-success',
    Employer: 'from-brand to-indigo-600',
    Admin: 'from-violet-500 to-indigo-600',
};

function UserAvatar({ user }) {
    return (
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-white shadow-sm ring-2 ring-white ${AVATAR_TONES[user.role] ?? 'from-slate-400 to-slate-500'}`}>
            {initials(user.name)}
        </span>
    );
}

function UserIdentity({ user, isSelf }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <UserAvatar user={user} />
            <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-sm font-bold text-slate-900">
                    {user.name}
                    {isSelf && <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">You</span>}
                </p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
        </div>
    );
}

export default function Users({ users }) {
    const { auth } = usePage().props;
    const canManage = can(auth.user, 'users.manage');
    const [confirm, dialog] = useConfirm();
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [pendingId, setPendingId] = useState(null);

    const counts = useMemo(
        () => ROLE_OPTIONS.reduce((acc, r) => ({ ...acc, [r.value]: users.filter((u) => u.role === r.value).length }), {}),
        [users],
    );

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter(
            (u) =>
                (filter === 'all' || u.role === filter) &&
                (!q || [u.name, u.email, u.company_name].some((field) => field?.toLowerCase().includes(q))),
        );
    }, [users, filter, query]);

    const changeRole = async (user, role) => {
        if (
            role === 'Admin' &&
            !(await confirm({
                tone: 'brand',
                title: `Make ${user.name} an admin?`,
                message: 'Admins can change roles, delete users and moderate every job post on Matchd.',
                confirmLabel: 'Grant admin access',
            }))
        ) {
            return;
        }

        router.patch(
            `/admin/users/${user.id}/role`,
            { role },
            { preserveScroll: true, onStart: () => setPendingId(user.id), onFinish: () => setPendingId(null) },
        );
    };

    const destroy = async (user) => {
        const ok = await confirm({
            tone: 'danger',
            title: `Delete ${user.name}?`,
            message: 'Their account and everything linked to it (profile, job posts, applications) will be permanently removed. This cannot be undone.',
            confirmLabel: 'Delete user',
        });
        if (ok) router.delete(`/admin/users/${user.id}`, { preserveScroll: true });
    };

    const roleSelect = (user, isSelf) => (
        <Select
            label={`Role for ${user.name}`}
            value={user.role}
            options={ROLE_OPTIONS}
            onChange={(role) => changeRole(user, role)}
            disabled={isSelf || !canManage}
            lockedReason={isSelf ? 'You cannot change your own role' : 'You do not have permission to manage users'}
            loading={pendingId === user.id}
        />
    );

    const rowMenu = (user, isSelf) =>
        !isSelf && canManage ? (
            <Menu label={`Actions for ${user.name}`} trigger={(props, { open }) => <RowMenuButton {...props} open={open} />}>
                {(close) => (
                    <>
                        <MenuItem
                            icon={Mail}
                            hint={user.email}
                            onClick={() => {
                                close();
                                window.location.href = `mailto:${user.email}`;
                            }}
                        >
                            Send email
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem
                            icon={Trash2}
                            danger
                            hint="Permanently remove this account"
                            onClick={() => {
                                close();
                                destroy(user);
                            }}
                        >
                            Delete user
                        </MenuItem>
                    </>
                )}
            </Menu>
        ) : (
            <span className="inline-block h-9 w-9" />
        );

    const total = users.length || 1;

    return (
        <AppLayout
            title="Users & Roles"
            header={{
                eyebrow: 'Admin · People',
                eyebrowIcon: UsersIcon,
                title: 'Users & Roles',
                subtitle: `${users.length} accounts: ${counts.Employer} employers, ${counts.Applicant} applicants and ${counts.Admin} ${counts.Admin === 1 ? 'admin' : 'admins'}.`,
                actions: (
                    <HeaderAction href="/admin/jobs" icon={ShieldCheck} variant="ghost">
                        Moderate jobs
                    </HeaderAction>
                ),
            }}
        >
            {dialog}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile icon={UsersIcon} label="Total users" value={users.length} hint="All registered accounts" tone="slate" />
                <StatTile icon={Briefcase} label="Applicants" value={counts.Applicant} share={counts.Applicant / total} tone="success" />
                <StatTile icon={Building2} label="Employers" value={counts.Employer} share={counts.Employer / total} tone="brand" />
                <StatTile icon={ShieldCheck} label="Admins" value={counts.Admin} share={counts.Admin / total} tone="violet" />
            </div>

            <section className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <FilterTabs
                        label="Filter by role"
                        value={filter}
                        onChange={setFilter}
                        tabs={[
                            { value: 'all', label: 'All', count: users.length },
                            { value: 'Applicant', label: 'Applicants', count: counts.Applicant },
                            { value: 'Employer', label: 'Employers', count: counts.Employer },
                            { value: 'Admin', label: 'Admins', count: counts.Admin },
                        ]}
                    />
                    <SearchField value={query} onChange={setQuery} placeholder="Search name, email or company" />
                </div>

                {visible.length === 0 ? (
                    <NoResults
                        title="No users match"
                        onReset={() => {
                            setFilter('all');
                            setQuery('');
                        }}
                    >
                        Try a different name, email or role filter.
                    </NoResults>
                ) : (
                    <>
                        {/* Desktop table */}
                        <table className="hidden w-full text-left md:table">
                            <thead>
                                <tr className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                    <th className="px-6 py-3.5">User</th>
                                    <th className="px-4 py-3.5">Company</th>
                                    <th className="px-4 py-3.5">Role</th>
                                    <th className="px-4 py-3.5">Joined</th>
                                    <th className="px-6 py-3.5 text-right">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {visible.map((user) => {
                                    const isSelf = user.id === auth.user.id;

                                    return (
                                        <tr key={user.id} className="group transition-colors hover:bg-slate-50/70">
                                            <td className="px-6 py-4">
                                                <UserIdentity user={user} isSelf={isSelf} />
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                {user.company_name ? (
                                                    <span className="inline-flex items-center gap-2 text-slate-700">
                                                        <Building2 className="h-4 w-4 text-slate-400" />
                                                        {user.company_name}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 text-slate-400">
                                                        <UserRound className="h-4 w-4" />
                                                        Individual
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">{roleSelect(user, isSelf)}</td>
                                            <td className="px-4 py-4 text-sm whitespace-nowrap text-slate-500">{user.joined ?? '—'}</td>
                                            <td className="px-6 py-4 text-right">{rowMenu(user, isSelf)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Phone cards */}
                        <ul className="divide-y divide-slate-100 md:hidden">
                            {visible.map((user) => {
                                const isSelf = user.id === auth.user.id;

                                return (
                                    <li key={user.id} className="space-y-3 p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <UserIdentity user={user} isSelf={isSelf} />
                                            {rowMenu(user, isSelf)}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-2 pl-[3.25rem]">
                                            {roleSelect(user, isSelf)}
                                            <span className="text-xs text-slate-400">{user.company_name ?? 'Individual'}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}

                <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
                    Showing <span className="font-semibold text-slate-700">{visible.length}</span> of {users.length} users
                </div>
            </section>
        </AppLayout>
    );
}
