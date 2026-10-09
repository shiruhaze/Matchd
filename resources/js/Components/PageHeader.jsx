import { Link } from '@inertiajs/react';
import { Bell, Search } from 'lucide-react';
import { BRAND_IMAGES } from './Brand';

/**
 * Dark banner that serves as every app page's header (the layout renders it from its `header` prop).
 * - eyebrow / eyebrowIcon: small label above the title (section name, date, …)
 * - title, subtitle: page heading and a one-line summary (subtitle may be a node)
 * - actions: buttons on the right, usually <HeaderAction>s
 * - search: { value, onChange, placeholder } renders a search field in the banner
 */
export default function PageHeader({ eyebrow, eyebrowIcon: EyebrowIcon, title, subtitle, actions, search, hasNotifications }) {
    return (
        <section className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-[#0c1533] px-5 py-5 text-white shadow-xl shadow-slate-900/15 sm:px-7">
            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <img
                    src={BRAND_IMAGES.art}
                    alt=""
                    className="absolute inset-y-0 right-0 h-full w-full object-cover object-[70%_45%] opacity-30 [mask-image:linear-gradient(to_right,transparent_25%,black_75%)] sm:w-1/2"
                />
                <div className="absolute -top-24 -left-16 h-56 w-56 animate-drift rounded-full bg-brand/30 blur-3xl motion-reduce:animate-none" />
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [mask-image:linear-gradient(to_right,black,transparent_60%)] bg-[size:18px_18px]" />
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    {eyebrow && (
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-blue-200/80 uppercase">
                            {EyebrowIcon && <EyebrowIcon className="h-3.5 w-3.5" />}
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
                    {subtitle && <p className="mt-0.5 text-sm text-slate-300">{subtitle}</p>}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {search && (
                        <label className="relative w-full sm:w-72">
                            <span className="sr-only">{search.placeholder}</span>
                            <Search className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={search.value}
                                onChange={(e) => search.onChange(e.target.value)}
                                placeholder={search.placeholder}
                                className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 pr-4 pl-9 text-sm text-white backdrop-blur transition placeholder:text-slate-400 focus:border-white/40 focus:bg-white/15 focus:ring-4 focus:ring-white/10 focus:outline-none"
                            />
                        </label>
                    )}
                    {actions}
                    {/* The banner is the page header on desktop, so it carries the notifications bell (phones keep it in the top bar) */}
                    <button
                        type="button"
                        aria-label={hasNotifications ? 'Notifications (new)' : 'Notifications'}
                        className="relative hidden h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-slate-200 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 hover:text-white md:flex"
                    >
                        <Bell className="h-[18px] w-[18px]" />
                        {hasNotifications && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900" />}
                    </button>
                </div>
            </div>
        </section>
    );
}

const ACTION_STYLES = {
    primary: 'bg-white text-slate-900 shadow-lg shadow-black/20 hover:-translate-y-0.5',
    ghost: 'bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:-translate-y-0.5 hover:bg-white/15',
};

/** Banner button: a Link when given `href`, otherwise a <button> (pass type/form/onClick/disabled as needed). */
export function HeaderAction({ href, icon: Icon, variant = 'primary', badge, children, ...props }) {
    const className = `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60 ${ACTION_STYLES[variant]}`;
    const content = (
        <>
            {Icon && <Icon className="h-4 w-4" />}
            {children}
            {badge ? <span className="rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-slate-900">{badge}</span> : null}
        </>
    );

    return href ? (
        <Link href={href} className={className} {...props}>
            {content}
        </Link>
    ) : (
        <button type="button" className={className} {...props}>
            {content}
        </button>
    );
}
