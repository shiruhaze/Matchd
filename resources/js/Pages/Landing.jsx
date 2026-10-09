import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    Building2,
    CalendarCheck,
    Check,
    ChevronDown,
    LayoutList,
    Sparkles,
    Tags,
    Target,
    Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BRAND_IMAGES, BrandMark, InterviewCard, MatchCard } from '../Components/Brand';

/**
 * Image slots. Swap these for your own files in /public/images.
 * - hero: full-bleed artwork behind the hero on desktop, image card on phones
 * - soft: soft gradient used behind the mobile hero and the closing CTA band
 * The logo lives in Components/Brand.jsx (BRAND_IMAGES.logoDark).
 */
const IMAGES = {
    hero: BRAND_IMAGES.art,
    soft: BRAND_IMAGES.soft,
    wordmark: '/images/matchd-wordmark.webp', // hero only
};

const STEPS = [
    { icon: Tags, title: 'Tag your skills', body: 'Build a profile once by tagging the skills you actually have, from React to cybersecurity.' },
    { icon: Target, title: 'Get scored', body: 'Every open role is scored against your skills, so the best matches rise to the top.' },
    { icon: CalendarCheck, title: 'Apply & interview', body: 'Apply in one click, track your status, and get interview invites in one place.' },
];

const AUDIENCES = [
    {
        id: 'applicants',
        icon: Briefcase,
        eyebrow: 'For applicants',
        title: 'Stop scrolling. Start matching.',
        points: ['Jobs ranked by skill-match percentage', 'Track every application and its status', 'Interview details, links and notes in one place'],
        cta: 'Find matching jobs',
        href: '/register',
        tone: 'success',
    },
    {
        id: 'employers',
        icon: Building2,
        eyebrow: 'For employers',
        title: 'Hire for skills, not keywords.',
        points: ['Post roles with the exact skills you need', 'Review applicants for each job in one dashboard', 'Schedule interviews and keep candidates informed'],
        cta: 'Start hiring',
        href: '/register?role=Employer',
        tone: 'brand',
    },
];

const TONES = {
    success: { chip: 'bg-success/10 text-success', check: 'text-success', button: 'bg-success hover:bg-success-dark shadow-success/25', glow: 'bg-success/20' },
    brand: { chip: 'bg-brand/10 text-brand', check: 'text-brand', button: 'bg-brand hover:bg-brand-dark shadow-brand/25', glow: 'bg-brand/20' },
};

export default function Landing() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-white text-slate-800">
            <Head title="Match a job today" />

            <Navbar />
            <Hero />
            <HowItWorks />
            <Audiences />
            <ClosingCta />
            <Footer />
        </div>
    );
}

/* ───────────────────────────── Navbar ───────────────────────────── */

