import { useForm } from '@inertiajs/react';
import { Building2, Camera, Check, CheckCircle2, Circle, FileText, GitBranch, Globe, House, Laptop, MapPin, Phone, Settings2, Sparkles, UploadCloud, UserRound } from 'lucide-react';
import { useRef } from 'react';
import TagInput from '../../Components/TagInput';
import { HeaderAction } from '../../Components/PageHeader';
import { FieldSelect } from '../../Components/Popover';
import { Field, inputClass } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { initials } from '../../lib/utils';

const panel = 'rounded-3xl border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60';

/** Text input with a small leading icon (or a text prefix like "$"). */
function IconInput({ icon: Icon, prefix, error, className = '', ...props }) {
    return (
        <div className="relative">
            {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />}
            {prefix && <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-slate-400">{prefix}</span>}
            <input {...props} className={`${inputClass(error)} pl-9 ${className}`} />
        </div>
    );
}

/** Card heading with a small icon tile. */
function SectionTitle({ icon: Icon, children, aside }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h2 className="flex items-center gap-2.5 text-sm font-bold text-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="h-4 w-4" />
                </span>
                {children}
            </h2>
            {aside}
        </div>
    );
}

const SETUP_OPTIONS = [
    { value: 'remote', label: 'Remote only', description: 'Work from anywhere', icon: Laptop },
    { value: 'hybrid', label: 'Hybrid', description: 'Mix of office and home', icon: House },
    { value: 'onsite', label: 'On-site', description: 'Work at the office', icon: Building2 },
];

