import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    Briefcase,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    ChevronRight,
    Compass,
    Home,
    LayoutDashboard,
    ListChecks,
    LogOut,
    Menu as MenuIcon,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    PlusCircle,
    Search,
    ShieldCheck,
    User,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { BRAND_IMAGES, BrandMark } from '../Components/Brand';
import PageHeader from '../Components/PageHeader';
import { Menu, MenuDivider, MenuHeader, MenuItem } from '../Components/Popover';
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

/** Role accent: `chip` on light surfaces (menus), `darkChip` on the dark sidebar. */
const ROLE_TONES = {
    Admin: {
        dot: 'bg-violet-400',
        chip: 'bg-violet-50 text-violet-700 ring-violet-200/70',
        darkChip: 'bg-violet-500/15 text-violet-200 ring-violet-400/25',
        avatar: 'from-violet-500 to-indigo-600',
    },
    Employer: {
        dot: 'bg-blue-400',
        chip: 'bg-brand/5 text-brand ring-brand/15',
        darkChip: 'bg-brand/20 text-blue-200 ring-brand/40',
        avatar: 'from-brand to-indigo-600',
    },
    Applicant: {
        dot: 'bg-lime-400',
        chip: 'bg-success/5 text-success ring-success/15',
        darkChip: 'bg-success/20 text-lime-200 ring-success/40',
        avatar: 'from-emerald-500 to-success',
    },
};

const COLLAPSE_KEY = 'matchd.sidebar.collapsed';

const readCollapsed = () => {
    try {
        return window.localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
        return false;
    }
};

function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

    useEffect(() => {
        const mq = window.matchMedia(query);
        const update = () => setMatches(mq.matches);
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, [query]);

    return matches;
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
    const Icon = isError ? XCircle : CheckCircle2;

    return (
        <div
            role="status"
            className={`flex animate-pop-in items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm motion-reduce:animate-none ${
                isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
        >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{message}</span>
            <button type="button" onClick={() => setDismissed(message)} aria-label="Dismiss" className="rounded-lg p-1 transition hover:bg-black/5">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function Avatar({ user, role, size = 'h-9 w-9 text-xs', ring = 'ring-white' }) {
    const tone = ROLE_TONES[role] ?? ROLE_TONES.Applicant;

    return (
        <span className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br font-bold text-white shadow-sm ring-2 ${ring} ${tone.avatar} ${size}`}>
            {initials(user.name)}
        </span>
    );
}

function OnlineAvatar({ user, role, size }) {
    return (
        <span className="relative shrink-0">
            <Avatar user={user} role={role} size={size} ring="ring-slate-900" />
            <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
        </span>
    );
}

