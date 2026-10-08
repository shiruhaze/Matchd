import { router } from '@inertiajs/react';
import { Ban, Trash2 } from 'lucide-react';
import { Card, PageTitle, StatusBadge } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';

export default function Jobs({ jobs }) {
    const close = (job) => router.patch(`/admin/jobs/${job.id}/close`, {}, { preserveScroll: true });

    const destroy = (job) => {
        if (window.confirm(`Delete "${job.title}"?`)) {
            router.delete(`/admin/jobs/${job.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Job Moderation">
            <PageTitle title="Job Moderation" subtitle="Close or remove job posts across all employers." />

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                        <thead className="bg-slate-50/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="py-3.5 px-6">Job</th>
                                <th className="py-3.5 px-4">Company</th>
                                <th className="py-3.5 px-4">Applicants</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {jobs.map((job) => (
                                <tr key={job.id} className="hover:bg-slate-50/50 transition">
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-slate-900 text-sm">{job.title}</p>
                                        <p className="text-xs text-slate-400">Posted {job.posted}</p>
                                    </td>
                                    <td className="py-4 px-4 text-xs text-slate-600">{job.company}</td>
                                    <td className="py-4 px-4 text-xs text-slate-600">{job.applicants}</td>
                                    <td className="py-4 px-4">
                                        <StatusBadge status={job.status} />
                                    </td>
                                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                                        {job.status !== 'closed' && (
                                            <button
                                                type="button"
                                                onClick={() => close(job)}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                                            >
                                                <Ban className="w-3.5 h-3.5" /> Close
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => destroy(job)}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AppLayout>
    );
}
