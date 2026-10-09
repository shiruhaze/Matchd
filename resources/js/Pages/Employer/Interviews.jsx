import { router, useForm } from '@inertiajs/react';
import {
    CalendarCheck,
    CalendarDays,
    CalendarPlus,
    Clock,
    Code2,
    Crown,
    Link2,
    Mail,
    MessageSquareText,
    Timer,
    Trash2,
    UserCheck,
    UserRound,
    Video,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useConfirm } from '../../Components/ConfirmDialog';
import { HeaderAction } from '../../Components/PageHeader';
import { FieldSelect } from '../../Components/Popover';
import { inputClass } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { initials } from '../../lib/utils';

const ROUNDS = [
    { value: 'initial', label: 'HR screening', description: 'Culture fit and expectations', icon: UserRound },
    { value: 'technical', label: 'Technical assessment', description: 'Skills and problem solving', icon: Code2 },
    { value: 'final', label: 'Final interview', description: 'With leadership', icon: Crown },
];

const DURATIONS = [
    { value: '30', label: '30 minutes', description: 'Quick screening call', icon: Timer },
    { value: '45', label: '45 minutes', description: 'Standard interview', icon: Timer },
    { value: '60', label: '1 hour', description: 'In-depth or technical session', icon: Timer },
];

// Half-hour start times, 7:00 AM to 8:00 PM.
const TIME_SLOTS = Array.from({ length: 27 }, (_, i) => `${String(7 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

const CUSTOM_DATE = 'custom';

const NOTE_TEMPLATES = [
    'Please be ready to share your screen and walk us through a recent project.',
    'Bring your portfolio and any questions about the team.',
    'Expect a short live coding exercise. Any language you are comfortable with is fine.',
];

const NOTE_MAX = 1000;

const AVATAR_TONES = ['from-brand to-indigo-600', 'from-emerald-500 to-success', 'from-violet-500 to-indigo-600', 'from-amber-400 to-orange-500', 'from-sky-400 to-brand'];

/** yyyy-mm-dd in the browser's local time (what <input type="date"> uses). */
const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The next three weeks as date options, plus a way out to the calendar picker. */
function dayOptions() {
    const today = new Date();
    const days = Array.from({ length: 21 }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
        const weekend = d.getDay() === 0 || d.getDay() === 6;
        return {
            value: isoDate(d),
            label: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
            description: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `In ${i} days`,
            meta: weekend ? 'Weekend' : undefined,
            icon: CalendarDays,
        };
    });
    return [...days, { value: CUSTOM_DATE, label: 'Pick another date…', description: 'Open the calendar', icon: CalendarPlus }];
}

const daypart = (hhmm) => {
    const h = Number(hhmm.slice(0, 2));
    return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
};

const formatTime = (hhmm) => {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

const endTime = (hhmm, minutes) => {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    const end = new Date(2000, 0, 1, h, m + Number(minutes));
    return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
};

const formatDate = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : '');

/** Recognise common video providers from the meeting link. */
function provider(link) {
    if (!link) return null;
    if (/meet\.google\./i.test(link)) return 'Google Meet';
    if (/zoom\.us/i.test(link)) return 'Zoom';
    if (/teams\.(microsoft|live)\./i.test(link)) return 'Microsoft Teams';
    return /^https?:\/\//i.test(link) ? 'Video link' : null;
}

function Section({ icon: Icon, title, description, children }) {
    return (
        <section className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60">
            <header className="flex items-start gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/10">
                    <Icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                    <h2 className="text-sm font-bold text-slate-900">{title}</h2>
                    {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
                </div>
            </header>
            <div className="space-y-5 p-5 sm:p-6">{children}</div>
        </section>
    );
}

function Label({ children, required, error }) {
    return (
        <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
                {children} {required && <span className="text-red-500">*</span>}
            </span>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}

/** Ticket-style summary of the invite being composed. */
function InvitePreview({ candidate, data }) {
    const round = ROUNDS.find((r) => r.value === data.round);
    const via = provider(data.meeting_link);

    return (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-[#0c1533] p-5 text-white shadow-xl shadow-slate-900/15">
            <div aria-hidden="true" className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-brand/30 blur-3xl" />
            <p className="relative flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-blue-200/80 uppercase">
                <Mail className="h-3.5 w-3.5" />
                Invitation preview
            </p>
            <div className="relative mt-4 flex items-center gap-3">
                <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-sm font-bold ring-2 ring-white/20 ${
                        candidate ? AVATAR_TONES[candidate.id % AVATAR_TONES.length] : 'from-slate-600 to-slate-700'
                    }`}
                >
                    {candidate ? initials(candidate.name) : '?'}
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{candidate?.name ?? 'Choose a candidate'}</p>
                    <p className="truncate text-xs text-slate-400">{candidate?.job ?? 'Their job post appears here'}</p>
                </div>
            </div>

            {/* Ticket perforation */}
            <div aria-hidden="true" className="relative -mx-5 my-4 border-t border-dashed border-white/15" />

            <dl className="relative space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5">
                    <dt className="sr-only">Round</dt>
                    {round && <round.icon className="h-4 w-4 text-blue-200" />}
                    <dd className="font-semibold">{round?.label}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                    <dt className="sr-only">Date</dt>
                    <CalendarDays className="h-4 w-4 text-blue-200" />
                    <dd className={data.date ? 'font-semibold' : 'text-slate-400'}>{data.date ? formatDate(data.date) : 'Pick a date'}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                    <dt className="sr-only">Time</dt>
                    <Clock className="h-4 w-4 text-blue-200" />
                    <dd className="font-semibold">
                        {formatTime(data.time)} – {formatTime(endTime(data.time, data.duration_minutes))}
                    </dd>
                </div>
                <div className="flex items-center gap-2.5">
                    <dt className="sr-only">Where</dt>
                    <Video className="h-4 w-4 text-blue-200" />
                    <dd className={via ? 'font-semibold' : 'text-slate-400'}>{via ?? 'No meeting link yet'}</dd>
                </div>
            </dl>
            {data.note && <p className="relative mt-4 line-clamp-3 rounded-xl bg-white/5 p-3 text-[11px] text-slate-300 ring-1 ring-white/10">“{data.note}”</p>}
        </div>
    );
}

