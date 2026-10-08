import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Briefcase,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    Compass,
    LayoutDashboard,
    ListChecks,
    LogOut,
    Plus,
    PlusCircle,
    Search,
    ShieldCheck,
    User,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { can, hasRole, initials } from '../lib/utils';

function navFor(user, badges) {
    if (hasRole(user, 'Admin')) {
        return [
            { href: '/admin/users', label: 'Users & Roles', icon: Users },
            { href: '/admin/jobs', label: 'Job Moderation', icon: ShieldCheck },
        ];
    }

    if (hasRole(user, 'Employer')) {
        return [
            { href: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/employer/jobs', label: 'My Jobs', icon: Briefcase },
            { href: '/employer/jobs/create', label: 'Create a Job', icon: PlusCircle, show: can(user, 'jobs.create') },
            { href: '/employer/applications', label: 'Approve Applicants', icon: ListChecks, badge: badges.pending || null },
            { href: '/employer/interviews', label: 'Set Interview', icon: Calendar, show: can(user, 'interviews.schedule') },
        ];
    }

    return [
        { href: '/applicant/jobs', label: 'Explore Jobs', icon: Compass },
        { href: '/applicant/applications', label: 'My Applications', icon: Briefcase, badge: badges.applications || null },
        { href: '/applicant/interviews', label: 'Interviews', icon: CalendarCheck, badge: badges.interviews ? `${badges.interviews} New` : null, green: true },
        { href: '/applicant/profile', label: 'My Profile & Skills', icon: User },
    ];
}

function Flash({ flash }) {
    const [dismissed, setDismissed] = useState(null);
    const message = flash.success || flash.error || flash.status;

    useEffect(() => {
        setDismissed(null);
        if (!message) return undefined;
        const timer = setTimeout(() => setDismissed(message), 4000);
        return () => clearTimeout(timer);
    }, [message]);

    if (!message || dismissed === message) return null;

    const isError = Boolean(flash.error);

    return (
        <div
            role="status"
            className={`flex items-center gap-2 text-xs font-medium px-4 py-3 rounded-xl border ${
                isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
        >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="flex-1">{message}</span>
            <button type="button" onClick={() => setDismissed(message)} aria-label="Dismiss">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

/**
 * Shared shell: dark sidebar + sticky top bar. Props:
 * - title: browser tab title
 * - search: { value, onChange, placeholder } (optional)
 * - width: tailwind max-w class for the content area
 */
export default function AppLayout({ title, search, width = 'max-w-7xl', children }) {
    const page = usePage();
    const { auth, badges = {}, flash = {} } = page.props;
    const user = auth.user;
    const items = navFor(user, badges).filter((item) => item.show !== false);
    const role = user.roles[0] ?? 'User';

    // Longest matching href wins so /employer/jobs/create doesn't also light up /employer/jobs.
    const path = page.url.split('?')[0];
    const active = items
        .filter((item) => path === item.href || path.startsWith(`${item.href}/`))
        .sort((a, b) => b.href.length - a.href.length)[0];

    return (
        <div className="bg-blue-50/50 text-slate-800 min-h-screen flex">
            <Head title={title} />

            <aside className="w-64 bg-slate-900 text-white min-h-screen p-5 hidden md:flex flex-col justify-between border-r border-slate-800 shrink-0">
                <div className="space-y-8">
                    <div className="px-2 pt-2 flex items-center gap-3">
                        <img src="/images/matchd-logo-white.png" alt="Matchd" className="h-6 w-auto" />
                        <span className="text-[10px] bg-brand/20 text-brand border border-brand/30 px-2 py-0.5 rounded-full font-semibold ml-auto">
                            {role}
                        </span>
                    </div>

                    <nav className="space-y-1.5">
                        {items.map((item) => {
                            const isActive = active?.href === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition text-sm ${
                                        isActive
                                            ? 'bg-brand text-white font-semibold shadow-lg shadow-brand/20'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                    {item.badge && (
                                        <span
                                            className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                item.green ? 'bg-success text-white' : isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                                            }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="space-y-2">
                    <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-800/80 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                            {initials(user.name)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-slate-200 truncate">{user.company_name ?? user.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium px-3 py-2 rounded-xl transition text-sm"
                    >
                        <LogOut className="w-4 h-4" /> Sign out
                    </Link>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
                    {search ? (
                        <div className="relative w-full max-w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search.value}
                                onChange={(e) => search.onChange(e.target.value)}
                                placeholder={search.placeholder}
                                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 border border-transparent rounded-lg focus:outline-none focus:border-brand focus:bg-white transition"
                            />
                        </div>
                    ) : (
                        <span className="text-sm font-semibold text-slate-500 md:hidden">Matchd</span>
                    )}

                    <div className="flex items-center gap-3 ml-auto">
                        <button type="button" className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition" aria-label="Notifications">
                            <Bell className="w-4 h-4" />
                            <span className="w-2 h-2 bg-brand rounded-full absolute top-1.5 right-1.5 border-2 border-white" />
                        </button>
                        {can(user, 'jobs.create') && (
                            <Link
                                href="/employer/jobs/create"
                                className="bg-brand hover:bg-brand-dark text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Create a Job
                            </Link>
                        )}
                        <Link href="/logout" method="post" as="button" className="md:hidden p-2 text-slate-500" aria-label="Sign out">
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </header>

                <nav className="md:hidden flex gap-2 overflow-x-auto px-4 py-2 bg-slate-900">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-lg ${
                                active?.href === item.href ? 'bg-brand text-white font-semibold' : 'text-slate-300'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className={`p-4 md:p-8 space-y-6 ${width} w-full mx-auto`}>
                    <Flash flash={flash} />
                    {children}
                </div>
            </main>
        </div>
    );
}
