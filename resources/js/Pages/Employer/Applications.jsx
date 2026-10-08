import { Link, router } from '@inertiajs/react';
import { CalendarCheck, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import { Card, EmptyState, PageTitle, SkillChip, StatCard, StatusBadge, Tabs } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { can, initials } from '../../lib/utils';
import { usePage } from '@inertiajs/react';

export default function Applications({ applications, stats }) {
    const { auth } = usePage().props;
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const visible = applications.filter((a) => {
        const q = query.trim().toLowerCase().replace(/^#/, '');
        const matchesQuery =
            !q || a.applicant.toLowerCase().includes(q) || a.job.toLowerCase().includes(q) || a.matched_skills.some((s) => s.includes(q));
        const matchesFilter = filter === 'all' || a.status === filter;
        return matchesQuery && matchesFilter;
    });

    const decline = (application) => {
        if (window.confirm(`Decline ${application.applicant}?`)) {
            router.patch(`/employer/applications/${application.id}/decline`, {}, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Approve Applicants" search={{ value: query, onChange: setQuery, placeholder: 'Search applicants or tags...' }}>
            <PageTitle title="Approve Applicants" subtitle="Review candidate skill matches and progress them through your hiring pipeline.">
                <Tabs
                    value={filter}
                    onChange={setFilter}
                    tabs={[
                        { value: 'all', label: 'All' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'interview_scheduled', label: 'Interviews' },
                        { value: 'declined', label: 'Declined' },
                    ]}
                />
            </PageTitle>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={Users} label="Total Applicants" value={stats.total} />
                <StatCard icon={Clock} label="Pending Review" value={stats.pending} tone="amber" />
                <StatCard icon={CalendarCheck} label="Interviews Scheduled" value={stats.interviews} tone="success" />
            </div>

            {visible.length === 0 ? (
                <EmptyState icon={Users} title="No applicants match your filters" />
            ) : (
                <Card className="overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 text-sm">Recent Applications</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[760px]">
                            <thead className="bg-slate-50/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="py-3.5 px-6">Applicant</th>
                                    <th className="py-3.5 px-4">Applied Job</th>
                                    <th className="py-3.5 px-4">Matched Tags</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {visible.map((a) => (
                                    <tr key={a.id} className="hover:bg-slate-50/50 transition">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                                                    {initials(a.applicant)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{a.applicant}</p>
                                                    <p className="text-xs text-slate-400">{a.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 font-medium text-xs">
                                            {a.job}
                                            <span className="block text-[11px] text-emerald-600 font-bold">{a.match}% match</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {a.matched_skills.length === 0 && <span className="text-xs text-slate-400">No matches</span>}
                                                {a.matched_skills.map((s) => (
                                                    <SkillChip key={s} solid>
                                                        #{s}
                                                    </SkillChip>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <StatusBadge status={a.status} />
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                                            {a.status === 'pending' || a.status === 'under_review' ? (
                                                <>
                                                    {can(auth.user, 'interviews.schedule') && (
                                                        <Link
                                                            href={`/employer/interviews?application=${a.id}`}
                                                            className="bg-brand hover:bg-brand-dark text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition inline-block"
                                                        >
                                                            Approve & Set Interview
                                                        </Link>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => decline(a)}
                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-3 py-1.5 rounded-lg text-xs transition"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            ) : (
                                                <Link
                                                    href="/employer/interviews"
                                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs transition inline-block"
                                                >
                                                    View Schedule
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </AppLayout>
    );
}
