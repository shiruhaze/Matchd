import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDownWideNarrow,
    ArrowRight,
    BadgeDollarSign,
    Briefcase,
    Calendar,
    Check,
    CircleCheck,
    Clock,
    Compass,
    Laptop,
    Loader2,
    MapPin,
    Sparkles,
    Target,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScoreRing } from '../../Components/Brand';
import { FilterTabs, NoResults } from '../../Components/DataView';
import { HeaderAction } from '../../Components/PageHeader';
import { FieldSelect } from '../../Components/Popover';
import { CompanyAvatar, StatusBadge } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { can, SETUP_LABELS, salaryRange } from '../../lib/utils';

const panel = 'rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60';

const SETUP_TABS = [
    { value: 'all', label: 'All' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
];

const SORTS = [
    { value: 'match', label: 'Best match', description: 'Highest skill match first', icon: Target },
    { value: 'salary', label: 'Highest salary', description: 'Top of the pay range first', icon: BadgeDollarSign },
    { value: 'newest', label: 'Newest', description: 'Most recently posted first', icon: Clock },
];

const TYPE_LABELS = { 'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract', internship: 'Internship' };

const matchLabel = (m) => (m >= 75 ? { text: 'Strong match', cls: 'text-emerald-600' } : m >= 40 ? { text: 'Good match', cls: 'text-amber-600' } : { text: 'Low match', cls: 'text-slate-400' });

function JobCard({ job, applied, canApply, mySkills }) {
    const [applying, setApplying] = useState(false);
    const have = job.skills.filter((s) => mySkills.has(s)).length;
    const label = matchLabel(job.match);

    const apply = () =>
        router.post(`/applicant/jobs/${job.id}/apply`, {}, { preserveScroll: true, onStart: () => setApplying(true), onFinish: () => setApplying(false) });

    return (
        <article className={`${panel} group space-y-4 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/5 sm:p-6`}>
            <div className="flex items-start gap-4">
                <CompanyAvatar name={job.company} size="w-12 h-12" />
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 transition group-hover:text-brand">{job.title}</h3>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">{job.company}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-600">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {job.location ?? 'Location TBD'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5">
                            <Laptop className="h-3 w-3 text-slate-400" />
                            {SETUP_LABELS[job.work_setup] ?? job.work_setup}
                        </span>
                        {job.employment_type && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5">
                                <Briefcase className="h-3 w-3 text-slate-400" />
                                {TYPE_LABELS[job.employment_type] ?? job.employment_type}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1">
                    <ScoreRing value={job.match} />
                    <span className={`text-[10px] font-semibold ${label.cls}`}>{label.text}</span>
                </div>
            </div>

            {job.description && <p className="line-clamp-2 text-sm text-slate-600">{job.description}</p>}

            {job.skills.length > 0 && (
                <div>
                    <p className="mb-2 text-[11px] font-semibold text-slate-500">
                        You have <span className="text-slate-900">{have}</span> of {job.skills.length} skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {job.skills.map((skill) => {
                            const ok = mySkills.has(skill);
                            return (
                                <span
                                    key={skill}
                                    title={ok ? 'On your profile' : 'Not on your profile yet'}
                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                                        ok ? 'border-success/25 bg-success/5 text-success' : 'border-slate-200 bg-white text-slate-500'
                                    }`}
                                >
                                    {ok && <Check className="h-3 w-3" />}#{skill}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div>
                    <p className="text-sm font-bold text-slate-900">
                        {salaryRange(job.salary_min, job.salary_max)} <span className="text-xs font-normal text-slate-400">/ month</span>
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        Posted {job.posted}
                    </p>
                </div>
                {applied ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-success/10 px-3.5 py-2 text-xs font-semibold text-success">
                        <CircleCheck className="h-4 w-4" />
                        Applied
                    </span>
                ) : (
                    canApply && (
                        <button
                            type="button"
                            onClick={apply}
                            disabled={applying}
                            className="group/btn inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-brand to-brand-dark px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand/25 transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-70"
                        >
                            {applying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            {applying ? 'Applying…' : 'Apply now'}
                            {!applying && <ArrowRight className="h-3.5 w-3.5 transition group-hover/btn:translate-x-0.5" />}
                        </button>
                    )
                )}
            </div>
        </article>
    );
}

function ProfileRing({ value }) {
    const r = 30;
    const c = 2 * Math.PI * r;
    return (
        <span className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90">
                <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" className="stroke-slate-100" />
                <circle
                    cx="36"
                    cy="36"
                    r={r}
                    fill="none"
                    strokeWidth="7"
                    strokeLinecap="round"
                    className="stroke-brand transition-[stroke-dashoffset] duration-700"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - value / 100)}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-slate-900">{value}%</span>
        </span>
    );
}

export default function Jobs({ jobs, filters, appliedJobIds, activeApplications, matchedCount, profileCompletion, mySkills: mySkillList = [] }) {
    const { auth } = usePage().props;
    const canApply = can(auth.user, 'applications.apply');
    const [query, setQuery] = useState(filters.q ?? '');
    const [setup, setSetup] = useState('all');
    const [sort, setSort] = useState('match');
    const first = useRef(true);
    const mySkills = useMemo(() => new Set(mySkillList), [mySkillList]);

    // Debounced server-side search (roles, skill tags, companies).
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return undefined;
        }
        const timer = setTimeout(() => {
            router.get('/applicant/jobs', query ? { q: query } : {}, { preserveState: true, replace: true, only: ['jobs', 'filters', 'matchedCount'] });
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const setupCounts = useMemo(
        () => Object.fromEntries(SETUP_TABS.map((t) => [t.value, t.value === 'all' ? jobs.length : jobs.filter((j) => j.work_setup === t.value).length])),
        [jobs],
    );

    const visible = useMemo(() => {
        const list = jobs.filter((j) => setup === 'all' || j.work_setup === setup);
        if (sort === 'salary') return [...list].sort((a, b) => (b.salary_max ?? b.salary_min ?? 0) - (a.salary_max ?? a.salary_min ?? 0));
        if (sort === 'newest') return [...list].sort((a, b) => b.posted_at - a.posted_at);
        return list; // server order is best match first
    }, [jobs, setup, sort]);

    return (
        <AppLayout
            title="Explore Jobs"
            search={{ value: query, onChange: setQuery, placeholder: 'Search roles, skills or companies' }}
            header={{
                eyebrow: 'Applicant · Explore',
                eyebrowIcon: Compass,
                title: `Welcome back, ${auth.user.name.split(' ')[0]}!`,
                subtitle: (
                    <>
                        We found{' '}
                        <span className="font-semibold text-white">
                            {matchedCount} job {matchedCount === 1 ? 'match' : 'matches'}
                        </span>{' '}
                        based on your skill tags.
                    </>
                ),
                actions: (
                    <HeaderAction href="/applicant/profile" icon={Sparkles} variant="ghost">
                        Update skills
                    </HeaderAction>
                ),
            }}
        >
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <FilterTabs label="Work setup" value={setup} onChange={setSetup} tabs={SETUP_TABS.map((t) => ({ ...t, count: setupCounts[t.value] }))} />
                        <div className="flex items-center gap-2 sm:w-56">
                            <ArrowDownWideNarrow className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                            <FieldSelect label="Sort jobs" options={SORTS} value={sort} onChange={setSort} />
                        </div>
                    </div>

                    {visible.length === 0 ? (
                        <section className={panel}>
                            <NoResults
                                title="No jobs found"
                                onReset={
                                    setup !== 'all' || query
                                        ? () => {
                                              setSetup('all');
                                              setQuery('');
                                          }
                                        : undefined
                                }
                            >
                                Try a different search term or work setup, or add more skills to your profile.
                            </NoResults>
                        </section>
                    ) : (
                        visible.map((job) => <JobCard key={job.id} job={job} applied={appliedJobIds.includes(job.id)} canApply={canApply} mySkills={mySkills} />)
                    )}
                </div>

                <aside className="space-y-6 lg:sticky lg:top-6">
                    <section className={`${panel} p-5`}>
                        <div className="flex items-center gap-4">
                            <ProfileRing value={profileCompletion.percent} />
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Profile Match Index</h3>
                                <p className="mt-1 text-xs text-slate-500">A complete profile ranks you higher with employers.</p>
                                <Link href="/applicant/profile" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                                    Improve it
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className={`${panel} p-5`}>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-bold text-slate-900">Active applications</h3>
                            <Link href="/applicant/applications" className="text-xs font-semibold text-brand hover:underline">
                                View all
                            </Link>
                        </div>

                        {activeApplications.length === 0 && <p className="pt-4 text-xs text-slate-500">You haven&apos;t applied to any jobs yet.</p>}

                        <div className="space-y-2.5 pt-4">
                            {activeApplications.map((app) => (
                                <Link
                                    key={app.id}
                                    href="/applicant/applications"
                                    className="block space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-slate-900">{app.title}</p>
                                            <p className="truncate text-[11px] text-slate-500">{app.company}</p>
                                        </div>
                                        <StatusBadge status={app.status} />
                                    </div>
                                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                                        {app.interview_at ? (
                                            <>
                                                <Calendar className="h-3 w-3 text-brand" />
                                                Interview {app.interview_at}
                                            </>
                                        ) : (
                                            <>Applied {app.applied_at}</>
                                        )}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </AppLayout>
    );
}
