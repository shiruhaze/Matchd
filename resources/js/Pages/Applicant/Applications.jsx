import { Link } from '@inertiajs/react';
import { Briefcase, Calendar, Check, Clock, Compass, Eye, MapPin, Send, Video, X } from 'lucide-react';
import { useState } from 'react';
import { FilterTabs, StatTile } from '../../Components/DataView';
import { HeaderAction } from '../../Components/PageHeader';
import { CompanyAvatar, EmptyState, StatusBadge } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { salaryRange } from '../../lib/utils';

const FILTERS = {
    all: () => true,
    active: (a) => a.status !== 'declined',
    interviews: (a) => a.status === 'interview_scheduled',
};

const STEPS = ['Applied', 'In review', 'Interview'];

/** How far along the hiring steps an application is (0-2), or -1 when declined. */
const stepFor = (status) => ({ pending: 0, under_review: 1, interview_scheduled: 2 })[status] ?? -1;

/** Small Applied → In review → Interview tracker. */
function Progress({ status }) {
    const step = stepFor(status);

    if (step < 0) {
        return (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <X className="h-3.5 w-3.5" />
                Not moving forward
            </p>
        );
    }

    return (
        <ol className="flex items-center gap-2" aria-label={`Progress: ${STEPS[step]}`}>
            {STEPS.map((label, i) => (
                <li key={label} className="flex items-center gap-2">
                    {i > 0 && <span className={`h-0.5 w-6 rounded-full sm:w-10 ${i <= step ? 'bg-brand' : 'bg-slate-200'}`} />}
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${i <= step ? 'text-slate-800' : 'text-slate-400'}`}>
                        <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                i < step ? 'bg-brand text-white' : i === step ? 'bg-brand/15 ring-2 ring-brand' : 'bg-slate-100 ring-1 ring-slate-200'
                            }`}
                        >
                            {i < step && <Check className="h-2.5 w-2.5" />}
                        </span>
                        {label}
                    </span>
                </li>
            ))}
        </ol>
    );
}

export default function Applications({ applications, stats }) {
    const [tab, setTab] = useState('all');
    const visible = applications.filter(FILTERS[tab]);
    const total = stats.applied || 1;

    return (
        <AppLayout
            title="My Applications"
            width="max-w-none"
            header={{
                eyebrow: 'Applicant · Applications',
                eyebrowIcon: Send,
                title: 'Track Applications',
                subtitle: stats.applied
                    ? `You've applied to ${stats.applied} ${stats.applied === 1 ? 'job' : 'jobs'}, with ${stats.interviews} ${stats.interviews === 1 ? 'interview' : 'interviews'} scheduled.`
                    : 'You have not applied to any jobs yet. Your applications and their status will show up here.',
                actions: (
                    <HeaderAction href="/applicant/jobs" icon={Compass}>
                        Find more jobs
                    </HeaderAction>
                ),
            }}
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatTile icon={Send} label="Applied jobs" value={stats.applied} hint="Applications you've sent" tone="brand" />
                <StatTile icon={Eye} label="Under review" value={stats.under_review} share={stats.under_review / total} tone="amber" />
                <StatTile icon={Calendar} label="Interviews" value={stats.interviews} share={stats.interviews / total} tone="success" />
            </div>

            <FilterTabs
                label="Filter applications"
                value={tab}
                onChange={setTab}
                tabs={[
                    { value: 'all', label: 'All', count: applications.length },
                    { value: 'active', label: 'Active', count: applications.filter(FILTERS.active).length },
                    { value: 'interviews', label: 'Interviews', count: applications.filter(FILTERS.interviews).length },
                ]}
            />

            <div className="space-y-4">
                {visible.length === 0 && (
                    <EmptyState icon={Briefcase} title="Nothing here yet">
                        <Link href="/applicant/jobs" className="font-semibold text-brand hover:underline">
                            Explore jobs
                        </Link>{' '}
                        and apply to get started.
                    </EmptyState>
                )}

                {visible.map((app) => (
                    <article
                        key={app.id}
                        className={`space-y-4 rounded-3xl border border-white/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60 transition duration-300 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6 ${
                            app.status === 'declined' ? 'opacity-75' : ''
                        }`}
                    >
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                                <CompanyAvatar name={app.company} size="w-12 h-12" />
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base font-bold text-slate-900">{app.title}</h3>
                                        <StatusBadge status={app.status} />
                                    </div>
                                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                                        <span>{app.company}</span>
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {app.location ?? 'Location TBD'}
                                        </span>
                                        <span>Applied {app.applied_at}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1">
                                <span className="text-sm font-semibold text-slate-700">{salaryRange(app.salary_min, app.salary_max)} / mo</span>
                                <span className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">{app.match}% match</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <Progress status={app.status} />
                            {app.status === 'under_review' && app.viewed_at && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                    <Eye className="h-3.5 w-3.5" />
                                    Recruiter viewed your profile {app.viewed_at}
                                </span>
                            )}
                        </div>

                        {app.interview && (
                            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-success/20 bg-success/5 p-3.5 sm:flex-row sm:items-center">
                                <span className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-800">
                                    <Clock className="h-4 w-4 text-success" />
                                    Interview: <strong className="text-success">{app.interview.at}</strong>
                                </span>
                                {app.interview.link && (
                                    <a
                                        href={app.interview.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-success px-4 py-2 text-xs font-semibold text-white transition hover:bg-success-dark"
                                    >
                                        <Video className="h-3.5 w-3.5" />
                                        Join room
                                    </a>
                                )}
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </AppLayout>
    );
}