function UpcomingList({ upcoming, onCancel }) {
    const groups = useMemo(() => {
        const map = new Map();
        upcoming.forEach((i) => map.set(i.day, [...(map.get(i.day) ?? []), i]));
        return [...map.entries()];
    }, [upcoming]);

    return (
        <section className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                    <CalendarCheck className="h-4 w-4 text-brand" />
                    Upcoming schedule
                </h3>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">{upcoming.length} confirmed</span>
            </header>
            <div className="p-5">
                {upcoming.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <CalendarDays className="h-5 w-5" />
                        </span>
                        <p className="text-sm font-semibold text-slate-700">Your calendar is clear</p>
                        <p className="text-xs text-slate-400">Interviews you send appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {groups.map(([day, items]) => (
                            <div key={day}>
                                <p className={`mb-2 text-[11px] font-bold tracking-wider uppercase ${items[0].is_today ? 'text-brand' : 'text-slate-400'}`}>{day}</p>
                                <ul className="space-y-2 border-l-2 border-slate-100 pl-4">
                                    {items.map((i) => (
                                        <li key={i.id} className="group relative rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                                            <span className={`absolute top-4 -left-[1.4rem] h-2.5 w-2.5 rounded-full ring-4 ring-white ${i.is_today ? 'bg-brand' : 'bg-slate-300'}`} />
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-bold text-slate-900">{i.applicant}</p>
                                                    <p className="truncate text-[11px] text-slate-500">{i.job}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => onCancel(i)}
                                                    aria-label={`Cancel interview with ${i.applicant}`}
                                                    className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {i.time_range}
                                                </span>
                                                {i.link && (
                                                    <a href={i.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-success hover:underline">
                                                        <Video className="h-3 w-3" />
                                                        Join
                                                    </a>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default function Interviews({ candidates, upcoming, selectedApplication }) {
    const [confirm, dialog] = useConfirm();
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
        application_id: selectedApplication ?? candidates[0]?.id ?? '',
        round: 'initial',
        date: '',
        time: '10:00',
        duration_minutes: '30',
        meeting_link: '',
        note: '',
    });
    const days = useMemo(dayOptions, []);
    // Dates beyond the list (or typed by hand) switch the field to the calendar picker.
    const [customDate, setCustomDate] = useState(false);
    const dateValue = customDate || (data.date && !days.some((d) => d.value === data.date)) ? CUSTOM_DATE : data.date;
    const timeOptions = TIME_SLOTS.map((t) => ({
        value: t,
        label: formatTime(t),
        description: daypart(t),
        meta: `until ${formatTime(endTime(t, data.duration_minutes))}`,
        icon: Clock,
    }));
    // Keep a hand-typed time (e.g. 10:15 from an old link) selectable.
    if (data.time && !TIME_SLOTS.includes(data.time)) {
        timeOptions.unshift({ value: data.time, label: formatTime(data.time), description: 'Custom time', icon: Clock });
    }
    const candidateOptions = candidates.map((c) => ({
        value: c.id,
        label: c.name,
        description: c.job,
        meta: c.status === 'interview_scheduled' ? 'Interviewing' : c.applied,
        leading: (
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-[11px] font-bold text-white ${AVATAR_TONES[c.id % AVATAR_TONES.length]}`}>
                {initials(c.name)}
            </span>
        ),
    }));
    const candidate = candidates.find((c) => String(c.id) === String(data.application_id));
    const via = provider(data.meeting_link);

    const set = (field) => (value) => {
        setData(field, value);
        clearErrors(field);
    };
    const change = (field) => (event) => set(field)(event.target.value);

    const submit = (event) => {
        event.preventDefault();
        post('/employer/interviews', { preserveScroll: true, onSuccess: () => reset('date', 'meeting_link', 'note') });
    };

    const cancel = async (interview) => {
        const ok = await confirm({
            tone: 'danger',
            title: `Cancel the interview with ${interview.applicant}?`,
            message: `${interview.day}, ${interview.time_range} for "${interview.job}" will be removed from the schedule.`,
            confirmLabel: 'Cancel interview',
        });
        if (ok) router.delete(`/employer/interviews/${interview.id}`, { preserveScroll: true });
    };

    const disabled = processing || candidates.length === 0;

    return (
        <AppLayout
            title="Set Interview"
            header={{
                eyebrow: 'Employer · Interviews',
                eyebrowIcon: CalendarPlus,
                title: 'Schedule an Interview',
                subtitle: `${upcoming.length} upcoming ${upcoming.length === 1 ? 'interview' : 'interviews'} and ${candidates.length} ${candidates.length === 1 ? 'candidate' : 'candidates'} ready to invite.`,
                actions: (
                    <>
                        <HeaderAction href="/employer/applications" icon={UserCheck} variant="ghost">
                            Approve applicants
                        </HeaderAction>
                        {/* The banner sits outside the form, so the button targets it by id. */}
                        <HeaderAction type="submit" form="interview-form" icon={CalendarPlus} disabled={disabled}>
                            Send invite
                        </HeaderAction>
                    </>
                ),
            }}
        >
            {dialog}

            <form id="interview-form" onSubmit={submit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3" noValidate>
                <div className="space-y-6 lg:col-span-2">
                    <Section icon={UserCheck} title="Candidate & round" description="Who you're meeting and which stage of hiring this is.">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label required error={errors.application_id}>
                                    Candidate
                                </Label>
                                <FieldSelect
                                    label="Candidate"
                                    options={candidateOptions}
                                    value={data.application_id}
                                    onChange={set('application_id')}
                                    error={errors.application_id}
                                    searchable={candidates.length > 5}
                                    disabled={candidates.length === 0}
                                    placeholder={candidates.length ? 'Choose a candidate' : 'No candidates yet'}
                                />
                            </div>
                            <div>
                                <Label error={errors.round}>Interview round</Label>
                                <FieldSelect label="Interview round" options={ROUNDS} value={data.round} onChange={set('round')} error={errors.round} />
                            </div>
                        </div>
                    </Section>

                    <Section icon={CalendarDays} title="Date & time" description="Pick a day and a slot. Times are in your local time zone.">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <Label required error={errors.date}>
                                    Date
                                </Label>
                                <FieldSelect
                                    label="Date"
                                    options={days}
                                    value={dateValue}
                                    onChange={(value) => {
                                        setCustomDate(value === CUSTOM_DATE);
                                        set('date')(value === CUSTOM_DATE ? '' : value);
                                    }}
                                    error={errors.date}
                                    placeholder="Choose a day"
                                    searchable
                                />
                                {dateValue === CUSTOM_DATE && (
                                    <input
                                        type="date"
                                        aria-label="Interview date"
                                        min={days[0].value}
                                        value={data.date}
                                        onChange={change('date')}
                                        className={`${inputClass(errors.date)} mt-2 animate-option-in`}
                                    />
                                )}
                            </div>
                            <div>
                                <Label required error={errors.time}>
                                    Start time
                                </Label>
                                <FieldSelect label="Start time" options={timeOptions} value={data.time} onChange={set('time')} error={errors.time} searchable />
                            </div>
                            <div>
                                <Label error={errors.duration_minutes}>Duration</Label>
                                <FieldSelect label="Duration" options={DURATIONS} value={data.duration_minutes} onChange={set('duration_minutes')} error={errors.duration_minutes} />
                            </div>
                        </div>
                        <p className="inline-flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-100">
                            <CalendarCheck className="h-3.5 w-3.5 text-brand" />
                            {data.date ? <span className="font-semibold text-slate-700">{formatDate(data.date)}</span> : 'No day chosen yet'}
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-slate-700">
                                {formatTime(data.time)} – {formatTime(endTime(data.time, data.duration_minutes))}
                            </span>
                        </p>
                    </Section>

                    <Section icon={MessageSquareText} title="Meeting & message" description="Where to meet and anything the candidate should prepare.">
                        <div>
                            <Label error={errors.meeting_link}>Meeting link</Label>
                            <div className="relative">
                                <Link2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="url"
                                    value={data.meeting_link}
                                    onChange={change('meeting_link')}
                                    placeholder="https://meet.google.com/abc-defg-hij"
                                    className={`${inputClass(errors.meeting_link)} pr-32 pl-9`}
                                />
                                {via && (
                                    <span className="absolute top-1/2 right-2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">
                                        <Video className="h-3 w-3" />
                                        {via}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label error={errors.note}>Note for the candidate</Label>
                            <textarea
                                rows="4"
                                value={data.note}
                                onChange={change('note')}
                                placeholder="Anything they should prepare or know beforehand…"
                                className={inputClass(errors.note)}
                            />
                            <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {NOTE_TEMPLATES.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => set('note')(data.note ? `${data.note.trimEnd()} ${t}` : t)}
                                            className="max-w-full truncate rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-600 transition hover:bg-brand/10 hover:text-brand"
                                            title={t}
                                        >
                                            + {t.split(/[.,]/)[0]}
                                        </button>
                                    ))}
                                </div>
                                <span className={`text-[11px] tabular-nums ${data.note.length > NOTE_MAX ? 'font-semibold text-red-600' : 'text-slate-400'}`}>
                                    {data.note.length} / {NOTE_MAX}
                                </span>
                            </div>
                        </div>
                    </Section>
                </div>

                <aside className="space-y-6 lg:sticky lg:top-6">
                    <InvitePreview candidate={candidate} data={data} />
                    <button
                        type="submit"
                        disabled={disabled}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-brand to-brand-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
                    >
                        <CalendarPlus className="h-4 w-4" />
                        Send interview invitation
                    </button>
                    <UpcomingList upcoming={upcoming} onCancel={cancel} />
                </aside>
            </form>
        </AppLayout>
    );
}
