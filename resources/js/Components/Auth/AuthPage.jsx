import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PaneContext } from './fields';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { AUTH_IMAGES, MobileBanner, SidePanel } from './SidePanel';

const MODES = {
    login: { url: '/login', title: 'Log in', label: 'Log In' },
    register: { url: '/register', title: 'Sign up', label: 'Sign Up' },
};

const modeFor = (component) => (component === 'Auth/Register' ? 'register' : 'login');

/**
 * Shared Login / Sign Up screen.
 *
 * Both Pages/Auth/Login.jsx and Pages/Auth/Register.jsx export this same component.
 * Switching modes animates immediately in local state, then a preserveState Inertia visit
 * updates the URL. Because the page component is identical, Inertia doesn't remount it,
 * so the slide plays uninterrupted and typed form data survives. Deep links, refreshes and
 * back/forward still land on the correct mode via the server-rendered component name.
 */
export default function AuthPage() {
    const { component } = usePage();
    const [mode, setMode] = useState(() => modeFor(component));

    // Follow the server when it decides the page (back/forward, redirects).
    useEffect(() => setMode(modeFor(component)), [component]);

    const switchTo = (next) => {
        if (next === mode) return;
        setMode(next);
        router.visit(MODES[next].url, { preserveState: true, preserveScroll: true });
    };

    const isLogin = mode === 'login';

    return (
        // md+: exactly one viewport tall, so the page never scrolls (min-h keeps very short windows usable).
        <div className="relative min-h-svh overflow-hidden bg-slate-50 text-slate-800 md:h-svh md:min-h-[600px]">
            <Head title={MODES[mode].title} />

            {/* Page backdrop (swap via AUTH_IMAGES.backdrop) + slowly drifting colour blobs */}
            <img src={AUTH_IMAGES.backdrop} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute -top-40 -left-32 h-[28rem] w-[28rem] animate-drift rounded-full bg-brand/15 blur-3xl motion-reduce:animate-none" />
            <div aria-hidden="true" className="absolute -right-32 -bottom-40 h-[30rem] w-[30rem] animate-drift-reverse rounded-full bg-success/15 blur-3xl motion-reduce:animate-none" />

            <div className="relative mx-auto flex w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6 md:h-full md:py-0">
                <main className="flex w-full items-center justify-center">
                    {/*
                      Card layout (@container so the panel can size its content in cqw units)
                      - < md: one column. Row 1 = brand banner, row 2 = the active form.
                      - >= md: two equal columns. Sign Up lives LEFT, Log In lives RIGHT, and the
                               absolutely-positioned SidePanel slides over whichever one is inactive.
                    */}
                    <div className="@container relative grid w-full grid-cols-1 overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_40px_120px_-30px_rgba(15,23,42,0.35)] backdrop-blur-2xl md:h-[min(780px,calc(100svh-3rem))] md:min-h-[560px] md:grid-cols-2">
                        {/* Floating controls, pinned inside the card's top corners above the panel and forms. */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-3 p-3 sm:p-4">
                            <Link
                                href="/"
                                className="group pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 hover:shadow-xl sm:text-sm"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                <span className="hidden sm:inline">Back to home</span>
                                <span className="sm:hidden">Home</span>
                            </Link>
                            <div className="pointer-events-auto">
                                <ModeToggle mode={mode} onChange={switchTo} />
                            </div>
                        </div>

                        <MobileBanner mode={mode} />

                        <FormPane active={!isLogin} from="left" className="md:col-start-1">
                            <RegisterForm onSwitch={() => switchTo('login')} />
                        </FormPane>

                        <FormPane active={isLogin} from="right" className="md:col-start-2">
                            <LoginForm onSwitch={() => switchTo('register')} />
                        </FormPane>

                        <SidePanel mode={mode} onSwitch={switchTo} />
                    </div>
                </main>
            </div>
        </div>
    );
}

/** Segmented "Log In / Sign Up" switch with a sliding pill indicator. */
function ModeToggle({ mode, onChange }) {
    return (
        <div className="relative grid grid-cols-2 rounded-full border border-white/80 bg-white/75 p-1 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-xl">
            <span
                aria-hidden="true"
                className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-linear-to-r from-brand to-brand-dark shadow-md shadow-brand/30 transition-transform duration-700 ease-slide motion-reduce:transition-none ${
                    mode === 'login' ? 'translate-x-0' : 'translate-x-full'
                }`}
            />
            {Object.entries(MODES).map(([key, { label }]) => {
                const active = key === mode;

                return (
                    <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(key)}
                        className={`relative z-10 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:px-6 sm:text-sm ${
                            active ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * One form column.
 * - md+: always laid out (the panel covers it). The outgoing form fades, blurs and drifts away
 *        quickly; the incoming one fades in once the panel has mostly passed, and its fields
 *        stagger in (see Stagger in fields.jsx). Inactive panes are `inert`.
 * - < md: the inactive pane is removed from layout; the active one's fields stagger in.
 */
function FormPane({ active, from, className = '', children }) {
    const offset = from === 'left' ? 'md:-translate-x-10' : 'md:translate-x-10';

    return (
        <PaneContext.Provider value={active}>
            <section
                inert={!active}
                aria-hidden={!active}
                // md+: fills the card height; scrolls internally only as a last resort on very short screens.
                className={`col-start-1 row-start-2 flex items-center px-6 py-8 transition-[opacity,translate,filter] ease-slide [scrollbar-width:thin] motion-reduce:transition-none sm:px-10 md:row-start-1 md:h-full md:overflow-y-auto md:pt-[4.5rem] md:pb-8 lg:px-16 short:pb-4 ${className} ${
                    active
                        ? 'opacity-100 blur-[0px] duration-700 md:translate-x-0 md:delay-200'
                        : `pointer-events-none opacity-0 blur-sm duration-500 max-md:hidden ${offset}`
                }`}
            >
                {children}
            </section>
        </PaneContext.Provider>
    );
}
