import { router, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { Card, PageTitle } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { can, initials } from '../../lib/utils';

export default function Users({ users }) {
    const { auth } = usePage().props;

    const changeRole = (user, role) => router.patch(`/admin/users/${user.id}/role`, { role }, { preserveScroll: true });

    const destroy = (user) => {
        if (window.confirm(`Delete ${user.name}? All of their data will be removed.`)) {
            router.delete(`/admin/users/${user.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Users & Roles">
            <PageTitle title="Users & Roles" subtitle="Manage who can post jobs, apply, and administer Matchd." />

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                        <thead className="bg-slate-50/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="py-3.5 px-6">User</th>
                                <th className="py-3.5 px-4">Company</th>
                                <th className="py-3.5 px-4">Role</th>
                                <th className="py-3.5 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {users.map((user) => {
                                const isSelf = user.id === auth.user.id;

                                return (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                                                    {initials(user.name)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-xs text-slate-600">{user.company_name ?? '—'}</td>
                                        <td className="py-4 px-4">
                                            <select
                                                value={user.role ?? ''}
                                                disabled={isSelf || !can(auth.user, 'users.manage')}
                                                onChange={(e) => changeRole(user, e.target.value)}
                                                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand disabled:opacity-60"
                                            >
                                                <option value="Applicant">Applicant</option>
                                                <option value="Employer">Employer</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {!isSelf && can(auth.user, 'users.manage') && (
                                                <button
                                                    type="button"
                                                    onClick={() => destroy(user)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AppLayout>
    );
}
