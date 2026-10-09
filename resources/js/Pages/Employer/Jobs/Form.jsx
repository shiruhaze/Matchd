import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Briefcase, Building2, Check, CheckCircle2, Circle, Clock, Eye, FileSignature, FileText, GraduationCap, House, Laptop, MapPin, Save, Send, Tag, Wallet } from 'lucide-react';
import { HeaderAction } from '../../../Components/PageHeader';
import { FieldSelect } from '../../../Components/Popover';
import TagInput from '../../../Components/TagInput';
import { Field, StatusBadge, inputClass } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';
import { SETUP_LABELS, salaryRange } from '../../../lib/utils';

const EMPLOYMENT_TYPES = [
    { value: 'full-time', label: 'Full-time', description: 'Permanent, around 40 hours a week', icon: Briefcase },
    { value: 'part-time', label: 'Part-time', description: 'Fewer hours, flexible schedule', icon: Clock },
    { value: 'contract', label: 'Contract', description: 'Fixed term or project based', icon: FileSignature },
    { value: 'internship', label: 'Internship', description: 'For students and fresh graduates', icon: GraduationCap },
];

const WORK_SETUPS = [
    { value: 'remote', label: 'Remote', description: 'Work from anywhere', icon: Laptop },
    { value: 'hybrid', label: 'Hybrid', description: 'Mix of office and home', icon: House },
    { value: 'onsite', label: 'On-site', description: 'At your office', icon: Building2 },
];

// Mirrors the server-side max lengths in JobPostController.
const TEXT_MAX = 5000;

/** Form section card. */
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

function Counter({ value, max }) {
    const n = value.length;
    return <span className={`text-[11px] tabular-nums ${n > max ? 'font-semibold text-red-600' : 'text-slate-400'}`}>{`${n.toLocaleString()} / ${max.toLocaleString()}`}</span>;
}

/** How the post will look in applicants' job search. */
function Preview({ data }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Briefcase className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                    <p className={`text-sm font-bold break-words ${data.title ? 'text-slate-900' : 'text-slate-400'}`}>{data.title || 'Job title'}</p>
                    <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {data.location || 'Location TBD'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Laptop className="h-3 w-3" />
                            {SETUP_LABELS[data.work_setup]}
                        </span>
                    </p>
                </div>
            </div>
            <p className="mt-3 inline-flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Wallet className="h-3.5 w-3.5 text-slate-400" />
                {salaryRange(data.salary_min || null, data.salary_max || null)} / mo
                <span className="font-normal text-slate-400">· {EMPLOYMENT_TYPES.find((t) => t.value === data.employment_type)?.label}</span>
            </p>
            {data.description && <p className="mt-2 line-clamp-3 text-xs text-slate-500">{data.description}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
                {data.skills.length ? (
                    data.skills.slice(0, 6).map((s) => (
                        <span key={s} className="rounded-full border border-brand/15 bg-brand/5 px-2 py-0.5 text-[10px] font-semibold text-brand">
                            #{s}
                        </span>
                    ))
                ) : (
                    <span className="text-[11px] text-slate-400">Skill tags appear here</span>
                )}
                {data.skills.length > 6 && <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500">+{data.skills.length - 6}</span>}
            </div>
        </div>
    );
}

function Ring({ value }) {
    const r = 16;
    const c = 2 * Math.PI * r;
    return (
        <span className="relative h-11 w-11 shrink-0">
            <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90">
                <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" className="stroke-slate-100" />
                <circle
                    cx="20"
                    cy="20"
                    r={r}
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className={`transition-[stroke-dashoffset] duration-500 ${value === 100 ? 'stroke-success' : 'stroke-brand'}`}
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - value / 100)}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-900">{value}%</span>
        </span>
    );
}

