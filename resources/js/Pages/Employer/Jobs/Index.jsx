import { Link, router } from '@inertiajs/react';
import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Card, EmptyState, PageTitle, SkillChip, StatusBadge } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { salaryRange } from '../../../lib/utils';

export default function Index({ jobs }) {
    const [query, setQuery] = useState('');

    const visible = jobs.filter((job) => {
        const q = query.trim().toLowerCase().replace(/^#/, '');
        return !q || job.title.toLowerCase().includes(q) || job.skills.some((s) => s.includes(q));
    });

    const destroy = (job) => {
        if (window.confirm(`Delete "${job.title}"? Applications for it will be removed too.`)) {
            router.delete(`/employer/jobs/${job.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="My Jobs" search={{ value: query, onChange: setQuery, placeholder: 'Search your jobs or tags...' }}>
            <PageTitle title="My Job Posts" subtitle="Create, edit and close your job listings.">
                <Link
                    href="/employer/jobs/create"
                    className="bg-brand hover:bg-brand-dark text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 self-start"
                >
                    <Plus className="w-4 h-4" /> New Job
                </Link>
            </PageTitle>

            {visible.length === 0 ? (
                <EmptyState icon={Briefcase} title="No job posts found">
                    Create a job and tag the skills you need to start matching candidates.
                </EmptyState>
            ) : (
                <div className="space-y-4">
                    {visible.map((job) => (
                        <Card key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Link href={`/employer/jobs/${job.id}`} className="font-bold text-slate-900 hover:text-brand transition">
                                        {job.title}
                                    </Link>
                                    <StatusBadge status={job.status} />
                                </div>
                                <p className="text-xs text-slate-500">
                                    {job.location ?? 'Location TBD'} &bull; {salaryRange(job.salary_min, job.salary_max)} / mo &bull; {job.applicants} applicants &bull; Posted{' '}
                                    {job.posted}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {job.skills.map((s) => (
                                        <SkillChip key={s}>#{s}</SkillChip>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    href={`/employer/jobs/${job.id}/edit`}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => destroy(job)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
