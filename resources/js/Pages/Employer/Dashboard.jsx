import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Briefcase, CalendarCheck, ChevronRight, Clock, Inbox, Plus, Sparkles, Users } from 'lucide-react';
import { StatTile } from '../../Components/DataView';
import { HeaderAction } from '../../Components/PageHeader';
import { EmptyState, StatusBadge } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { can, initials } from '../../lib/utils';

const PIPELINE = [
    { key: 'pending', label: 'New', bar: 'bg-amber-400', dot: 'bg-amber-400' },
    { key: 'under_review', label: 'In review', bar: 'bg-brand', dot: 'bg-brand' },
    { key: 'interview_scheduled', label: 'Interviewing', bar: 'bg-success', dot: 'bg-success' },
    { key: 'declined', label: 'Declined', bar: 'bg-slate-300', dot: 'bg-slate-300' },
];

const APP_STATUS = {
    pending: { label: 'New', className: 'bg-amber-50 text-amber-700 ring-amber-200/70' },
    under_review: { label: 'In review', className: 'bg-brand/5 text-brand ring-brand/15' },
    interview_scheduled: { label: 'Interview', className: 'bg-success/5 text-success ring-success/20' },
    declined: { label: 'Declined', className: 'bg-slate-100 text-slate-500 ring-slate-200' },
};

const AVATAR_TONES = ['from-brand to-indigo-600', 'from-emerald-500 to-success', 'from-violet-500 to-indigo-600', 'from-amber-400 to-orange-500', 'from-sky-400 to-brand'];

const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

function Panel({ title, action, className = '', children }) {
    return (
        <section className={`overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60 ${className}`}>
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                {action}
            </header>
            {children}
        </section>
    );
}

function PanelLink({ href, children }) {
    return (
        <Link href={href} className="group inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand transition hover:bg-brand/5">
            {children}
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </Link>
    );
}

/** Banner content: greeting, today's workload and the two main hiring actions. */
function dashboardHeader(user, stats) {
    const name = user.company_name ?? user.name.split(' ')[0];

    return {
        eyebrow: new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
        eyebrowIcon: Sparkles,
        title: `${greeting()}, ${name}`,
        subtitle:
            stats.pending > 0 ? (
                <>
                    <span className="font-semibold text-white">
                        {stats.pending} new {stats.pending === 1 ? 'application' : 'applications'}
                    </span>{' '}
                    waiting for review across {stats.active_jobs} active {stats.active_jobs === 1 ? 'post' : 'posts'}.
                </>
            ) : (
                "You're all caught up. Every application has been reviewed."
            ),
        actions: (
            <>
                <HeaderAction href="/employer/applications" icon={Inbox} badge={stats.pending}>
                    Review applicants
                </HeaderAction>
                {can(user, 'jobs.create') && (
                    <HeaderAction href="/employer/jobs/create" icon={Plus} variant="ghost">
                        Post a job
                    </HeaderAction>
                )}
            </>
        ),
    };
}

