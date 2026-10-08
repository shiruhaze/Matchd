import { CalendarDays, Clock, Video } from 'lucide-react';
import { useState } from 'react';
import { Card, CompanyAvatar, EmptyState, PageTitle, Tabs } from '../../Components/ui';
import AppLayout from '../../Layouts/AppLayout';

function InterviewCard({ interview, past }) {
    return (
        <Card className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <CompanyAvatar name={interview.company} size="w-12 h-12" />
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-base">{interview.title}</h4>
                            <span className="bg-success/10 text-success border border-success/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                {interview.round}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {interview.company} &bull; {interview.at} &bull; {interview.duration} min
                        </p>
                    </div>
                </div>
                {!past && interview.link && (
                    <a
                        href={interview.link}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-success hover:bg-success-dark text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                    >
                        <Video className="w-3.5 h-3.5" /> Join Call
                    </a>
                )}
                {past && interview.status === 'cancelled' && (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">Cancelled</span>
                )}
            </div>

            {interview.note && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">Recruiter Instruction:</p>
                    <p>{interview.note}</p>
                </div>
            )}
        </Card>
    );
}

export default function Interviews({ upcoming, completed }) {
    const [tab, setTab] = useState('upcoming');
    const today = upcoming.find((i) => i.is_today);
    const list = tab === 'upcoming' ? upcoming : completed;

    return (
        <AppLayout title="Interviews" width="max-w-6xl">
            <PageTitle title="Interview Schedule" subtitle="Manage video meeting links, interviewer notes, and schedule requests.">
                <Tabs
                    value={tab}
                    onChange={setTab}
                    tabs={[
                        { value: 'upcoming', label: `Upcoming (${upcoming.length})` },
                        { value: 'completed', label: 'Completed' },
                    ]}
                />
            </PageTitle>

            {tab === 'upcoming' && today && (
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-success/90 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-3 max-w-xl">
                        <div className="flex items-center gap-2">
                            <span className="bg-success text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> Starting Today
                            </span>
                            <span className="text-xs text-slate-300">{today.time_range}</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{today.title} Interview</h2>
                            <p className="text-xs text-slate-300 mt-0.5">
                                {today.company} &bull; {today.round}
                            </p>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-green-300" /> {today.duration} minutes
                        </span>
                    </div>
                    {today.link && (
                        <a
                            href={today.link}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-success hover:bg-success-dark text-white font-semibold text-xs px-5 py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <Video className="w-4 h-4" /> Join Meeting Room
                        </a>
                    )}
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-brand" />
                    {tab === 'upcoming' ? 'Upcoming Meetings' : 'Past Meetings'}
                </h3>
                {list.length === 0 && <EmptyState icon={CalendarDays} title="No interviews to show" />}
                {list.map((interview) => (
                    <InterviewCard key={interview.id} interview={interview} past={tab === 'completed'} />
                ))}
            </div>
        </AppLayout>
    );
}
