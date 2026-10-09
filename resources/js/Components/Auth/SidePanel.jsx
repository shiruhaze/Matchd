import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BRAND_IMAGES, BrandMark, InterviewCard, MatchCard } from '../Brand';
import { ButtonShine } from './fields';

/**
 * ─── Image slots ────────────────────────────────────────────────────────────
 * Point these at your own graphics in /public/images.
 * - art:      artwork shown in the lower half of the panel (and the phone banner)
 * - backdrop: full-page background behind the card
 * The logo comes from Components/Brand.jsx (BRAND_IMAGES.logoDark).
 */
export const AUTH_IMAGES = {
    art: BRAND_IMAGES.art,
    backdrop: BRAND_IMAGES.soft,
};

/** Panel timing. LAG is how long the trailing edge waits, which gives the panel its stretch. */
const SLIDE_MS = 900;
const LAG_MS = 100;

/** Copy for the panel, keyed by the *active form*, so it always invites the other action. */
const PANEL_COPY = {
    login: {
        eyebrow: 'New to Matchd?',
        title: 'Your next role is a match away.',
        body: 'Tag your skills once and let Matchd rank the jobs that fit you best.',
        cta: 'Create an account',
        target: 'register',
        card: <MatchCard compact />,
    },
    register: {
        eyebrow: 'Already a member?',
        title: 'Welcome back, let’s pick up where you left off.',
        body: 'Your applications, interviews and matches are waiting for you.',
        cta: 'Log in instead',
        target: 'login',
        card: <InterviewCard />,
    },
};

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    return reduced;
}

/** A soft light sweep that replays every time the mode changes (remounted via `key`). */
function Sheen({ mode }) {
    return (
        <div
            key={mode}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-30 w-1/2 animate-sheen bg-linear-to-r from-transparent via-white/70 to-transparent motion-reduce:hidden"
        />
    );
}

/**
 * Desktop/tablet overlay (md and up). Sits over the inactive form and slides
 * LEFT (log in active) <-> RIGHT (sign up active).
 *
 * The panel is positioned with left/right insets instead of a transform. Each edge gets its
 * own transition delay: the leading edge starts immediately and the trailing edge follows
 * LAG_MS later, so the panel stretches mid-flight and settles into place. Inner content is
 * sized in container-query units (cqw) of the card, so nothing reflows while it stretches.
 */
