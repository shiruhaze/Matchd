import { useForm } from '@inertiajs/react';
import { Camera, Check, CheckCircle2, Circle, FileText, Sparkles, UploadCloud } from 'lucide-react';
import { useRef } from 'react';
import TagInput from '../../Components/TagInput';
import { Button, Card, Field, PageTitle, inputClass } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';
import { initials } from '../../lib/utils';

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
        <AppLayout title="My Profile & Skills">
            <form onSubmit={submit} className="space-y-6" noValidate>
                <PageTitle title="Profile & Skill Tags" subtitle="Keep your credentials updated so our matching pairs you with the right opportunities.">
                    <Button type="submit" disabled={processing} className="px-5 py-2.5 shadow-md">
                        <Check className="w-4 h-4" /> Save Profile Changes
                    </Button>
                </PageTitle>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                                        {initials(data.name)}
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-lg border border-slate-200 text-slate-400">
                                        <Camera className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-lg font-bold text-slate-900">{data.name || 'Your name'}</h2>
                                    <p className="text-xs text-slate-500">
                                        {data.headline || 'Add a headline'} {data.location && <>&bull; {data.location}</>}
                                    </p>
                                    <label className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200/60 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.open_to_work}
                                            onChange={(e) => setData('open_to_work', e.target.checked)}
                                            className="w-3 h-3"
                                        />
                                        Open to Opportunities
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
                                    <input type="tel" value={data.phone} onChange={change('phone')} className={inputClass(errors.phone)} />
                                </Field>
                                <Field label="Location" error={errors.location}>
                                    <input type="text" value={data.location} onChange={change('location')} className={inputClass(errors.location)} />
                                </Field>
                            </div>

                            <Field label="Professional Bio" error={errors.bio}>
                                <textarea rows="3" value={data.bio} onChange={change('bio')} className={`${inputClass(errors.bio)} resize-none`} />
                            </Field>
                        </Card>

                        <Card className="p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-brand" /> Primary Skills & Technical Tags
                                </h2>
                                <span className="text-xs text-slate-400">Used for Matchd scoring</span>
                            </div>
                            <TagInput
                                value={data.skills}
                                onChange={(skills) => setData('skills', skills)}
                                placeholder="Type a skill tag (e.g. nextjs) and press enter..."
                                error={errors.skills}
                            />
                        </Card>

                        <Card className="p-6 space-y-4">
                            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-brand" /> Resume & Online Portfolios
                            </h2>

                            <button
                                type="button"
                                onClick={() => resumeInput.current?.click()}
                                className={`w-full border-2 border-dashed rounded-2xl p-5 text-center bg-slate-50/50 hover:border-brand/50 transition space-y-2 ${
                                    errors.resume ? 'border-red-300' : 'border-slate-200'
                                }`}
                            >
                                <div className="w-10 h-10 bg-blue-50 text-brand rounded-xl mx-auto flex items-center justify-center">
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
                                    <input type="url" value={data.github_url} onChange={change('github_url')} className={inputClass(errors.github_url)} />
                                </Field>
                                <Field label="Portfolio / Website" error={errors.portfolio_url}>
                                    <input type="url" value={data.portfolio_url} onChange={change('portfolio_url')} className={inputClass(errors.portfolio_url)} />
                                </Field>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="font-bold text-slate-900 text-sm">Profile Match Index</h3>
                                <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">{completion.percent}% Complete</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-brand h-2 rounded-full transition-all" style={{ width: `${completion.percent}%` }} />
                            </div>
                            <p className="text-xs text-slate-500">
                                Profiles above 90% receive <strong className="text-slate-800">more interview invites</strong> from employers.
                            </p>
                            <div className="space-y-2 pt-2 text-xs">
                                {completion.checks.map((check) => (
                                    <div key={check.label} className={`flex items-center gap-2 ${check.done ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                                        {check.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />}
                                        {check.label}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6 space-y-4">
                            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Job Match Preferences</h3>
                            <Field label="Preferred Work Setup" error={errors.preferred_setup}>
                                <select value={data.preferred_setup} onChange={change('preferred_setup')} className={inputClass(errors.preferred_setup)}>
                                    <option value="remote">Remote Only</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="onsite">On-Site</option>
                                </select>
                            </Field>
                            <Field label="Expected Monthly Salary (USD)" error={errors.expected_salary}>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.expected_salary}
                                    onChange={change('expected_salary')}
                                    className={inputClass(errors.expected_salary)}
                                />
                            </Field>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
