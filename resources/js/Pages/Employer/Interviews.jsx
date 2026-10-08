import { router, useForm } from '@inertiajs/react';
import { CalendarPlus, Clock, Mail, UserCheck, X } from 'lucide-react';
import { Button, Card, Field, PageTitle, inputClass } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';

export default function Interviews({ candidates, upcoming, selectedApplication }) {
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
        application_id: selectedApplication ?? candidates[0]?.id ?? '',
        round: 'initial',
        date: '',
        time: '10:00',
        duration_minutes: '30',
        meeting_link: '',
        note: '',
    });

    const change = (field) => (event) => {
        setData(field, event.target.value);
        clearErrors(field);
    };

    const submit = (event) => {
        event.preventDefault();
        post('/employer/interviews', { preserveScroll: true, onSuccess: () => reset('date', 'meeting_link', 'note') });
    };

    const cancel = (interview) => {
        if (window.confirm(`Cancel the interview with ${interview.applicant}?`)) {
            router.delete(`/employer/interviews/${interview.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Set Interview">
            <PageTitle title="Schedule an Interview" subtitle="Send calendar invites and video meeting links to candidates." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={submit} className="lg:col-span-2 space-y-6" noValidate>
                    <Card className="p-6 space-y-4">
                        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-brand" /> Candidate & Interview Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Select Candidate" error={errors.application_id} required>
                                <select value={data.application_id} onChange={change('application_id')} className={inputClass(errors.application_id)}>
                                    {candidates.length === 0 && <option value="">No candidates yet</option>}
                                    {candidates.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Interview Round" error={errors.round}>
                                <select value={data.round} onChange={change('round')} className={inputClass(errors.round)}>
                                    <option value="initial">Initial HR Screening</option>
                                    <option value="technical">Technical Assessment</option>
                                    <option value="final">Final Executive Interview</option>
                                </select>
                            </Field>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-brand" /> Date & Logistics
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="Date" error={errors.date} required>
                                <input type="date" value={data.date} onChange={change('date')} className={inputClass(errors.date)} />
                            </Field>
                            <Field label="Start Time" error={errors.time} required>
                                <input type="time" value={data.time} onChange={change('time')} className={inputClass(errors.time)} />
                            </Field>
                            <Field label="Duration" error={errors.duration_minutes}>
                                <select value={data.duration_minutes} onChange={change('duration_minutes')} className={inputClass(errors.duration_minutes)}>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">1 hour</option>
                                </select>
                            </Field>
                        </div>
                        <Field label="Meeting Location / Video Link" error={errors.meeting_link}>
                            <input
                                type="url"
                                value={data.meeting_link}
                                onChange={change('meeting_link')}
                                placeholder="https://meet.google.com/abc-defg-hij"
                                className={inputClass(errors.meeting_link)}
                            />
                        </Field>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-brand" /> Invite Details
                        </h2>
                        <Field label="Note for Candidate" error={errors.note}>
                            <textarea
                                rows="3"
                                value={data.note}
                                onChange={change('note')}
                                placeholder="Please bring your portfolio or be prepared to share your screen..."
                                className={inputClass(errors.note)}
                            />
                        </Field>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing || candidates.length === 0} className="px-6 py-2.5 shadow-md shadow-brand/20">
                            <CalendarPlus className="w-4 h-4" /> Send Interview Invitation
                        </Button>
                    </div>
                </form>

                <Card className="p-6 space-y-4 h-fit">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-900 text-sm">Upcoming Schedule</h3>
                        <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">{upcoming.length} Confirmed</span>
                    </div>
                    {upcoming.length === 0 && <p className="text-xs text-slate-500">No interviews scheduled.</p>}
                    <div className="space-y-3">
                        {upcoming.map((i) => (
                            <div key={i.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900">{i.applicant}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i.is_today ? 'bg-brand/10 text-brand' : 'bg-slate-200 text-slate-600'}`}>
                                            {i.day}
                                        </span>
                                        <button type="button" onClick={() => cancel(i)} className="text-slate-400 hover:text-red-500" aria-label="Cancel interview">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">{i.job}</p>
                                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {i.time_range}
                                    </span>
                                    {i.link && <span className="text-success font-semibold">Video call</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
