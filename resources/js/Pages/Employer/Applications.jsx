import { Link, router, usePage } from '@inertiajs/react';
import { ArrowUpRight, Briefcase, CalendarCheck, CalendarPlus, Clock, Mail, Sparkles, Users, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ScoreRing } from '../../Components/Brand';
import { useConfirm } from '../../Components/ConfirmDialog';
import { FilterTabs, NoResults, RowMenuButton, StatTile } from '../../Components/DataView';
import { HeaderAction } from '../../Components/PageHeader';
import { Menu, MenuDivider, MenuItem } from '../../Components/Popover';
import { StatusBadge } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { can, initials } from '../../lib/utils';

// "To review" covers both new and in-review applications: both still need a decision.
const OPEN = ['pending', 'under_review'];

const FILTERS = [
    { value: 'all', label: 'All', test: () => true },
    { value: 'review', label: 'To review', test: (a) => OPEN.includes(a.status) },
    { value: 'interview', label: 'Interviewing', test: (a) => a.status === 'interview_scheduled' },
    { value: 'declined', label: 'Declined', test: (a) => a.status === 'declined' },
];

const SORTS = [
    { value: 'match', label: 'Best match' },
    { value: 'newest', label: 'Newest' },
];

const AVATAR_TONES = ['from-brand to-indigo-600', 'from-emerald-500 to-success', 'from-violet-500 to-indigo-600', 'from-amber-400 to-orange-500', 'from-sky-400 to-brand'];

const matchTone = (m) => (m >= 75 ? 'text-success' : m >= 40 ? 'text-amber-600' : 'text-slate-500');

