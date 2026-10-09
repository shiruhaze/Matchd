import { CalendarCheck } from 'lucide-react';

/**
 * ─── Brand image slots ──────────────────────────────────────────────────────
 * Web-optimised copies of the originals in /public/images (the originals are untouched):
 * - logo:     matchd-main.png cropped to its content (white lettering, for dark UI) → matchd-logo.webp
 * - logoDark: the same logo with dark lettering, for light backgrounds           → matchd-logo-dark.webp
 * - emblem: the "M" figure from the same logo (collapsed sidebar, favicons)       → matchd-emblem.png
 * - art:    main-bg.png resized to 2400px                                          → main-bg.webp
 * Swap any path for your own file.
 */
export const BRAND_IMAGES = {
    logo: '/images/matchd-logo.webp',
    logoDark: '/images/matchd-logo-dark.webp',
    emblem: '/images/matchd-emblem.png',
    art: '/images/main-bg.webp',
    soft: '/images/green_bg.png',
};

/**
 * The Matchd logo. Size it with a width class, e.g. `w-40`.
 * tone: 'dark' lettering for light backgrounds (default), 'light' lettering for dark ones.
 */
export function BrandMark({ tone = 'dark', className = '', imgClassName = '', style }) {
    return (
        <span className={`block aspect-[1200/368] ${className}`}>
            <img
                src={tone === 'light' ? BRAND_IMAGES.logo : BRAND_IMAGES.logoDark}
                alt="Matchd"
                width="1200"
                height="368"
                style={style}
                className={`h-full w-full object-contain ${imgClassName}`}
            />
        </span>
    );
}

/** Illustrative preview of a skill-matched job (decorative). */
export function MatchCard({ compact = false, score = 92 }) {
    return (
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur-xl sm:p-5">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-sm font-bold text-brand">MC</div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug font-bold text-slate-900">Senior Frontend Engineer</p>
                    <p className="truncate text-xs text-slate-500">MCorp Tech Solutions · Remote</p>
                </div>
                <ScoreRing value={score} />
            </div>
            {!compact && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                    {['reactjs', 'typescript', 'tailwindcss'].map((skill) => (
                        <span key={skill} className="rounded-full border border-brand/20 bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                            {skill}
                        </span>
                    ))}
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">+1</span>
                </div>
            )}
        </div>
    );
}

export function ScoreRing({ value }) {
    const r = 18;
    const c = 2 * Math.PI * r;

    return (
        <div className="relative h-12 w-12 shrink-0">
            <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
                <circle cx="22" cy="22" r={r} fill="none" strokeWidth="4" className="stroke-slate-200" />
                <circle cx="22" cy="22" r={r} fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-success" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-900">{value}%</span>
        </div>
    );
}

/** Illustrative preview of an interview invite (decorative). */
export function InterviewCard() {
    return (
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
                    <CalendarCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">Interview scheduled</p>
                    <p className="text-xs text-slate-500">Today · 2:00 PM · 45 min</p>
                </div>
            </div>
        </div>
    );
}
