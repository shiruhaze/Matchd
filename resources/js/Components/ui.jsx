import { initials } from '../lib/utils';

export const inputClass = (error) =>
    `w-full px-3.5 py-2 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white transition ${
        error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-brand'
    }`;

export function Card({ className = '', children }) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs ${className}`}>
            {children}
        </div>
    );
}

export function PageTitle({ title, subtitle, children }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

const TONES = {
    brand: 'bg-brand/10 text-brand',
    success: 'bg-success/10 text-success',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-100 text-slate-600',
};

export function StatCard({ icon: Icon, label, value, tone = 'brand' }) {
    return (
        <Card className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${TONES[tone]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </Card>
    );
}

const STATUS = {
    pending: ['Pending Approval', 'bg-amber-50 text-amber-700 border-amber-200/60', 'bg-amber-500'],
    under_review: ['Under Review', 'bg-amber-50 text-amber-700 border-amber-200/60', 'bg-amber-500'],
    interview_scheduled: ['Interview Scheduled', 'bg-success/10 text-success border-success/20', 'bg-success'],
    declined: ['Declined', 'bg-red-50 text-red-600 border-red-200/60', 'bg-red-500'],
    draft: ['Draft', 'bg-slate-100 text-slate-600 border-slate-200', 'bg-slate-400'],
    published: ['Active', 'bg-success/10 text-success border-success/20', 'bg-success'],
    closed: ['Closed', 'bg-red-50 text-red-600 border-red-200/60', 'bg-red-500'],
};

export function StatusBadge({ status }) {
    const [label, classes, dot] = STATUS[status] ?? [status, 'bg-slate-100 text-slate-600 border-slate-200', 'bg-slate-400'];

    return (
        <span className={`${classes} border text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {label}
        </span>
    );
}

export function SkillChip({ children, onRemove, solid = false }) {
    return (
        <span
            className={`text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${
                solid ? 'bg-brand/10 text-brand border border-brand/20' : 'bg-slate-100 text-slate-600 font-medium'
            }`}
        >
            {children}
            {onRemove && (
                <button type="button" onClick={onRemove} className="hover:text-red-500" aria-label={`Remove ${children}`}>
                    &times;
                </button>
            )}
        </span>
    );
}

const AVATAR_TONES = ['bg-blue-50 text-brand border-blue-100', 'bg-purple-50 text-purple-600 border-purple-100', 'bg-slate-900 text-white border-slate-900', 'bg-emerald-50 text-emerald-700 border-emerald-100'];

export function CompanyAvatar({ name, size = 'w-10 h-10' }) {
    const tone = AVATAR_TONES[(name?.length ?? 0) % AVATAR_TONES.length];

    return (
        <div className={`${size} rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 ${tone}`}>
            {initials(name)}
        </div>
    );
}

export function Field({ label, error, required, children, hint }) {
    return (
        <div>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            {children}
            {hint && !error && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
    const variants = {
        primary: 'bg-brand hover:bg-brand-dark text-white shadow-sm',
        success: 'bg-success hover:bg-success-dark text-white',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
        danger: 'bg-red-50 hover:bg-red-100 text-red-600',
    };

    return (
        <button
            {...props}
            className={`${variants[variant]} font-semibold text-xs px-4 py-2 rounded-xl transition inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );
}

export function Tabs({ tabs, value, onChange }) {
    return (
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-medium text-slate-600 shrink-0">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onChange(tab.value)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                        value === tab.value ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export function EmptyState({ icon: Icon, title, children }) {
    return (
        <Card className="p-10 text-center space-y-2">
            {Icon && <Icon className="w-8 h-8 text-slate-300 mx-auto" />}
            <p className="text-sm font-bold text-slate-700">{title}</p>
            {children && <p className="text-xs text-slate-500">{children}</p>}
        </Card>
    );
}