/** Used for both Create (job === null) and Edit. */
export default function Form({ job, skillSuggestions }) {
    const editing = Boolean(job);
    const { data, setData, post, put, processing, errors, clearErrors, transform } = useForm({
        title: job?.title ?? '',
        employment_type: job?.employment_type ?? 'full-time',
        work_setup: job?.work_setup ?? 'remote',
        location: job?.location ?? '',
        salary_min: job?.salary_min ?? '',
        salary_max: job?.salary_max ?? '',
        description: job?.description ?? '',
        requirements: job?.requirements ?? '',
        skills: job?.skills ?? [],
        status: job?.status ?? 'published',
    });

    const change = (field) => (event) => {
        setData(field, event.target.value);
        clearErrors(field);
    };

    const pick = (field) => (value) => {
        setData(field, value);
        clearErrors(field);
    };

    const save = (status) => (event) => {
        event.preventDefault();
        transform((payload) => ({
            ...payload,
            status,
            salary_min: payload.salary_min === '' ? null : payload.salary_min,
            salary_max: payload.salary_max === '' ? null : payload.salary_max,
        }));
        const options = { preserveScroll: true };
        editing ? put(`/employer/jobs/${job.id}`, options) : post('/employer/jobs', options);
    };

    const checks = [
        { label: 'Job title', done: data.title.trim().length > 0 },
        { label: 'Location', done: data.location.trim().length > 0 },
        { label: 'Salary range', done: data.salary_min !== '' && data.salary_max !== '' },
        { label: 'At least 3 skill tags', done: data.skills.length >= 3 },
        { label: 'Description (40+ characters)', done: data.description.trim().length >= 40 },
        { label: 'Requirements', done: data.requirements.trim().length > 0 },
    ];
    const completion = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
    const primaryLabel = editing ? 'Save changes' : 'Publish job';

    return (
        <AppLayout
            title={editing ? 'Edit Job' : 'Create a Job'}
            header={{
                eyebrow: editing ? 'Employer · Edit job' : 'Employer · New job',
                eyebrowIcon: Briefcase,
                title: editing ? `Edit ${job.title}` : 'Post a New Job Opportunity',
                subtitle: editing
                    ? 'Changes apply to the live post. Updated skill tags re-rank your matched candidates.'
                    : 'Describe the role and tag the skills you need. Matching applicants are ranked automatically.',
                actions: (
                    <>
                        <HeaderAction href="/employer/jobs" icon={ArrowLeft} variant="ghost">
                            My jobs
                        </HeaderAction>
                        {/* The banner sits outside the form, so the button targets it by id. */}
                        <HeaderAction type="submit" form="job-form" icon={Check} disabled={processing}>
                            {primaryLabel}
                        </HeaderAction>
                    </>
                ),
            }}
        >
            <form id="job-form" onSubmit={save(editing ? data.status : 'published')} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3" noValidate>
                <div className="space-y-6 lg:col-span-2">
                    <Section icon={Briefcase} title="Job details" description="The basics applicants see first.">
                        <Field label="Job title" error={errors.title} required>
                            <input
                                type="text"
                                value={data.title}
                                onChange={change('title')}
                                placeholder="e.g. Senior Frontend Engineer"
                                className={`${inputClass(errors.title)} py-2.5 text-base font-semibold`}
                            />
                        </Field>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Employment type" error={errors.employment_type}>
                                <FieldSelect
                                    label="Employment type"
                                    options={EMPLOYMENT_TYPES}
                                    value={data.employment_type}
                                    onChange={pick('employment_type')}
                                    error={errors.employment_type}
                                />
                            </Field>
                            <Field label="Work setup" error={errors.work_setup}>
                                <FieldSelect label="Work setup" options={WORK_SETUPS} value={data.work_setup} onChange={pick('work_setup')} error={errors.work_setup} />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Location" error={errors.location}>
                                <div className="relative">
                                    <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={data.location} onChange={change('location')} placeholder="e.g. Manila, PH" className={`${inputClass(errors.location)} pl-9`} />
                                </div>
                            </Field>
                            <Field label="Salary range (monthly, USD)" error={errors.salary_min || errors.salary_max}>
                                <div className="flex items-center gap-2">
                                    {['salary_min', 'salary_max'].map((field, i) => (
                                        <div key={field} className="relative flex-1">
                                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                inputMode="numeric"
                                                aria-label={i ? 'Maximum salary' : 'Minimum salary'}
                                                value={data[field]}
                                                onChange={change(field)}
                                                placeholder={i ? 'Max' : 'Min'}
                                                className={`${inputClass(errors[field])} pl-7`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Field>
                        </div>
                    </Section>

                    <Section icon={Tag} title="Match tags & required skills" description="Applicants with matching tags are ranked higher in your approval feed.">
                        <TagInput
                            value={data.skills}
                            onChange={(skills) => {
                                setData('skills', skills);
                                clearErrors('skills');
                            }}
                            placeholder="Type a skill (e.g. typescript) and press Enter"
                            suggestions={skillSuggestions}
                            error={errors.skills}
                        />
                    </Section>

                    <Section icon={FileText} title="Description & expectations" description="What the role involves and who you're looking for.">
                        <Field label="Detailed description" error={errors.description}>
                            <textarea
                                rows="6"
                                value={data.description}
                                onChange={change('description')}
                                placeholder="Outline daily responsibilities, team culture and key objectives…"
                                className={inputClass(errors.description)}
                            />
                            <div className="mt-1 flex justify-end">
                                <Counter value={data.description} max={TEXT_MAX} />
                            </div>
                        </Field>
                        <Field label="Key requirements & qualifications" error={errors.requirements}>
                            <textarea
                                rows="5"
                                value={data.requirements}
                                onChange={change('requirements')}
                                placeholder={'- 3+ years of relevant experience\n- Strong communication skills'}
                                className={inputClass(errors.requirements)}
                            />
                            <div className="mt-1 flex justify-end">
                                <Counter value={data.requirements} max={TEXT_MAX} />
                            </div>
                        </Field>
                    </Section>
                </div>

                {/* Sticky side panel: preview, readiness and actions */}
                <aside className="space-y-6 lg:sticky lg:top-6">
                    <section className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60">
                        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <h3 className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                                <Eye className="h-4 w-4 text-brand" />
                                Live preview
                            </h3>
                            {editing && <StatusBadge status={data.status} />}
                        </header>
                        <div className="p-5">
                            <Preview data={data} />
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                            <Ring value={completion} />
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Post readiness</h3>
                                <p className="text-xs text-slate-500">{completion === 100 ? 'Ready to attract great matches.' : 'Complete posts get better matches.'}</p>
                            </div>
                        </div>
                        <ul className="space-y-2 px-5 py-4">
                            {checks.map((c) => (
                                <li key={c.label} className={`flex items-center gap-2 text-xs ${c.done ? 'font-medium text-slate-700' : 'text-slate-400'}`}>
                                    {c.done ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4" />}
                                    {c.label}
                                </li>
                            ))}
                        </ul>
                        <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 p-5">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand to-brand-dark px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
                            >
                                <Check className="h-4 w-4" />
                                {editing ? 'Save changes' : 'Save & publish job'}
                            </button>
                            {editing && data.status === 'closed' && (
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={save('published')}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-success-dark disabled:opacity-60"
                                >
                                    <Send className="h-4 w-4" />
                                    Reopen post
                                </button>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={save('draft')}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-60"
                                >
                                    <Save className="h-3.5 w-3.5" />
                                    Save draft
                                </button>
                                <Link
                                    href="/employer/jobs"
                                    className="inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </section>
                </aside>
            </form>
        </AppLayout>
    );
}