export function SidePanel({ mode, onSwitch }) {
    const isLogin = mode === 'login';
    const reducedMotion = usePrefersReducedMotion();

    const motion = reducedMotion
        ? { transition: 'none' }
        : {
              transitionProperty: 'left, right, border-radius',
              transitionDuration: `${SLIDE_MS}ms`,
              transitionTimingFunction: 'var(--ease-slide)',
              transitionDelay: isLogin ? `0ms, ${LAG_MS}ms, 0ms` : `${LAG_MS}ms, 0ms, 0ms`,
          };

    return (
        <aside
            style={{ left: isLogin ? '0%' : '50%', right: isLogin ? '50%' : '0%', ...motion }}
            className={`absolute inset-y-0 z-20 hidden overflow-hidden bg-linear-to-b from-white via-white to-slate-50 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 md:block ${
                isLogin ? 'rounded-r-[2.5rem]' : 'rounded-l-[2.5rem]'
            }`}
        >
            {/* Ambient colour */}
            <div aria-hidden="true" className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
            <div aria-hidden="true" className="absolute top-1/3 -right-20 h-56 w-56 rounded-full bg-success/10 blur-3xl" />

            {/* Artwork window: wider than the panel ever gets (so it never rescales), nudged left so the plane sits mid-panel, masked to melt into the white. Small per-mode shift = parallax. */}
            <div
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 h-[42%] w-[100cqw] transition-transform duration-1000 ease-slide motion-reduce:transition-none"
                style={{ transform: `translateX(calc(-50% - ${isLogin ? '10cqw' : '6cqw'}))` }}
            >
                <img
                    src={AUTH_IMAGES.art}
                    alt=""
                    className="h-full w-full object-cover object-[50%_32%] [mask-image:linear-gradient(to_bottom,transparent,black_38%)]"
                />
            </div>

            <Sheen mode={mode} />

            {/* Copy + floating card, one layer per mode, cross-fading and drifting in the direction of travel */}
            {Object.entries(PANEL_COPY).map(([key, copy]) => {
                const active = key === mode;
                const Arrow = copy.target === 'login' ? ArrowLeft : ArrowRight; // points where the panel will go

                return (
                    <div
                        key={key}
                        inert={!active}
                        className={`absolute inset-y-0 left-1/2 w-[50cqw] -translate-x-1/2 transition-[opacity,translate,filter] ease-slide motion-reduce:transition-none ${
                            active
                                ? 'translate-y-0 opacity-100 blur-[0px] delay-[320ms] duration-700'
                                : `pointer-events-none opacity-0 blur-sm duration-300 ${key === 'login' ? '-translate-y-3' : 'translate-y-3'}`
                        }`}
                    >
                        {/* Centered copy; top padding clears the floating controls in the card's corners. */}
                        <div className="flex flex-col items-center px-10 pt-20 text-center lg:px-14 short:pt-16">
                            <BrandMark className="w-44 lg:w-52 short:w-40" />
                            <span className="mt-5 inline-flex rounded-full border border-brand/15 bg-brand/5 px-3 py-1 text-[11px] font-semibold tracking-wider text-brand uppercase short:mt-3">
                                {copy.eyebrow}
                            </span>
                            <h2 className="mt-3 text-2xl leading-tight font-bold tracking-tight text-slate-900 lg:text-[2rem]">{copy.title}</h2>
                            <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-slate-500">{copy.body}</p>

                            {/* Switch CTA: green (matches the landing page's "Get started") so it reads apart from the blue submit button. */}
                            <button
                                type="button"
                                onClick={() => onSwitch(copy.target)}
                                className="group relative mt-6 inline-flex items-center gap-2.5 rounded-full bg-linear-to-r from-success to-[#5f9e0c] px-8 py-3.5 text-[15px] font-bold text-white shadow-xl shadow-success/30 ring-4 ring-success/15 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-success/40 hover:ring-success/25 focus:outline-none focus-visible:ring-success/40 active:translate-y-0 short:mt-4 short:py-3"
                            >
                                <span aria-hidden="true" className="absolute inset-0 animate-halo rounded-full motion-reduce:hidden" />
                                <ButtonShine />
                                {copy.target === 'login' && <Arrow className="relative h-4 w-4 transition-transform group-hover:-translate-x-1" />}
                                <span className="relative">{copy.cta}</span>
                                {copy.target === 'register' && <Arrow className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />}
                            </button>
                        </div>

                        <div aria-hidden="true" className="absolute bottom-8 left-10 w-64 short:bottom-5 animate-float motion-reduce:animate-none lg:left-14 lg:w-72">
                            {copy.card}
                        </div>
                    </div>
                );
            })}
        </aside>
    );
}

/** Banner copy describes the *current* form (there's no room for a second CTA on phones). */
const BANNER_COPY = {
    login: { eyebrow: 'Welcome back', title: 'Good to see you again.' },
    register: { eyebrow: 'Join Matchd', title: 'Your next role is a match away.' },
};

/** Compact brand banner shown above the form on phones (below md). */
export function MobileBanner({ mode }) {
    const copy = BANNER_COPY[mode];

    return (
        <div className="relative col-start-1 row-start-1 h-56 overflow-hidden border-b border-slate-100 bg-linear-to-br from-white to-slate-50 sm:h-60 md:hidden">
            <img
                src={AUTH_IMAGES.art}
                alt=""
                aria-hidden="true"
                className={`absolute inset-y-0 right-0 h-full w-[80%] object-cover transition-[object-position] duration-1000 ease-slide [mask-image:linear-gradient(to_right,transparent,black_45%)] motion-reduce:transition-none ${
                    mode === 'login' ? 'object-[72%_35%]' : 'object-[80%_35%]'
                }`}
            />
            <Sheen mode={mode} />
            <div className="relative flex h-full w-3/5 flex-col justify-end gap-2 p-5 pt-16 sm:p-7 sm:pt-20">
                <BrandMark className="w-28 sm:w-32" />
                {/* key forces a remount so the entrance animation replays on every switch */}
                <div key={mode} className="animate-fade-up motion-reduce:animate-none">
                    <p className="text-[11px] font-semibold tracking-wider text-brand uppercase">{copy.eyebrow}</p>
                    <p className="mt-0.5 text-sm leading-snug font-bold text-slate-900 sm:text-base">{copy.title}</p>
                </div>
            </div>
        </div>
    );
}
