import { Link, router } from '@inertiajs/react';
import { ArrowUpRight, Briefcase, CircleCheck, Clock, FilePen, Laptop, MapPin, Pencil, Plus, Trash2, Users, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useConfirm } from '../../../Components/ConfirmDialog';
import { FilterTabs, NoResults, RowMenuButton, StatTile } from '../../../Components/DataView';
import { HeaderAction } from '../../../Components/PageHeader';
import { Menu, MenuDivider, MenuItem } from '../../../Components/Popover';
import { StatusBadge } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { SETUP_LABELS, salaryRange } from '../../../lib/utils';

const STATUS_TABS = [
    { value: 'all', label: 'All' },
    { value: 'published', label: 'Active' },
    { value: 'draft', label: 'Drafts' },
    { value: 'closed', label: 'Closed' },
];

const SORTS = [
    { value: 'newest', label: 'Newest' },
    { value: 'applicants', label: 'Most applicants' },
];

/** Accent colours per job status: top stripe and icon tile. */
const ACCENTS = {
    published: { stripe: 'from-brand via-indigo-500 to-success', tile: 'bg-brand/10 text-brand ring-brand/10' },
    draft: { stripe: 'from-amber-300 to-amber-500', tile: 'bg-amber-50 text-amber-600 ring-amber-200/60' },
    closed: { stripe: 'from-slate-300 to-slate-400', tile: 'bg-slate-100 text-slate-500 ring-slate-200' },
};

const MAX_CHIPS = 4;

function Meta({ icon: Icon, children }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-slate-400" />
            {children}
        </span>
    );
}

