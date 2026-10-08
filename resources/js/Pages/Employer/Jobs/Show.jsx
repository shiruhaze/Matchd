import { Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { Card, PageTitle, SkillChip, StatusBadge } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { salaryRange } from '../../../lib/utils';

export default function Show({ job }) {
    return (
        <AppLayout title={job.title} width="max-w-5xl">
            <PageTitle title={job.title} subtitle={`${job.location ?? 'Location TBD'} • ${salaryRange(job.salary_min, job.salary_max)} / mo • Posted ${job.posted}`}>
                <div className="flex items-center gap-3">
                    <StatusBadge status={job.status} />
                    <Link
                        href={`/employer/jobs/${job.id}/edit`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                    >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                    </Link>
                </div>
            </PageTitle>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 space-y-5">
                    <div className="flex flex-wrap gap-1.5">
                        {job.skills.map((s) => (
                            <SkillChip key={s} solid>
                                #{s}
                            </SkillChip>
                        ))}
                    </div>
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">Description</h3>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{job.description || 'No description provided.'}</p>
                    </section>
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">Requirements</h3>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{job.requirements || 'No requirements listed.'}</p>
                    </section>
                </Card>

                <Card className="p-6 space-y-3 h-fit">
                    <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Applicants ({job.applicants.length})</h3>
                    {job.applicants.length === 0 && <p className="text-xs text-slate-500">No applicants yet.</p>}
                    {job.applicants.map((a) => (
                        <div key={a.id} className="flex items-center justify-between gap-2 text-xs">
                            <div>
                                <p className="font-bold text-slate-900">{a.name}</p>
                                <p className="text-slate-400">{a.email}</p>
                            </div>
                            <StatusBadge status={a.status} />
                        </div>
                    ))}
                    <Link href="/employer/applications" className="block text-xs font-semibold text-brand hover:underline pt-2">
                        Review all applicants &rarr;
                    </Link>
                </Card>
            </div>
        </AppLayout>
    );
}
