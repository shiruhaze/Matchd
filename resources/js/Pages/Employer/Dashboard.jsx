import { Link } from '@inertiajs/react';
import { Briefcase, CalendarCheck, Clock, Users } from 'lucide-react';
import { Card, EmptyState, PageTitle, StatCard, StatusBadge } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { initials } from '../../lib/utils';

export default function Dashboard({ stats, jobs, recent }) {
    return (
        <AppLayout title="Employer Dashboard">
            <PageTitle
                title="Dashboard Overview"
                subtitle="Welcome back! Here is a summary of your active job listings and candidate pipelines."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Briefcase} label="Active Job Posts" value={stats.active_jobs} />
                <StatCard icon={Users} label="Total Applicants" value={stats.applicants} />
                <StatCard icon={Clock} label="Pending Review" value={stats.pending} tone="amber" />
                <StatCard icon={CalendarCheck} label="Interviews Set" value={stats.interviews} tone="success" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm">Active Job Listings</h3>
                        <Link href="/employer/jobs" className="text-xs text-brand font-semibold hover:underline">
                            View All Jobs &rarr;
                        </Link>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="p-6">
                            <EmptyState icon={Briefcase} title="No jobs yet">
                                <Link href="/employer/jobs/create" className="text-brand font-semibold hover:underline">
                                    Create your first job
                                </Link>
                            </EmptyState>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {jobs.map((job) => (
                                <div key={job.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                                            <StatusBadge status={job.status} />
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            Posted {job.posted} &bull; {job.applicants} Applicants
                                        </p>
                                    </div>
                                    <Link
                                        href={`/employer/jobs/${job.id}/edit`}
                                        className="text-xs text-slate-600 hover:text-slate-900 font-medium bg-slate-100 px-3 py-1.5 rounded-lg transition"
                                    >
                                        Manage
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="p-6 space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Recent Applications</h3>
                    {recent.length === 0 && <p className="text-xs text-slate-500">No applications yet.</p>}
                    <div className="space-y-4">
                        {recent.map((item) => (
                            <div key={item.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                                    {initials(item.applicant)}
                                </div>
                                <div className="text-xs">
                                    <p className="text-slate-800">
                                        <span className="font-bold text-slate-900">{item.applicant}</span> applied for{' '}
                                        <span className="font-semibold text-brand">{item.job}</span>
                                    </p>
                                    <p className="text-slate-400 mt-0.5">{item.when}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
