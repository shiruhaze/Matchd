import { Link } from '@inertiajs/react';
import { Briefcase, Calendar, Clock, Eye, Send, Video } from 'lucide-react';
import { useState } from 'react';
import { Card, CompanyAvatar, EmptyState, PageTitle, StatCard, StatusBadge, Tabs } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { salaryRange } from '../../lib/utils';

export default function Applications({ applications, stats }) {
    const [tab, setTab] = useState('all');

    const visible = applications.filter((a) => {
        if (tab === 'active') return a.status !== 'declined';
        if (tab === 'interviews') return a.status === 'interview_scheduled';
        return true;
    });

    return (
        <AppLayout title="My Applications" width="max-w-6xl">
            <PageTitle title="Track Applications" subtitle="Real-time status updates and upcoming interview schedules.">
                <Tabs
                    value={tab}
                    onChange={setTab}
                    tabs={[
                        { value: 'all', label: `All (${applications.length})` },
                        { value: 'active', label: 'Active' },
                        { value: 'interviews', label: 'Interviews' },
                    ]}
                />
            </PageTitle>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={Send} label="Applied Jobs" value={stats.applied} />
                <StatCard icon={Eye} label="Under Review" value={stats.under_review} tone="amber" />
                <StatCard icon={Calendar} label="Interviews" value={stats.interviews} tone="success" />
            </div>

            <div className="space-y-4">
                {visible.length === 0 && (
                    <EmptyState icon={Briefcase} title="Nothing here yet">
                        <Link href="/applicant/jobs" className="text-brand font-semibold hover:underline">
                            Explore jobs
                        </Link>{' '}
                        and apply to get started.
                    </EmptyState>
                )}

                {visible.map((app) => (
                    <Card key={app.id} className={`p-6 space-y-4 ${app.status === 'interview_scheduled' ? 'border-l-4 border-l-success' : ''}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <CompanyAvatar name={app.company} size="w-12 h-12" />
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-bold text-slate-900 text-base">{app.title}</h3>
                                        <StatusBadge status={app.status} />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {app.company} &bull; {app.location ?? 'Location TBD'} &bull; Applied {app.applied_at}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-semibold text-slate-700 block">{salaryRange(app.salary_min, app.salary_max)} / mo</span>
                                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                    {app.match}% Match
                                </span>
                            </div>
                        </div>

                        {app.interview && (
                            <div className="bg-success/5 border border-success/20 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <Clock className="w-4 h-4 text-success" />
                                    <span className="text-xs font-medium text-slate-800">
                                        Interview: <strong className="text-success">{app.interview.at}</strong>
                                    </span>
                                </div>
                                {app.interview.link && (
                                    <a
                                        href={app.interview.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-success hover:bg-success-dark text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5"
                                    >
                                        <Video className="w-3.5 h-3.5" /> Join Room
                                    </a>
                                )}
                            </div>
                        )}

                        {app.status === 'under_review' && app.viewed_at && (
                            <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">Recruiter viewed profile {app.viewed_at}</div>
                        )}
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}
