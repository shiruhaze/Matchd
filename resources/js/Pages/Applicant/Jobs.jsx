import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Calendar, Check, SearchX, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, Card, CompanyAvatar, EmptyState, SkillChip, StatusBadge } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { can, SETUP_LABELS, salaryRange } from '../../lib/utils';

function JobCard({ job, applied, canApply }) {
    const apply = () => router.post(`/applicant/jobs/${job.id}/apply`, {}, { preserveScroll: true });

    return (
        <Card className="p-5 hover:border-brand/40 transition space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                    <CompanyAvatar name={job.company} />
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                        <p className="text-xs text-slate-500">
                            {job.company} &bull; {job.location ?? 'Location TBD'} ({SETUP_LABELS[job.work_setup] ?? job.work_setup})
                        </p>
                    </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                    {job.match}% Match
                </span>
            </div>

            {job.description && <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>}

            <div className="flex flex-wrap gap-1.5 pt-1">
                {job.skills.map((skill) => (
                    <SkillChip key={skill}>#{skill}</SkillChip>
                ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">
                    {salaryRange(job.salary_min, job.salary_max)} <span className="text-[10px] text-slate-400 font-normal">/ month</span>
                </span>
                {applied ? (
                    <span className="text-success font-semibold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Applied
                    </span>
                ) : (
                    canApply && (
                        <Button onClick={apply}>
                            Apply Now <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    )
                )}
            </div>
        </Card>
    );
}

export default function Jobs({ jobs, filters, appliedJobIds, activeApplications, matchedCount, profileCompletion }) {
    const { auth } = usePage().props;
    const [query, setQuery] = useState(filters.q ?? '');
    const first = useRef(true);

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

    return (
        <AppLayout title="Explore Jobs" search={{ value: query, onChange: setQuery, placeholder: 'Search roles, skill tags, or companies...' }}>
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand/90 p-6 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold tracking-tight">Welcome back, {auth.user.name.split(' ')[0]}!</h1>
                    <p className="text-xs text-slate-300">
                        We found <span className="font-bold text-white">{matchedCount} job matches</span> based on your skill tags.
                    </p>
                </div>
                <Link href="/applicant/profile" className="bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm text-center">
                    Update Profile Skills
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand" /> Recommended for You
                        </h2>
                        <span className="text-xs text-slate-500">Sorted by match score</span>
                    </div>

                    {jobs.length === 0 ? (
                        <EmptyState icon={SearchX} title="No jobs found">
                            Try a different search term, or add more skills to your profile.
                        </EmptyState>
                    ) : (
                        jobs.map((job) => (
                            <JobCard key={job.id} job={job} applied={appliedJobIds.includes(job.id)} canApply={can(auth.user, 'applications.apply')} />
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-sm">Profile Match Index</h3>
                            <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">{profileCompletion.percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-brand h-2 rounded-full" style={{ width: `${profileCompletion.percent}%` }} />
                        </div>
                    </Card>

                    <Card className="p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-900 text-sm">Active Applications</h3>
                            <Link href="/applicant/applications" className="text-xs font-semibold text-brand hover:underline">
                                View All
                            </Link>
                        </div>

                        {activeApplications.length === 0 && <p className="text-xs text-slate-500">You haven&apos;t applied to any jobs yet.</p>}

                        <div className="space-y-3">
                            {activeApplications.map((app) => (
                                <div key={app.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-slate-900">{app.title}</span>
                                        <StatusBadge status={app.status} />
                                    </div>
                                    <p className="text-xs text-slate-500">{app.company}</p>
                                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center gap-1">
                                        {app.interview_at ? (
                                            <>
                                                <Calendar className="w-3 h-3 text-brand" /> {app.interview_at}
                                            </>
                                        ) : (
                                            <>Applied {app.applied_at}</>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