function Pipeline({ pipeline }) {
    const total = PIPELINE.reduce((sum, s) => sum + (pipeline[s.key] ?? 0), 0);

    return (
        <Panel title="Hiring pipeline" action={<span className="text-xs font-semibold text-slate-400 tabular-nums">{total} total</span>}>
            <div className="space-y-5 p-5 sm:p-6">
                <div className="flex h-3 gap-1 overflow-hidden rounded-full bg-slate-100">
                    {total > 0 &&
                        PIPELINE.map((s) =>
                            pipeline[s.key] ? (
                                <div
                                    key={s.key}
                                    title={`${s.label}: ${pipeline[s.key]}`}
                                    className={`h-full rounded-full transition-[width] duration-700 ${s.bar}`}
                                    style={{ width: `${(pipeline[s.key] / total) * 100}%` }}
                                />
                            ) : null,
                        )}
                </div>
                <ul className="grid grid-cols-2 gap-3">
                    {PIPELINE.map((s) => {
                        const n = pipeline[s.key] ?? 0;
                        return (
                            <li key={s.key} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                                <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                                    {s.label}
                                </p>
                                <p className="mt-1 flex items-baseline gap-1.5">
                                    <span className="text-xl font-bold text-slate-900 tabular-nums">{n}</span>
                                    <span className="text-[11px] font-semibold text-slate-400 tabular-nums">{total ? Math.round((n / total) * 100) : 0}%</span>
                                </p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Panel>
    );
}

function JobRow({ job, max }) {
    const share = max ? job.applicants / max : 0;

    return (
        <li className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/10">
                <Briefcase className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                    <StatusBadge status={job.status} />
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    Posted {job.posted}
                </p>
            </div>
            <div className="hidden w-36 shrink-0 sm:block">
                <p className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Applicants</span>
                    <span className="font-bold text-slate-900 tabular-nums">{job.applicants}</span>
                </p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-linear-to-r from-brand to-indigo-500 transition-[width] duration-700" style={{ width: `${Math.max(share * 100, job.applicants ? 8 : 0)}%` }} />
                </div>
            </div>
            <Link
                href={`/employer/jobs/${job.id}/edit`}
                aria-label={`Manage ${job.title}`}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white"
            >
                Manage
                <ChevronRight className="h-3.5 w-3.5" />
            </Link>
        </li>
    );
}

function RecentItem({ item, index, last }) {
    const status = APP_STATUS[item.status] ?? APP_STATUS.pending;

    return (
        <li className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span aria-hidden="true" className="absolute top-10 bottom-0 left-[1.1rem] w-px bg-slate-100" />}
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[11px] font-bold text-white shadow-sm ring-4 ring-white ${AVATAR_TONES[index % AVATAR_TONES.length]}`}>
                {initials(item.applicant)}
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">{item.applicant}</span> applied for{' '}
                        <span className="font-semibold text-brand">{item.job}</span>
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${status.className}`}>{status.label}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{item.when}</p>
            </div>
        </li>
    );
}

export default function Dashboard({ stats, jobs, recent, pipeline = {} }) {
    const { auth } = usePage().props;
    const maxApplicants = Math.max(0, ...jobs.map((j) => j.applicants));
    const applicants = stats.applicants || 1;

    return (
        <AppLayout title="Employer Dashboard" width="max-w-none" header={dashboardHeader(auth.user, stats)}>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile icon={Briefcase} label="Active job posts" value={stats.active_jobs} hint="Published and accepting" tone="brand" />
                <StatTile icon={Users} label="Total applicants" value={stats.applicants} hint="Across all your posts" tone="violet" />
                <StatTile icon={Clock} label="Pending review" value={stats.pending} share={stats.pending / applicants} tone="amber" />
                <StatTile icon={CalendarCheck} label="Interviews set" value={stats.interviews} share={stats.interviews / applicants} tone="success" />
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                <Panel title="Your job listings" className="lg:col-span-2" action={<PanelLink href="/employer/jobs">View all</PanelLink>}>
                    {jobs.length === 0 ? (
                        <div className="p-6">
                            <EmptyState icon={Briefcase} title="No jobs yet">
                                <Link href="/employer/jobs/create" className="font-semibold text-brand hover:underline">
                                    Create your first job
                                </Link>
                            </EmptyState>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {jobs.map((job) => (
                                <JobRow key={job.id} job={job} max={maxApplicants} />
                            ))}
                        </ul>
                    )}
                </Panel>

                <div className="space-y-6">
                    <Pipeline pipeline={pipeline} />

                    <Panel title="Recent applications" action={<PanelLink href="/employer/applications">Review</PanelLink>}>
                        <div className="p-5 sm:p-6">
                            {recent.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-6 text-center">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                        <Inbox className="h-5 w-5" />
                                    </span>
                                    <p className="text-sm font-semibold text-slate-700">No applications yet</p>
                                    <p className="text-xs text-slate-400">New applicants will show up here.</p>
                                </div>
                            ) : (
                                <ul>
                                    {recent.map((item, i) => (
                                        <RecentItem key={item.id} item={item} index={i} last={i === recent.length - 1} />
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Panel>
                </div>
            </div>
        </AppLayout>
    );
}
