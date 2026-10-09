import { Link } from '@inertiajs/react';
import { Briefcase, CalendarCheck, CalendarDays, CalendarPlus, Check, CheckCircle2, Clock, Compass, Copy, History, Lightbulb, MessageSquareText, Timer, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BRAND_IMAGES } from '../../Components/Brand';
import { FilterTabs, StatTile } from '../../Components/DataView';
import { HeaderAction } from '../../Components/PageHeader';
import { CompanyAvatar } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';

const PREP_TIPS = [
    'Re-read the job post and match it to your skill tags.',
    'Prepare two stories about projects you are proud of.',
    'Test your camera, mic and meeting link 10 minutes early.',
    'Write down questions to ask about the team and role.',
];

/** Re-render every `ms` so countdowns stay current. */
function useNow(ms = 30000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), ms);
        return () => clearInterval(t);
    }, [ms]);
    return now;
}

/** "Starts in 2h 15m" / "Happening now" / "Earlier today". */
function countdown(interview, now) {
    const start = new Date(interview.starts_at).getTime();
    const end = new Date(interview.ends_at).getTime();
    if (now >= end) return { label: 'Earlier today', live: false, over: true };
    if (now >= start) return { label: 'Happening now', live: true };
    const mins = Math.round((start - now) / 60000);
    const d = Math.floor(mins / 1440);
    const h = Math.floor((mins % 1440) / 60);
    const m = mins % 60;
    return { label: `Starts in ${d ? `${d}d ` : ''}${h || d ? `${h}h ` : ''}${m}m`, live: false, soon: mins <= 60 };
}

/** Google Calendar "add event" link (opens their own calendar, nothing is sent from Matchd). */
function calendarUrl(i) {
    const fmt = (iso) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `${i.round}: ${i.title} at ${i.company}`,
        dates: `${fmt(i.starts_at)}/${fmt(i.ends_at)}`,
        details: [i.note, i.link && `Join: ${i.link}`].filter(Boolean).join('\n\n'),
    });
    return `https://calendar.google.com/calendar/render?${params}`;
}