function CandidateCard({ a, canSchedule, onDecline }) {
    const open = OPEN.includes(a.status);
    const declined = a.status === 'declined';

    return (
        <article
            className={`group flex flex-col gap-5 rounded-3xl border border-white/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60 transition duration-300 hover:shadow-xl hover:shadow-slate-900/5 sm:p-6 lg:flex-row lg:items-center ${
                declined ? 'opacity-70' : ''
            }`}
        >
            {/* Who */}
            <div className="flex min-w-0 items-center gap-4 lg:w-64 lg:shrink-0">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-sm font-bold text-white shadow-sm ${AVATAR_TONES[a.id % AVATAR_TONES.length]}`}>
                    {initials(a.applicant)}
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{a.applicant}</p>
                    <p className="truncate text-xs text-slate-500">{a.email}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        Applied {a.applied}
                    </p>
                </div>
            </div>

            {/* Fit */}
            <div className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                <ScoreRing value={a.match} />
                <div className="min-w-0 flex-1">
                    <Link href={`/employer/jobs/${a.job_id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 transition hover:text-brand">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                        {a.job}
                    </Link>
                    <p className={`mt-0.5 text-[11px] font-semibold ${matchTone(a.match)}`}>
                        {a.matched_skills.length} of {a.required_skills} required {a.required_skills === 1 ? 'skill' : 'skills'} matched
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                        {a.matched_skills.length === 0 ? (
                            <span className="text-[11px] text-slate-400">No matching skill tags</span>
                        ) : (
                            a.matched_skills.map((s) => (
                                <span key={s} className="rounded-full border border-success/20 bg-success/5 px-2 py-0.5 text-[10px] font-semibold text-success">
                                    #{s}
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Decision */}
            <div className="flex items-center justify-between gap-3 lg:w-auto lg:shrink-0 lg:justify-end">
                <StatusBadge status={a.status} />
                <div className="flex items-center gap-1.5">
                    {open && canSchedule ? (
                        <Link
                            href={`/employer/interviews?application=${a.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-brand to-brand-dark px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-md shadow-brand/25 transition hover:-translate-y-0.5"
                        >
                            <CalendarPlus className="h-3.5 w-3.5" />
                            Approve & schedule
                        </Link>
                    ) : a.status === 'interview_scheduled' ? (
                        <Link
                            href="/employer/interviews"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-slate-700 transition hover:bg-slate-200"
                        >
                            <CalendarCheck className="h-3.5 w-3.5" />
                            View schedule
                        </Link>
                    ) : null}
                    <Menu label={`Actions for ${a.applicant}`} trigger={(props, { open: menuOpen }) => <RowMenuButton {...props} open={menuOpen} />}>
                        {(close) => (
                            <>
                                <MenuItem
                                    icon={Mail}
                                    hint={a.email}
                                    onClick={() => {
                                        close();
                                        window.location.href = `mailto:${a.email}`;
                                    }}
                                >
                                    Email applicant
                                </MenuItem>
                                <MenuItem
                                    icon={ArrowUpRight}
                                    onClick={() => {
                                        close();
                                        router.visit(`/employer/jobs/${a.job_id}`);
                                    }}
                                >
                                    View job post
                                </MenuItem>
                                {open && (
                                    <>
                                        <MenuDivider />
                                        <MenuItem
                                            icon={XCircle}
                                            danger
                                            hint="Marks this application as declined"
                                            onClick={() => {
                                                close();
                                                onDecline(a);
                                            }}
                                        >
                                            Decline
                                        </MenuItem>
                                    </>
                                )}
                            </>
                        )}
                    </Menu>
                </div>
            </div>
        </article>
    );
}

export default function Applications({ applications, stats }) {
    const { auth } = usePage().props;
    const canSchedule = can(auth.user, 'interviews.schedule');
    const [confirm, dialog] = useConfirm();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('match');

    const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.value, applications.filter(f.test).length])), [applications]);
    const toReview = stats.to_review ?? counts.review;

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase().replace(/^#/, '');
        const test = FILTERS.find((f) => f.value === filter).test;
        const list = applications.filter(
            (a) => test(a) && (!q || a.applicant.toLowerCase().includes(q) || a.job.toLowerCase().includes(q) || a.matched_skills.some((s) => s.includes(q))),
        );
        // Server order is best match first; only re-sort for newest.
        return sort === 'newest' ? [...list].sort((x, y) => y.applied_at - x.applied_at) : list;
    }, [applications, filter, query, sort]);

    const decline = async (a) => {
        const ok = await confirm({
            tone: 'danger',
            icon: XCircle,
            title: `Decline ${a.applicant}?`,
            message: `They will be marked as declined for "${a.job}". You can't undo this from here.`,
            confirmLabel: 'Decline applicant',
        });
        if (ok) router.patch(`/employer/applications/${a.id}/decline`, {}, { preserveScroll: true });
    };

    const total = stats.total || 1;

    return (
        <AppLayout
            title="Approve Applicants"
            search={{ value: query, onChange: setQuery, placeholder: 'Search applicants, jobs or skills' }}
            header={{
                eyebrow: 'Employer · Applicants',
                eyebrowIcon: Users,
                title: 'Approve Applicants',
                subtitle: stats.total
                    ? `${toReview} waiting for a decision and ${stats.interviews} ${stats.interviews === 1 ? 'interview' : 'interviews'} scheduled, out of ${stats.total} ${stats.total === 1 ? 'applicant' : 'applicants'}.`
                    : 'No applications yet. Applicants appear here as soon as they apply to your posts.',
                actions: canSchedule && (
                    <HeaderAction href="/employer/interviews" icon={CalendarCheck} variant="ghost">
                        Set interview
                    </HeaderAction>
                ),
            }}
        >
            {dialog}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile icon={Users} label="Applicants" value={stats.total} hint="Across all your posts" tone="brand" />
                <StatTile icon={Clock} label="To review" value={toReview} share={toReview / total} tone="amber" />
                <StatTile icon={CalendarCheck} label="Interviews" value={stats.interviews} hint="Scheduled and upcoming" tone="success" />
                <StatTile icon={Sparkles} label="Average match" value={`${stats.avg_match ?? 0}%`} share={(stats.avg_match ?? 0) / 100} tone="violet" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <FilterTabs label="Filter applicants" value={filter} onChange={setFilter} tabs={FILTERS.map((f) => ({ value: f.value, label: f.label, count: counts[f.value] }))} />
                <div role="group" aria-label="Sort applicants" className="flex items-center gap-1 self-start rounded-2xl bg-slate-100/80 p-1 text-xs font-semibold">
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
                        title={applications.length ? 'No applicants match' : 'No applicants yet'}
                        onReset={
                            applications.length
                                ? () => {
                                      setFilter('all');
                                      setQuery('');
                                  }
                                : undefined
                        }
                    >
                        {applications.length ? 'Try a different name, job, skill or filter.' : 'Share your job posts; applicants show up here ranked by skill match.'}
                    </NoResults>
                </section>
            ) : (
                <div className="space-y-4">
                    {visible.map((a) => (
                        <CandidateCard key={a.id} a={a} canSchedule={canSchedule} onDecline={decline} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
