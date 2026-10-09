import { router } from '@inertiajs/react';
import { Ban, Briefcase, CircleCheck, CircleSlash, Clock, ShieldCheck, Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useConfirm } from '../../Components/ConfirmDialog';
import { FilterTabs, NoResults, RowMenuButton, SearchField, StatTile } from '../../Components/DataView';
import { Menu, MenuDivider, MenuItem } from '../../Components/Popover';
import { HeaderAction } from '../../Components/PageHeader';
import { CompanyAvatar, StatusBadge } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';

const STATUS_TABS = [
    { value: 'all', label: 'All' },
    { value: 'published', label: 'Active' },
    { value: 'draft', label: 'Drafts' },
    { value: 'closed', label: 'Closed' },
];

function Applicants({ count }) {
    return (
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 tabular-nums">
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${count ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-400'}`}>
                <Users className="h-3.5 w-3.5" />
            </span>
            {count}
        </span>
    );
}

export default function Jobs({ jobs }) {
    const [confirm, dialog] = useConfirm();
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');

    const counts = useMemo(
        () => STATUS_TABS.reduce((acc, t) => ({ ...acc, [t.value]: t.value === 'all' ? jobs.length : jobs.filter((j) => j.status === t.value).length }), {}),
        [jobs],
    );
    const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants, 0);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return jobs.filter((j) => (filter === 'all' || j.status === filter) && (!q || [j.title, j.company].some((f) => f?.toLowerCase().includes(q))));
    }, [jobs, filter, query]);

    const close = async (job) => {
        const ok = await confirm({
            tone: 'brand',
            icon: Ban,
            title: `Close "${job.title}"?`,
            message: 'The post stops accepting applications and disappears from job search. Existing applications are kept.',
            confirmLabel: 'Close posting',
        });
        if (ok) router.patch(`/admin/jobs/${job.id}/close`, {}, { preserveScroll: true });
    };

    const destroy = async (job) => {
        const ok = await confirm({
            tone: 'danger',
            title: `Delete "${job.title}"?`,
            message: 'The job post and all of its applications and interviews will be permanently removed. This cannot be undone.',
            confirmLabel: 'Delete job',
        });
        if (ok) router.delete(`/admin/jobs/${job.id}`, { preserveScroll: true });
    };

    const rowMenu = (job) => (
        <Menu label={`Actions for ${job.title}`} trigger={(props, { open }) => <RowMenuButton {...props} open={open} />}>
            {(closeMenu) => (
                <>
                    <MenuItem
                        icon={Ban}
                        hint={job.status === 'closed' ? 'Already closed' : 'Stop accepting applications'}
                        disabled={job.status === 'closed'}
                        onClick={() => {
                            closeMenu();
                            close(job);
                        }}
                    >
                        Close posting
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem
                        icon={Trash2}
                        danger
                        hint="Remove the post and its applications"
                        onClick={() => {
                            closeMenu();
                            destroy(job);
                        }}
                    >
                        Delete job
                    </MenuItem>
                </>
            )}
        </Menu>
    );

    const total = jobs.length || 1;

    return (
        <AppLayout
            title="Job Moderation"
            header={{
                eyebrow: 'Admin · Moderation',
                eyebrowIcon: ShieldCheck,
                title: 'Job Moderation',
                subtitle: `${counts.published} active and ${counts.closed} closed posts, with ${totalApplicants} applications across all employers.`,
                actions: (
                    <HeaderAction href="/admin/users" icon={Users} variant="ghost">
                        Manage users
                    </HeaderAction>
                ),
            }}
        >
            {dialog}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile icon={Briefcase} label="Job posts" value={jobs.length} hint="Across all employers" tone="slate" />
                <StatTile icon={CircleCheck} label="Active" value={counts.published} share={counts.published / total} tone="success" />
                <StatTile icon={CircleSlash} label="Closed" value={counts.closed} share={counts.closed / total} tone="red" />
                <StatTile icon={Users} label="Applications" value={totalApplicants} hint="Submitted to all posts" tone="brand" />
            </div>

            <section className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <FilterTabs label="Filter by status" value={filter} onChange={setFilter} tabs={STATUS_TABS.map((t) => ({ ...t, count: counts[t.value] }))} />
                    <SearchField value={query} onChange={setQuery} placeholder="Search title or company" />
                </div>

                {visible.length === 0 ? (
                    <NoResults
                        title={jobs.length ? 'No jobs match' : 'No job posts yet'}
                        onReset={
                            jobs.length
                                ? () => {
                                      setFilter('all');
                                      setQuery('');
                                  }
                                : undefined
                        }
                    >
                        {jobs.length ? 'Try a different title, company or status.' : 'Posts appear here as soon as employers publish them.'}
                    </NoResults>
                ) : (
                    <>
                        <table className="hidden w-full text-left md:table">
                            <thead>
                                <tr className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                    <th className="px-6 py-3.5">Job</th>
                                    <th className="px-4 py-3.5">Company</th>
                                    <th className="px-4 py-3.5">Applicants</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {visible.map((job) => (
                                    <tr key={job.id} className="transition-colors hover:bg-slate-50/70">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{job.title}</p>
                                            <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-500">
                                                <Clock className="h-3.5 w-3.5" />
                                                Posted {job.posted}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-3 text-sm text-slate-700">
                                                <CompanyAvatar name={job.company} size="h-9 w-9" />
                                                {job.company}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Applicants count={job.applicants} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={job.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">{rowMenu(job)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <ul className="divide-y divide-slate-100 md:hidden">
                            {visible.map((job) => (
                                <li key={job.id} className="space-y-3 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <CompanyAvatar name={job.company} size="h-10 w-10" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900">{job.title}</p>
                                                <p className="truncate text-xs text-slate-500">
                                                    {job.company} · {job.posted}
                                                </p>
                                            </div>
                                        </div>
                                        {rowMenu(job)}
                                    </div>
                                    <div className="flex items-center justify-between pl-[3.25rem]">
                                        <StatusBadge status={job.status} />
                                        <Applicants count={job.applicants} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
                    Showing <span className="font-semibold text-slate-700">{visible.length}</span> of {jobs.length} job posts
                </div>
            </section>
        </AppLayout>
    );
}