/** Account card in the sidebar footer with a visible Sign out button (no dropdown). */
function AccountCard({ user, role, mini = false }) {
    const signOut = (
        <Link
            href="/logout"
            method="post"
            as="button"
            title={mini ? 'Sign out' : undefined}
            className={`group flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-red-500/15 hover:text-red-300 hover:ring-red-400/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20 ${
                mini ? 'h-10 w-10 bg-white/5' : 'w-full bg-white/[0.04] py-2'
            }`}
        >
            <LogOut className="h-4 w-4 transition group-hover:translate-x-0.5" />
            {!mini && 'Sign out'}
        </Link>
    );

    if (mini) {
        return (
            <div className="flex flex-col items-center gap-2 py-1">
                <span title={`${user.name} · ${user.email}`}>
                    <OnlineAvatar user={user} role={role} />
                </span>
                {signOut}
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-white/[0.04] p-2.5 ring-1 ring-white/10">
            <div className="flex items-center gap-3 px-0.5 pb-2.5">
                <OnlineAvatar user={user} role={role} size="h-10 w-10 text-xs" />
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{user.company_name ?? user.name}</span>
                    <span className="block truncate text-xs text-slate-400">{user.email}</span>
                </span>
            </div>
            {signOut}
        </div>
    );
}

/** Avatar dropdown in the phone top bar. */
function AccountMenu({ user, role }) {
    const tone = ROLE_TONES[role] ?? ROLE_TONES.Applicant;

    return (
        <Menu
            label="Account menu"
            align="end"
            width="w-64"
            trigger={(props) => (
                <button {...props} className="rounded-full transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20">
                    <Avatar user={user} role={role} size="h-8 w-8 text-[11px]" />
                </button>
            )}
        >
            {(close) => (
                <>
                    <MenuHeader>
                        <div className="flex items-center gap-3">
                            <Avatar user={user} role={role} size="h-10 w-10 text-sm" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                                <p className="truncate text-xs text-slate-500">{user.email}</p>
                            </div>
                        </div>
                        <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${tone.chip}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                            {role}
                        </span>
                    </MenuHeader>
                    <MenuDivider />
                    <MenuItem
                        icon={Home}
                        onClick={() => {
                            close();
                            router.visit('/dashboard');
                        }}
                    >
                        My workspace
                    </MenuItem>
                    <MenuItem
                        icon={LogOut}
                        danger
                        onClick={() => {
                            close();
                            router.post('/logout');
                        }}
                    >
                        Sign out
                    </MenuItem>
                </>
            )}
        </Menu>
    );
}

// Survives page remounts so the active highlight can glide from the previously active item.
let lastActiveIndex = null;
const ITEM_STEP = 56; // 52px row + 4px gap

/** Sliding highlight behind the active nav item. */
function ActiveIndicator({ index, mini }) {
    const [pos, setPos] = useState(lastActiveIndex ?? index);

    useLayoutEffect(() => {
        lastActiveIndex = index;
        if (pos === index) return undefined;
        let inner;
        const outer = requestAnimationFrame(() => {
            inner = requestAnimationFrame(() => setPos(index));
        });
        return () => {
            cancelAnimationFrame(outer);
            cancelAnimationFrame(inner);
        };
    }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <span
            aria-hidden="true"
            style={{ transform: `translateY(${pos * ITEM_STEP}px)` }}
            className={`pointer-events-none absolute bg-linear-to-r ${mini ? 'top-0.5 left-1/2 -ml-6 h-12 w-12 rounded-full' : 'inset-x-0 top-0 h-[52px] rounded-2xl'} from-brand to-brand-dark shadow-lg shadow-brand/30 ring-1 ring-white/15 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none`}
        >
            <span className={`absolute top-1/2 h-6 w-1 ${mini ? 'hidden' : '-left-3'} -translate-y-1/2 rounded-r-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]`} />
            <span className={`absolute inset-0 overflow-hidden ${mini ? 'rounded-full' : 'rounded-2xl'}`}>
                <span className="absolute -top-6 right-2 h-12 w-28 rounded-full bg-white/20 blur-xl" />
            </span>
        </span>
    );
}

/** Floating sidebar: collapsible on desktop, slide-in drawer on phones. */
function Sidebar({ items, active, user, role, mini, onToggleMini, drawerOpen, onCloseDrawer }) {
    const tone = ROLE_TONES[role] ?? ROLE_TONES.Applicant;
    const activeIndex = items.findIndex((item) => item.href === active?.href);

    return (
        <>
            {/* Phone drawer backdrop */}
            <div
                aria-hidden="true"
                onClick={onCloseDrawer}
                className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 p-3 transition-[transform,width] duration-300 ease-out motion-reduce:transition-none md:sticky md:top-0 md:z-30 md:h-svh md:shrink-0 md:translate-x-0 ${
                    drawerOpen ? 'translate-x-0' : '-translate-x-full'
                } ${mini ? 'md:w-[5.5rem]' : 'md:w-72'}`}
            >
                <div className="relative flex h-full flex-col rounded-3xl border border-white/5 bg-linear-to-b from-slate-900 via-slate-900 to-[#0c1533] text-slate-300 shadow-2xl shadow-slate-900/25 ring-1 ring-white/5">
                    {/* Ambient glow + dot grid (clipped separately so tooltips can still overflow the sidebar) */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_35%)] bg-[size:16px_16px]" />
                        <div className="absolute -top-20 -left-16 h-56 w-56 animate-drift rounded-full bg-brand/25 blur-3xl motion-reduce:animate-none" />
                        <div className="absolute -right-20 bottom-40 h-48 w-48 animate-drift-reverse rounded-full bg-success/15 blur-3xl motion-reduce:animate-none" />
                        <div className="absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-white/10 to-transparent" />
                    </div>

                    {/* Collapse handle on the sidebar edge (desktop) */}
                    <button
                        type="button"
                        onClick={onToggleMini}
                        aria-label={mini ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={`${mini ? 'Expand' : 'Collapse'} sidebar (Ctrl+B)`}
                        className="absolute top-1/2 -right-3 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 shadow-lg shadow-slate-900/25 transition hover:bg-brand hover:text-white md:flex"
                    >
                        {mini ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
                    </button>

                    {/* Brand */}
                    <div className={`relative flex items-center pt-5 pb-4 ${mini ? 'justify-center px-2' : 'justify-between px-5'}`}>
                        <Link href="/dashboard" aria-label="Matchd home" className="shrink-0">
                            {mini ? (
                                <span title={`${role} workspace`} className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10">
                                    <img src={BRAND_IMAGES.emblem} alt="Matchd" className="h-8 w-8" />
                                    <span className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full ring-2 ring-slate-900 ${tone.dot}`} />
                                </span>
                            ) : (
                                <BrandMark tone="light" className="w-32" />
                            )}
                        </Link>
                        <button type="button" onClick={onCloseDrawer} aria-label="Close menu" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Workspace identity (collapsed: shown as the badge on the logo tile) */}
                    {!mini && (
                        <div className="relative px-3">
                            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10">
                                <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{role}</span>
                                <span className="relative flex h-2.5 w-2.5" title="Online">
                                    <span className={`absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:animate-none ${tone.dot}`} />
                                    <span className={`relative h-2.5 w-2.5 animate-blink rounded-full motion-reduce:animate-none ${tone.dot}`} />
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className={`relative flex-1 ${mini ? 'px-2' : 'px-3'} ${mini ? 'mt-3 overflow-visible' : 'mt-5 overflow-y-auto'}`} aria-label="Main">
                        {mini && <div className="mx-auto mb-3 h-px w-8 bg-white/10" />}
                        <ul className="relative space-y-1">
                            {activeIndex >= 0 && <ActiveIndicator index={activeIndex} mini={mini} />}
                            {items.map((item) => {
                                const isActive = active?.href === item.href;
                                const Icon = item.icon;

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={`group relative flex h-[52px] items-center gap-3 text-sm font-medium transition-colors duration-200 ${mini ? 'justify-center rounded-full' : 'rounded-2xl p-2'} ${
                                                isActive ? 'text-white' : `text-slate-400 hover:text-white ${mini ? '' : 'hover:bg-white/5'}`
                                            }`}
                                        >
                                            <span
                                                className={`flex shrink-0 items-center justify-center transition ${mini ? 'h-12 w-12 rounded-full' : 'h-9 w-9 rounded-xl'} ${
                                                    isActive ? 'bg-white/15 ring-1 ring-white/20' : 'bg-white/5 text-slate-400 ring-1 ring-white/5 group-hover:bg-white/10 group-hover:text-white'
                                                }`}
                                            >
                                                <Icon className="h-[18px] w-[18px] transition group-hover:scale-110" />
                                            </span>
                                            {!mini && (
                                                <span className={`min-w-0 flex-1 truncate ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                                            )}
                                            {item.badge ? (
                                                <span
                                                    className={`rounded-full text-[10px] font-bold ${
                                                        mini ? 'absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 ring-2 ring-slate-900' : 'px-2 py-0.5'
                                                    } ${mini ? '' : item.green ? 'bg-success text-white' : isActive ? 'bg-white/20 text-white' : 'bg-brand/25 text-blue-200'}`}
                                                >
                                                    {!mini && item.badge}
                                                </span>
                                            ) : (
                                                !mini && (
                                                    <ChevronRight
                                                        className={`h-4 w-4 shrink-0 transition ${isActive ? 'text-white/70' : '-translate-x-1 text-slate-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}
                                                    />
                                                )
                                            )}

                                            {/* Tooltip when collapsed */}
                                            {mini && (
                                                <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-4 -translate-y-1/2 translate-x-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                                                    {item.label}                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Account */}
                    <div className={`relative border-t border-white/5 ${mini ? 'p-2' : 'p-3'}`}>
                        <AccountCard user={user} role={role} mini={mini} />
                    </div>
                </div>
            </aside>
        </>
    );
}

/**
 * Shared shell: floating sidebar + page header banner. Props:
 * - title: browser tab title
 * - header: PageHeader props ({ eyebrow, eyebrowIcon, title, subtitle, actions }). When set, the banner is the
 *   page header on desktop and the glass top bar only shows on phones (it holds the menu button there).
 * - search: { value, onChange, placeholder } (optional; shown in the banner, or the top bar without one)
 * - width: tailwind max-w class for the content area (the banner always spans the full width)
 */
export default function AppLayout({ title, header, search, width = 'max-w-7xl', children }) {
    const page = usePage();
    const { auth, badges = {}, flash = {} } = page.props;
    const user = auth.user;
    const items = navFor(user, badges).filter((item) => item.show !== false);
    const role = user.roles[0] ?? 'User';
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [collapsed, setCollapsed] = useState(readCollapsed);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Longest matching href wins so /employer/jobs/create doesn't also light up /employer/jobs.
    const path = page.url.split('?')[0];
    const active = items
        .filter((item) => path === item.href || path.startsWith(`${item.href}/`))
        .sort((a, b) => b.href.length - a.href.length)[0];

    // Close the phone drawer after navigating.
    useEffect(() => setDrawerOpen(false), [page.url]);

    const toggleCollapsed = () => {
        setCollapsed((c) => {
            try {
                window.localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
            } catch {
                /* storage unavailable: keep in-memory state only */
            }
            return !c;
        });
    };

    // Ctrl/Cmd+B toggles the sidebar (ignored while typing).
    useEffect(() => {
        const onKey = (e) => {
            if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'b') return;
            if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
            e.preventDefault();
            toggleCollapsed();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const hasNotifications = Object.values(badges).some((n) => Number(n) > 0);

    return (
        <div className="flex min-h-svh bg-slate-100/70 text-slate-800">
            <Head title={title} />
            {/* Soft ambient colour behind everything */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(60rem_30rem_at_100%_-10%,rgba(31,72,255,0.08),transparent),radial-gradient(40rem_30rem_at_0%_110%,rgba(69,122,0,0.06),transparent)]" />

            <Sidebar
                items={items}
                active={active}
                user={user}
                role={role}
                mini={collapsed && isDesktop}
                onToggleMini={toggleCollapsed}
                drawerOpen={drawerOpen}
                onCloseDrawer={() => setDrawerOpen(false)}
            />

            <main className="relative flex min-w-0 flex-1 flex-col">
                <header className={`sticky top-0 z-20 px-3 pt-3 md:px-6 ${header ? 'md:hidden' : ''}`}>
                    {/* White frosted-glass top bar */}
                    <div className="flex h-14 items-center gap-3 rounded-2xl border border-white/80 bg-white/80 px-3 text-slate-600 shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/5 backdrop-blur-xl md:px-4">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Open menu"
                            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
                        >
                            <MenuIcon className="h-5 w-5" />
                        </button>

                        {/* Breadcrumb */}
                        <div className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
                            <span className="text-slate-400">{role}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                            <span className="truncate font-semibold text-slate-900">{active?.label ?? title}</span>
                        </div>

                        {search && !header && (
                            <div className="relative ml-auto w-full max-w-80 sm:ml-6">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search.value}
                                    onChange={(e) => search.onChange(e.target.value)}
                                    placeholder={search.placeholder}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-brand/60 focus:bg-white focus:ring-4 focus:ring-brand/20 focus:outline-none"
                                />
                            </div>
                        )}

                        <div className="ml-auto flex items-center gap-2">
                            <button
                                type="button"
                                className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                aria-label={hasNotifications ? 'Notifications (new)' : 'Notifications'}
                            >
                                <Bell className="h-[18px] w-[18px]" />
                                {hasNotifications && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
                            </button>
                            {/* Job creation lives in the employer area (role:Employer routes), so only employers get the shortcut. */}
                            {hasRole(user, 'Employer') && can(user, 'jobs.create') && (
                                <Link
                                    href="/employer/jobs/create"
                                    className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-brand to-brand-dark px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:shadow-xl sm:text-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Create a Job</span>
                                </Link>
                            )}
                            <div className="md:hidden">
                                <AccountMenu user={user} role={role} />
                            </div>
                        </div>
                    </div>
                </header>

                {header && (
                    <div className="relative px-4 pt-4 md:px-8 md:pt-3">
                        <PageHeader {...header} search={search} hasNotifications={hasNotifications} />
                    </div>
                )}

                <div className={`w-full space-y-6 p-4 md:p-8 ${header ? 'md:pt-6' : ''} ${width} relative mx-auto`}>
                    <Flash flash={flash} />
                    {children}
                </div>
            </main>
        </div>
    );
}