export default function Profile({ profile, completion }) {
    const resumeInput = useRef(null);
    const { data, setData, post, processing, errors, clearErrors, transform } = useForm({
        name: profile.name,
        headline: profile.headline ?? '',
        location: profile.location ?? '',
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
        github_url: profile.github_url ?? '',
        portfolio_url: profile.portfolio_url ?? '',
        preferred_setup: profile.preferred_setup,
        expected_salary: profile.expected_salary ?? '',
        open_to_work: profile.open_to_work,
        skills: profile.skills,
        resume: null,
    });

    const change = (field) => (event) => {
        setData(field, event.target.value);
        clearErrors(field);
    };

    // Files need multipart; Laravel reads the spoofed method.
    transform((payload) => ({ ...payload, _method: 'put' }));

    const submit = (event) => {
        event.preventDefault();
        post('/applicant/profile', { forceFormData: true, preserveScroll: true, onSuccess: () => setData('resume', null) });
    };

    return (
        <AppLayout
            title="My Profile & Skills"
            header={{
                eyebrow: 'Applicant · Profile',
                eyebrowIcon: UserRound,
                title: 'Profile & Skill Tags',
                subtitle: `Your profile is ${completion.percent}% complete. The more skills you tag, the better your job matches.`,
                actions: (
                    // The banner sits outside the form, so the button targets it by id.
                    <HeaderAction type="submit" form="profile-form" icon={Check} disabled={processing}>
                        Save changes
                    </HeaderAction>
                ),
            }}
        >
            <form id="profile-form" onSubmit={submit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <section className={`${panel} space-y-6 p-6`}>
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                                <div className="relative">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-success text-2xl font-bold text-white shadow-lg shadow-success/20">
                                        {initials(data.name)}
                                    </div>
                                    <span className="absolute -right-1 -bottom-1 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm">
                                        <Camera className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-lg font-bold text-slate-900">{data.name || 'Your name'}</h2>
                                    <p className="text-xs text-slate-500">
                                        {data.headline || 'Add a headline'} {data.location && <>&bull; {data.location}</>}
                                    </p>
                                    <label className="inline-flex cursor-pointer items-center gap-2 pt-1 text-xs font-semibold text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={data.open_to_work}
                                            onChange={(e) => setData('open_to_work', e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        {/* Switch */}
                                        <span className="relative h-5 w-9 rounded-full bg-slate-200 transition peer-checked:bg-success peer-focus-visible:ring-4 peer-focus-visible:ring-success/20 after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-4" />
                                        {data.open_to_work ? 'Open to opportunities' : 'Not looking right now'}
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Full Name" error={errors.name} required>
                                    <input type="text" value={data.name} onChange={change('name')} className={inputClass(errors.name)} />
                                </Field>
                                <Field label="Headline / Role Title" error={errors.headline}>
                                    <input type="text" value={data.headline} onChange={change('headline')} className={inputClass(errors.headline)} />
                                </Field>
                                <Field label="Email Address" hint="Email is your login and can't be changed here.">
                                    <input type="email" value={profile.email} disabled className={`${inputClass()} opacity-60`} />
                                </Field>
                                <Field label="Phone Number" error={errors.phone}>
                                    <IconInput icon={Phone} type="tel" value={data.phone} onChange={change('phone')} error={errors.phone} />
                                </Field>
                                <Field label="Location" error={errors.location}>
                                    <IconInput icon={MapPin} type="text" value={data.location} onChange={change('location')} error={errors.location} />
                                </Field>
                            </div>

                            <Field label="Professional Bio" error={errors.bio}>
                                <textarea rows="3" value={data.bio} onChange={change('bio')} className={`${inputClass(errors.bio)} resize-none`} />
                            </Field>
                        </section>

                        <section className={`${panel} space-y-4 p-6`}>
                            <SectionTitle icon={Sparkles} aside={<span className="text-xs text-slate-400">Used for Matchd scoring</span>}>
                                Primary skills & technical tags
                            </SectionTitle>
                            <TagInput
                                value={data.skills}
                                onChange={(skills) => setData('skills', skills)}
                                placeholder="Type a skill tag (e.g. nextjs) and press enter..."
                                error={errors.skills}
                            />
                        </section>

                        <section className={`${panel} space-y-4 p-6`}>
                            <SectionTitle icon={FileText}>Resume & online portfolios</SectionTitle>

                            <button
                                type="button"
                                onClick={() => resumeInput.current?.click()}
                                className={`group w-full space-y-2 rounded-2xl border-2 border-dashed bg-slate-50/50 p-6 text-center transition hover:border-brand/50 hover:bg-brand/5 ${
                                    errors.resume ? 'border-red-300' : 'border-slate-200'
                                }`}
                            >
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand transition group-hover:scale-110">
                                    <UploadCloud className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-bold text-slate-800">Upload Updated Resume / CV</p>
                                <p className="text-[11px] text-slate-400">PDF or DOCX (Max size: 5MB)</p>
                                {(data.resume || profile.resume_name) && (
                                    <span className="inline-block bg-white text-slate-700 border border-slate-200 text-[11px] font-semibold px-3 py-1 rounded-lg">
                                        {data.resume ? `Selected: ${data.resume.name}` : `Current file: ${profile.resume_name}`}
                                    </span>
                                )}
                            </button>
                            <input
                                ref={resumeInput}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={(e) => {
                                    setData('resume', e.target.files[0] ?? null);
                                    clearErrors('resume');
                                }}
                            />
                            {errors.resume && <p className="text-xs text-red-600">{errors.resume}</p>}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <Field label="GitHub Profile" error={errors.github_url}>
                                    <IconInput icon={GitBranch} type="url" value={data.github_url} onChange={change('github_url')} placeholder="https://github.com/you" error={errors.github_url} />
                                </Field>
                                <Field label="Portfolio / Website" error={errors.portfolio_url}>
                                    <IconInput icon={Globe} type="url" value={data.portfolio_url} onChange={change('portfolio_url')} placeholder="https://your-site.com" error={errors.portfolio_url} />
                                </Field>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                        <section className={`${panel} space-y-4 p-6`}>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-900">Profile Match Index</h3>
                                <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">{completion.percent}% Complete</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="h-2 rounded-full bg-linear-to-r from-brand to-indigo-500 transition-all duration-700" style={{ width: `${completion.percent}%` }} />
                            </div>
                            <p className="text-xs text-slate-500">
                                Profiles above 90% receive <strong className="text-slate-800">more interview invites</strong> from employers.
                            </p>
                            <p className="pt-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                                {completion.checks.filter((c) => c.done).length} of {completion.checks.length} done
                            </p>
                            <div className="space-y-2 text-xs">
                                {completion.checks.map((check) => (
                                    <div key={check.label} className={`flex items-center gap-2 ${check.done ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                                        {check.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />}
                                        {check.label}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={`${panel} space-y-4 p-6`}>
                            <SectionTitle icon={Settings2}>Job match preferences</SectionTitle>
                            <Field label="Preferred Work Setup" error={errors.preferred_setup}>
                                <FieldSelect
                                    label="Preferred work setup"
                                    options={SETUP_OPTIONS}
                                    value={data.preferred_setup}
                                    onChange={(value) => {
                                        setData('preferred_setup', value);
                                        clearErrors('preferred_setup');
                                    }}
                                    error={errors.preferred_setup}
                                />
                            </Field>
                            <Field label="Expected Monthly Salary (USD)" error={errors.expected_salary}>
                                <IconInput
                                    prefix="$"
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    value={data.expected_salary}
                                    onChange={change('expected_salary')}
                                    error={errors.expected_salary}
                                />
                            </Field>
                        </section>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