/** Transparent over the hero, turns into frosted glass once the page scrolls. */
function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled ? 'border-b border-slate-200/70 bg-white/75 shadow-sm shadow-slate-900/5 backdrop-blur-xl' : 'border-b border-transparent'
            }`}
        >
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-10">
                <Link href="/" className="shrink-0" aria-label="Matchd home">
                    <BrandMark className="w-28 sm:w-32" />
                </Link>

                <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
                    <a href="#how-it-works" className="transition hover:text-slate-900">How it works</a>
                    <a href="#applicants" className="transition hover:text-slate-900">For applicants</a>
                    <a href="#employers" className="transition hover:text-slate-900">For employers</a>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900 sm:px-4">
                        Log in
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 sm:px-5"
                    >
                        Sign up
                    </Link>
                </div>
            </nav>
        </header>
    );
}

/* ────────────────────────────── Hero ────────────────────────────── */

function Hero() {
    // Staggered entrance: each block fades up a beat after the previous one.
    const enter = (step) => ({ className: 'animate-fade-up motion-reduce:animate-none', style: { animationDelay: `${step * 120}ms` } });

    return (
        <section className="relative isolate flex min-h-svh items-center overflow-hidden pt-16 sm:pt-20">
            {/* Backgrounds: soft gradient on phones/tablets, full artwork on desktop. */}
            <img src={IMAGES.soft} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover lg:hidden" />
            <img src={IMAGES.hero} alt="" aria-hidden="true" className="absolute inset-0 -z-20 hidden h-full w-full object-cover object-[65%_center] lg:block" />
            {/* Legibility wash behind the copy (desktop only; the art already fades to white on its left). */}
            <div className="absolute inset-y-0 left-0 -z-10 hidden w-3/5 bg-linear-to-r from-white via-white/80 to-transparent lg:block" />
            <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-t from-white to-transparent" />

            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-10 lg:py-16">
                {/* Copy */}
                <div className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left xl:col-span-5">
                    <span {...enter(0)}>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md">
                            <Sparkles className="h-3.5 w-3.5 text-success" />
                            Skill-based job matching
                        </span>
                    </span>

                    {/* Hero uses the "Match a JOB today?" artwork (cropped copy of match-a-job-today.png). */}
                    <h1 {...enter(1)} className={`${enter(1).className} mt-6 mb-4 w-full max-w-sm sm:max-w-md`}>
                        <img
                            src={IMAGES.wordmark}
                            alt="Matchd, Match a job today?"
                            width="1497"
                            height="1086"
                            className="aspect-[1497/1086] w-full object-contain drop-shadow-[0_18px_30px_rgba(15,23,42,0.12)]"
                        />
                    </h1>

                    <p {...enter(2)} className={`${enter(2).className} mt-2 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg`}>
                        Tag your skills, get scored against open roles, and let employers find you. No more endless scrolling.
                    </p>

                    <div {...enter(3)} className={`${enter(3).className} mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row lg:items-start`}>
                        <Link
                            href="/register"
                            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-success px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-success/30 transition duration-200 hover:-translate-y-0.5 hover:bg-success-dark hover:shadow-xl hover:shadow-success/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-success/30 sm:w-auto"
                        >
                            Get started
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white/80 px-8 py-3.5 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300 sm:w-auto"
                        >
                            I already have an account
                        </Link>
                    </div>

                    <ul {...enter(4)} className={`${enter(4).className} mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 lg:justify-start`}>
                        {['Applicants & employers', 'Skill-match scores', 'Interview scheduling'].map((item) => (
                            <li key={item} className="inline-flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-success" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Desktop: floating UI previews over the artwork */}
                <div aria-hidden="true" className="relative hidden h-[34rem] lg:col-span-6 lg:block xl:col-span-7">
                    <div className="absolute bottom-4 left-0 w-[22rem] animate-float motion-reduce:animate-none xl:left-8">
                        <MatchCard />
                    </div>
                    <div className="absolute right-0 bottom-40 w-64 animate-float-slow [animation-delay:1.5s] motion-reduce:animate-none">
                        <InterviewCard />
                    </div>
                </div>

                {/* Phones/tablets: artwork as a card so the copy stays readable */}
                <div aria-hidden="true" className="relative mx-auto w-full max-w-xl lg:hidden">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-slate-900/15 ring-1 ring-white/60 sm:aspect-[16/10]">
                        <img src={IMAGES.hero} alt="" className="h-full w-full object-cover object-[72%_center]" />
                    </div>
                    <div className="absolute -bottom-6 left-3 w-[17rem] sm:left-6 sm:w-80">
                        <MatchCard compact />
                    </div>
                </div>
            </div>

            <a
                href="#how-it-works"
                aria-label="Scroll to how it works"
                className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 rounded-full border border-white/80 bg-white/60 p-2 text-slate-500 shadow-sm backdrop-blur-md transition hover:text-slate-900 lg:block"
            >
                <ChevronDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" />
            </a>
        </section>
    );
}

/* ────────────────────────── How it works ────────────────────────── */

function HowItWorks() {
    return (
        <section id="how-it-works" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <SectionHeading eyebrow="How it works" title="From skills to interview in three steps" />

                <ol className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-3 md:gap-6">
                    {STEPS.map(({ icon: Icon, title, body }, i) => (
                        <Reveal as="li" key={title} delay={i * 120}>
                            <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5">
                                <span className="absolute top-5 right-6 text-6xl font-black text-slate-100 transition group-hover:text-brand/10">{i + 1}</span>
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand to-brand-dark text-white shadow-lg shadow-brand/25">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="relative mt-6 text-lg font-bold text-slate-900">{title}</h3>
                                <p className="relative mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
                            </div>
                        </Reveal>
                    ))}
                </ol>
            </div>
        </section>
    );
}

/* ─────────────────────── Applicants / Employers ─────────────────────── */

function Audiences() {
    return (
        <section className="bg-slate-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <SectionHeading eyebrow="Built for both sides" title="One platform, two ways to win" />

                <div className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-2">
                    {AUDIENCES.map(({ id, icon: Icon, eyebrow, title, points, cta, href, tone }, i) => {
                        const t = TONES[tone];

                        return (
                            <Reveal key={id} delay={i * 150} className="scroll-mt-24" id={id}>
                                <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition duration-300 hover:shadow-xl hover:shadow-slate-900/5 sm:p-10">
                                    <div className={`absolute -top-20 -right-20 h-56 w-56 rounded-full ${t.glow} opacity-60 blur-3xl transition group-hover:opacity-100`} />
                                    <span className={`relative inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${t.chip}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                        {eyebrow}
                                    </span>
                                    <h3 className="relative mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h3>
                                    <ul className="relative mt-6 space-y-3">
                                        {points.map((p) => (
                                            <li key={p} className="flex items-start gap-3 text-sm text-slate-600">
                                                <Check className={`mt-0.5 h-4 w-4 shrink-0 ${t.check}`} />
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={href}
                                        className={`relative mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 ${t.button}`}
                                    >
                                        {cta}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────── Closing CTA ─────────────────────────── */

function ClosingCta() {
    return (
        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-10">
            <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-14 text-center shadow-xl shadow-slate-900/5 sm:px-12 sm:py-20">
                <img src={IMAGES.soft} alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover" />
                <div className="mx-auto flex max-w-2xl flex-col items-center">
                    <div className="flex -space-x-2">
                        {[Users, LayoutList, CalendarCheck].map((Icon, i) => (
                            <span key={i} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white/80 text-brand shadow-sm backdrop-blur">
                                <Icon className="h-4 w-4" />
                            </span>
                        ))}
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your next match is waiting.</h2>
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                        Join as an applicant to find roles that fit, or as an employer to find people who do.
                    </p>
                    <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
                        <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-success px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-success/30 transition hover:-translate-y-0.5 hover:bg-success-dark">
                            Create your account <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-white bg-white/70 px-8 py-3.5 text-sm font-semibold text-slate-800 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white">
                            Log in
                        </Link>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}

function Footer() {
    return (
        <footer className="border-t border-slate-100 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
                <BrandMark className="w-24 opacity-80" />
                <p>&copy; {new Date().getFullYear()} Matchd. All rights reserved.</p>
                <div className="flex gap-5">
                    <Link href="/login" className="hover:text-slate-900">Log in</Link>
                    <Link href="/register" className="hover:text-slate-900">Sign up</Link>
                </div>
            </div>
        </footer>
    );
}

/* ──────────────────────────── Helpers ──────────────────────────── */

function SectionHeading({ eyebrow, title }) {
    return (
        <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-widest text-brand uppercase">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
        </Reveal>
    );
}

/** Fades content up the first time it scrolls into view. */
function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || !('IntersectionObserver' in window)) {
            setShown(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            {...props}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-[opacity,translate] duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            } ${className}`}
        >
            {children}
        </Tag>
    );
}
