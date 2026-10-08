import { Link, useForm } from '@inertiajs/react';
import { Briefcase, Check, FileText, Send, Tag } from 'lucide-react';
import TagInput from '../../../Components/TagInput';
import { Button, Card, Field, PageTitle, inputClass } from '../../../Components/ui';
import AppLayout from '../../../Layouts/AppLayout';

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

    return (
        <AppLayout title={editing ? 'Edit Job' : 'Create a Job'} width="max-w-4xl">
            <PageTitle
                title={editing ? 'Edit Job Post' : 'Post a New Job Opportunity'}
                subtitle="Define job requirements and skills to automatically match with qualified candidates."
            />

            <form onSubmit={save(editing ? data.status : 'published')} className="space-y-6" noValidate>
                <Card className="p-6 space-y-4">
                    <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-brand" /> Job Details
                    </h2>

                    <Field label="Job Title" error={errors.title} required>
                        <input type="text" value={data.title} onChange={change('title')} placeholder="e.g. Senior Frontend Engineer" className={inputClass(errors.title)} />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Employment Type" error={errors.employment_type}>
                            <select value={data.employment_type} onChange={change('employment_type')} className={inputClass(errors.employment_type)}>
                                <option value="full-time">Full-Time</option>
                                <option value="part-time">Part-Time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                            </select>
                        </Field>
                        <Field label="Work Setup" error={errors.work_setup}>
                            <select value={data.work_setup} onChange={change('work_setup')} className={inputClass(errors.work_setup)}>
                                <option value="remote">Remote</option>
                                <option value="hybrid">Hybrid</option>
                                <option value="onsite">On-Site</option>
                            </select>
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Location" error={errors.location}>
                            <input type="text" value={data.location} onChange={change('location')} placeholder="e.g. Manila, Philippines or Remote" className={inputClass(errors.location)} />
                        </Field>
                        <Field label="Salary Range (Monthly, USD)" error={errors.salary_min || errors.salary_max}>
                            <div className="flex items-center gap-2">
                                <input type="number" min="0" value={data.salary_min} onChange={change('salary_min')} placeholder="Min" className={inputClass(errors.salary_min)} />
                                <span className="text-slate-400 text-xs">-</span>
                                <input type="number" min="0" value={data.salary_max} onChange={change('salary_max')} placeholder="Max" className={inputClass(errors.salary_max)} />
                            </div>
                        </Field>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-brand" /> Match Tags & Required Skills
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Applicants with matching tags are prioritized in your approval feed.</p>
                    </div>
                    <TagInput
                        value={data.skills}
                        onChange={(skills) => setData('skills', skills)}
                        placeholder="Type skill tag (e.g. typescript) and press Enter..."
                        suggestions={skillSuggestions}
                        error={errors.skills}
                    />
                </Card>

                <Card className="p-6 space-y-4">
                    <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand" /> Job Description & Expectations
                    </h2>
                    <Field label="Detailed Description" error={errors.description}>
                        <textarea
                            rows="5"
                            value={data.description}
                            onChange={change('description')}
                            placeholder="Outline daily responsibilities, team culture, and key objectives..."
                            className={inputClass(errors.description)}
                        />
                    </Field>
                    <Field label="Key Requirements & Qualifications" error={errors.requirements}>
                        <textarea rows="4" value={data.requirements} onChange={change('requirements')} className={inputClass(errors.requirements)} />
                    </Field>
                </Card>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <Link href="/employer/jobs" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition">
                        Cancel
                    </Link>
                    <Button type="button" variant="secondary" disabled={processing} onClick={save('draft')} className="px-5 py-2.5">
                        Save Draft
                    </Button>
                    {editing && data.status === 'closed' && (
                        <Button type="button" variant="secondary" disabled={processing} onClick={save('published')} className="px-5 py-2.5">
                            <Send className="w-4 h-4" /> Reopen
                        </Button>
                    )}
                    <Button type="submit" disabled={processing} className="px-6 py-2.5 shadow-md shadow-brand/20">
                        <Check className="w-4 h-4" /> {editing ? 'Save Changes' : 'Save & Publish Job'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