function DateTile({ iso, tone = 'brand' }) {
    const d = new Date(iso);
    const tones = {
        brand: 'bg-brand/10 text-brand ring-brand/10',
        muted: 'bg-slate-100 text-slate-500 ring-slate-200',
        light: 'bg-white/10 text-white ring-white/20',
    };
    return (
        <span className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ring-1 ${tones[tone]}`}>
            <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">{d.toLocaleDateString(undefined, { month: 'short' })}</span>
            <span className="text-xl leading-none font-bold">{d.getDate()}</span>
        </span>
    );
}

function CopyLink({ link, dark = false }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard blocked: the Join button still works */
        }
    };
    return (
        <button
            type="button"
            onClick={copy}
            aria-label="Copy meeting link"
            title="Copy meeting link"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition ${
                dark ? 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </button>
    );
}

/** Spotlight card for the next interview, with a live countdown. */
function NextUp({ interview, now }) {
    const c = countdown(interview, now);

    return (
        <section className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-[#0c1533] p-5 text-white shadow-xl shadow-slate-900/15 sm:p-6">
            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <div className="absolute -top-20 -right-10 h-56 w-56 rounded-full bg-success/25 blur-3xl" />
                <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
            </div>
            <div className="flex flex-col gap-5">
                <div className="flex min-w-0 items-start gap-4">
                    <DateTile iso={interview.starts_at} tone="light" />
                    <div className="min-w-0">
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                                c.live ? 'bg-success text-white' : c.soon ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-blue-100 ring-1 ring-white/15'
                            }`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full ${c.live ? 'animate-ping bg-white' : 'bg-current'}`} />
                            Next up · {c.label}
                        </span>
                        <h2 className="mt-2 text-lg font-bold sm:text-xl">{interview.title}</h2>
                        <p className="mt-0.5 text-sm text-slate-300">
                            {interview.company} · {interview.round}
                        </p>
                        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-blue-200" />
                                {interview.time_range}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Timer className="h-3.5 w-3.5 text-blue-200" />
                                {interview.duration} minutes
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {interview.link && (
                        <a
                            href={interview.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-success/30 transition hover:-translate-y-0.5 hover:bg-success-dark"
                        >
                            <Video className="h-4 w-4" />
                            Join meeting
                        </a>
                    )}
                    <a
                        href={calendarUrl(interview)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
                    >
                        <CalendarPlus className="h-4 w-4" />
                        Add to calendar
                    </a>
                    {interview.link && <CopyLink link={interview.link} dark />}
                </div>
            </div>
            {interview.note && (
                <p className="mt-5 flex gap-2 rounded-2xl bg-white/5 p-3.5 text-xs text-slate-300 ring-1 ring-white/10">
                    <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />
                    <span>
                        <span className="font-semibold text-white">From the recruiter: </span>
                        {interview.note}
                    </span>
                </p>
            )}
        </section>
    );
}

function InterviewRow({ interview, past, now }) {
    const cancelled = interview.status === 'cancelled';
    const c = past ? null : countdown(interview, now);

    return (
        <li className="relative pl-8">
            {/* Timeline dot */}
            <span
                aria-hidden="true"
                className={`absolute top-6 left-0 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-slate-100 ${
                    cancelled ? 'bg-red-400' : past || c?.over ? 'bg-slate-300' : c?.live ? 'bg-success' : 'bg-brand'
                }`}
            />
            <article
                className={`rounded-3xl border border-white/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60 transition duration-300 hover:shadow-lg hover:shadow-slate-900/5 ${
                    past ? 'opacity-80' : ''
                }`}
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <DateTile iso={interview.starts_at} tone={past ? 'muted' : 'brand'} />
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{interview.title}</h4>
                            <span className="rounded-full border border-success/20 bg-success/5 px-2 py-0.5 text-[10px] font-bold text-success">{interview.round}</span>
                            {cancelled && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">Cancelled</span>}
                        </div>
                        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <CompanyAvatar name={interview.company} size="h-5 w-5 text-[8px]" />
                            {interview.company}
                        </p>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {interview.at}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                {interview.duration} min
                            </span>
                            {c && <span className={`font-semibold ${c.over ? 'text-slate-400' : c.live ? 'text-success' : c.soon ? 'text-amber-600' : 'text-brand'}`}>{c.label}</span>}
                            {past && !cancelled && <span>{interview.relative}</span>}
                        </p>
                    </div>
                    {!past && (
                        <div className="flex items-center gap-2">
                            {interview.link && (
                                <a
                                    href={interview.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-success px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-success-dark"
                                >
                                    <Video className="h-3.5 w-3.5" />
                                    Join
                                </a>
                            )}
                            <a
                                href={calendarUrl(interview)}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Add to Google Calendar"
                                title="Add to Google Calendar"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                            >
                                <CalendarPlus className="h-4 w-4" />
                            </a>
                            {interview.link && <CopyLink link={interview.link} />}
                        </div>
                    )}
                </div>
                {interview.note && (
                    <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-100">
                        <span className="font-semibold text-slate-800">Recruiter note: </span>
                        {interview.note}
                    </p>
                )}
            </article>
        </li>
    );
}

function EmptyUpcoming({ hadEarlier }) {
    return (
        <section className="grid overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60 md:grid-cols-5">
            <div className="relative min-h-44 md:col-span-2">
                <img src={BRAND_IMAGES.art} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-[60%_40%]" />
                <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent md:bg-linear-to-r md:from-transparent md:to-white" />
            </div>
            <div className="p-6 md:col-span-3 md:p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <CalendarDays className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{hadEarlier ? 'Nothing else coming up' : 'No interviews scheduled yet'}</h3>
                <p className="mt-1 text-sm text-slate-500">
                    {hadEarlier
                        ? "Today's interview is done. New invites from employers will show up here with the meeting link and their notes."
                        : 'When an employer approves your application, the invite lands here with the meeting link and their notes.'}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                    <Link href="/applicant/jobs" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-dark">
                        <Compass className="h-4 w-4" />
                        Explore jobs
                    </Link>
                    <Link href="/applicant/applications" className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                        <Briefcase className="h-4 w-4" />
                        Track applications
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default function Interviews({ upcoming, completed }) {
    const now = useNow();
    const [tab, setTab] = useState('upcoming');
    // The server keeps today's interviews as upcoming all day; only spotlight one that hasn't ended yet.
    const next = upcoming.find((i) => new Date(i.ends_at).getTime() > now);
    const today = upcoming.find((i) => i.is_today);

    const thisWeek = useMemo(() => upcoming.filter((i) => new Date(i.starts_at).getTime() - now < 7 * 864e5).length, [upcoming, now]);
    const done = completed.filter((i) => i.status !== 'cancelled').length;
    const list = tab === 'upcoming' ? upcoming.filter((i) => i !== next) : completed;

    return (
        <AppLayout
            title="Interviews"
            header={{
                eyebrow: 'Applicant · Interviews',
                eyebrowIcon: CalendarDays,
                title: 'Interview Schedule',
                subtitle: upcoming.length
                    ? `${upcoming.length} upcoming ${upcoming.length === 1 ? 'interview' : 'interviews'}${today ? ', and one is today' : ''}. Meeting links and recruiter notes are below.`
                    : 'No upcoming interviews yet. Invites from employers will appear here.',
                actions: (
                    <HeaderAction href="/applicant/applications" icon={Briefcase} variant="ghost">
                        My applications
                    </HeaderAction>
                ),
            }}
        >
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile icon={CalendarDays} label="Upcoming" value={upcoming.length} hint="Scheduled interviews" tone="brand" />
                <StatTile icon={CalendarCheck} label="This week" value={thisWeek} hint="In the next 7 days" tone="success" />
                <StatTile icon={CheckCircle2} label="Completed" value={done} hint="Interviews you've had" tone="violet" />
                <StatTile icon={Timer} label="Next interview" value={next ? countdown(next, now).label.replace('Starts in ', '') : '—'} hint={next ? next.at : 'Nothing scheduled'} tone="amber" />
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <FilterTabs
                        label="Interviews"
                        value={tab}
                        onChange={setTab}
                        tabs={[
                            { value: 'upcoming', label: 'Upcoming', count: upcoming.length },
                            { value: 'completed', label: 'Past', count: completed.length },
                        ]}
                    />

                    {tab === 'upcoming' && (next ? <NextUp interview={next} now={now} /> : <EmptyUpcoming hadEarlier={upcoming.length > 0} />)}

                    {list.length > 0 && (
                        <div>
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                                {tab === 'upcoming' ? <CalendarDays className="h-4 w-4 text-brand" /> : <History className="h-4 w-4 text-brand" />}
                                {tab === 'upcoming' ? (next ? 'Also scheduled' : 'Today') : 'Past interviews'}
                            </h3>
                            <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:bg-slate-200">
                                {list.map((i) => (
                                    <InterviewRow key={i.id} interview={i} past={tab === 'completed'} now={now} />
                                ))}
                            </ol>
                        </div>
                    )}

                    {tab === 'completed' && completed.length === 0 && (
                        <section className="flex flex-col items-center gap-2 rounded-3xl border border-white/80 bg-white p-10 text-center shadow-sm ring-1 ring-slate-200/60">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <History className="h-5 w-5" />
                            </span>
                            <p className="text-sm font-semibold text-slate-700">No past interviews yet</p>
                            <p className="text-xs text-slate-400">Interviews move here once they're over.</p>
                        </section>
                    )}
                </div>

                <aside className="space-y-6 lg:sticky lg:top-6">
                    <section className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60">
                        <header className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <h3 className="text-sm font-bold text-slate-900">Interview prep</h3>
                        </header>
                        <ul className="space-y-3 p-5">
                            {PREP_TIPS.map((tip) => (
                                <li key={tip} className="flex gap-2.5 text-xs text-slate-600">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-slate-100 bg-slate-50/60 p-5">
                            <Link href="/applicant/profile" className="text-xs font-semibold text-brand hover:underline">
                                Polish your profile and skill tags →
                            </Link>
                        </div>
                    </section>
                </aside>
            </div>
        </AppLayout>
    );
}