function JobCard({ job, maxApplicants, onDelete }) {
    const accent = ACCENTS[job.status] ?? ACCENTS.closed;
    const share = maxApplicants ? job.applicants / maxApplicants : 0;
    const extra = job.skills.length - MAX_CHIPS;

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/5">
            <span aria-hidden="true" className={`h-1 w-full bg-linear-to-r ${accent.stripe}`} />

            <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${accent.tile}`}>
                        <Briefcase className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/employer/jobs/${job.id}`} className="text-base font-bold text-slate-900 transition hover:text-brand">
                                {job.title}
                            </Link>
                            <StatusBadge status={job.status} />
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <Meta icon={MapPin}>{job.location ?? 'Location TBD'}</Meta>
                            <Meta icon={Laptop}>{SETUP_LABELS[job.work_setup] ?? job.work_setup}</Meta>
                            <Meta icon={Wallet}>{salaryRange(job.salary_min, job.salary_max)} / mo</Meta>
                        </div>
                    </div>
                    <Menu label={`Actions for ${job.title}`} trigger={(props, { open }) => <RowMenuButton {...props} open={open} />}>
                        {(close) => (
                            <>
                                <MenuItem
                                    icon={ArrowUpRight}
                                    onClick={() => {
                                        close();
                                        router.visit(`/employer/jobs/${job.id}`);
                                    }}
                                >
                                    View post
                                </MenuItem>
                                <MenuItem
                                    icon={Pencil}
                                    onClick={() => {
                                        close();
                                        router.visit(`/employer/jobs/${job.id}/edit`);
                                    }}
                                >
                                    Edit post
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem
                                    icon={Trash2}
                                    danger
                                    hint="Also removes its applications"
                                    onClick={() => {
                                        close();
                                        onDelete(job);
                                    }}
                                >
                                    Delete post
                                </MenuItem>
                            </>
                        )}
                    </Menu>
                </div>

                {job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {job.skills.slice(0, MAX_CHIPS).map((s) => (
                            <span key={s} className="rounded-full border border-brand/15 bg-brand/5 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                                #{s}
                            </span>
                        ))}
                        {extra > 0 && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">+{extra}</span>}
                    </div>
                )}

                <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
                    <div className="min-w-40 flex-1">
                        <p className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
                                <Users className="h-3.5 w-3.5" />
                                Applicants
                            </span>
                            <span className="font-bold text-slate-900 tabular-nums">{job.applicants}</span>
                        </p>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-linear-to-r from-brand to-indigo-500 transition-[width] duration-700"
                                style={{ width: `${Math.max(share * 100, job.applicants ? 8 : 0)}%` }}
                            />
                        </div>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            Posted {job.posted}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/employer/jobs/${job.id}/edit`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                        </Link>
                        <Link
                            href={`/employer/jobs/${job.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition group-hover:bg-brand"
                        >
                            View
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function Index({ jobs }) {
    const [confirm, dialog] = useConfirm();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('newest');

    const counts = useMemo(
        () => STATUS_TABS.reduce((acc, t) => ({ ...acc, [t.value]: t.value === 'all' ? jobs.length : jobs.filter((j) => j.status === t.value).length }), {}),
        [jobs],
    );
    const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants, 0);
    const maxApplicants = Math.max(0, ...jobs.map((j) => j.applicants));

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase().replace(/^#/, '');
        const list = jobs.filter(
            (job) =>
                (filter === 'all' || job.status === filter) &&
                (!q || job.title.toLowerCase().includes(q) || (job.location ?? '').toLowerCase().includes(q) || job.skills.some((s) => s.includes(q))),
        );
        // Server order is newest first; only re-sort for applicants.
        return sort === 'applicants' ? [...list].sort((a, b) => b.applicants - a.applicants) : list;
    }, [jobs, filter, query, sort]);

    const destroy = async (job) => {
        const ok = await confirm({
            tone: 'danger',
            title: `Delete "${job.title}"?`,
            message: 'The post and all of its applications and interviews will be permanently removed. This cannot be undone.',
            confirmLabel: 'Delete job',
        });
        if (ok) router.delete(`/employer/jobs/${job.id}`, { preserveScroll: true });
    };

    const total = jobs.length || 1;

    return (
        <AppLayout
            title="My Jobs"
            search={{ value: query, onChange: setQuery, placeholder: 'Search jobs, places or skills' }}
            header={{
                eyebrow: 'Employer · Jobs',
                eyebrowIcon: Briefcase,
                title: 'My Job Posts',
                subtitle: jobs.length
                    ? `${jobs.length} ${jobs.length === 1 ? 'post' : 'posts'}, ${counts.published} active. Edit, close or remove your listings.`
                    : 'No job posts yet. Create one to start matching candidates.',
                actions: (
                    <HeaderAction href="/employer/jobs/create" icon={Plus}>
                        New job
                    </HeaderAction>
                ),
            }}
        >
            {dialog}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile icon={Briefcase} label="Job posts" value={jobs.length} hint="Everything you've created" tone="slate" />
                <StatTile icon={CircleCheck} label="Active" value={counts.published} share={counts.published / total} tone="success" />
                <StatTile icon={FilePen} label="Drafts" value={counts.draft} share={counts.draft / total} tone="amber" />
                <StatTile icon={Users} label="Applicants" value={totalApplicants} hint="Across all your posts" tone="brand" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <FilterTabs label="Filter by status" value={filter} onChange={setFilter} tabs={STATUS_TABS.map((t) => ({ ...t, count: counts[t.value] }))} />
                <div role="group" aria-label="Sort jobs" className="flex items-center gap-1 self-start rounded-2xl bg-slate-100/80 p-1 text-xs font-semibold">
                    {SORTS.map((s) => (
                        <button
                            key={s.value}
                            type="button"
                            aria-pressed={sort === s.value}
                            onClick={() => setSort(s.value)}
                            className={`rounded-xl px-3 py-1.5 transition ${sort === s.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {visible.length === 0 ? (
                <section className="rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60">
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
                        {jobs.length ? 'Try a different title, place, skill or status.' : 'Create a job and tag the skills you need to start matching candidates.'}
                    </NoResults>
                </section>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {visible.map((job) => (
                        <JobCard key={job.id} job={job} maxApplicants={maxApplicants} onDelete={destroy} />
                    ))}

                    {/* Shortcut tile for the next post */}
                    <Link
                        href="/employer/jobs/create"
                        className="group flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-6 text-center transition hover:border-brand/40 hover:bg-brand/5"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand transition group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
                            <Plus className="h-5 w-5" />
                        </span>
                        <span className="text-sm font-bold text-slate-900">Post another job</span>
                        <span className="max-w-xs text-xs text-slate-500">Tag the skills you need and Matchd ranks applicants for you.</span>
                    </Link>
                </div>
            )}
        </AppLayout>
    );
}
