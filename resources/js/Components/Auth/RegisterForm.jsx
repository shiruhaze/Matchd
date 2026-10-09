import { useForm } from '@inertiajs/react';
import { ArrowRight, Briefcase, Building2, Mail, User } from 'lucide-react';
import { AuthField, FormHeading, PasswordInput, Stagger, SubmitButton, TextInput } from './fields';

const ROLES = [
    { value: 'Applicant', label: 'I want a job', icon: Briefcase },
    { value: 'Employer', label: "I'm hiring", icon: Building2 },
];

/** Allows links like /register?role=Employer to preselect the account type. */
const initialRole = () => {
    const role = new URLSearchParams(window.location.search).get('role');
    return ROLES.some((r) => r.value === role) ? role : 'Applicant';
};

/** Client-side hint only; the server's password rules remain the source of truth. */
const STRENGTH = [
    { label: 'Too short', bar: 'bg-red-400', text: 'text-red-500' },
    { label: 'Weak', bar: 'bg-red-400', text: 'text-red-500' },
    { label: 'Fair', bar: 'bg-amber-400', text: 'text-amber-600' },
    { label: 'Good', bar: 'bg-lime-500', text: 'text-lime-700' },
    { label: 'Strong', bar: 'bg-success', text: 'text-success' },
];

const passwordScore = (pw) => {
    if (pw.length < 8) return 0;
    return 1 + [/[a-z]/.test(pw) && /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw) || pw.length >= 14].filter(Boolean).length;
};

export default function RegisterForm({ onSwitch }) {
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
        role: initialRole(),
        name: '',
        company_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const change = (field) => (event) => {
        setData(field, event.target.value);
        clearErrors(field);
    };

    const submit = (event) => {
        event.preventDefault();
        post('/register', { onFinish: () => reset('password', 'password_confirmation') });
    };

    const isEmployer = data.role === 'Employer';
    const score = passwordScore(data.password);
    const strength = STRENGTH[score];

    return (
        <form onSubmit={submit} noValidate className="w-full">
            <FormHeading eyebrow="Sign up" title="Create your account" subtitle="Join Matchd as an applicant or an employer." />

            <div className="space-y-4 short:space-y-3">
                {/* Role picker: sliding highlight behind the selected option */}
                <Stagger i={1}>
                    <div role="radiogroup" aria-label="Account type" className="relative grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-slate-100/70 p-1">
                        <span
                            aria-hidden="true"
                            className={`absolute inset-y-1 left-1 w-[calc(50%-0.375rem)] rounded-xl bg-white shadow-md shadow-slate-900/5 ring-1 ring-brand/20 transition-transform duration-500 ease-slide motion-reduce:transition-none ${
                                isEmployer ? 'translate-x-[calc(100%+0.25rem)]' : 'translate-x-0'
                            }`}
                        />
                        {ROLES.map(({ value, label, icon: Icon }) => {
                            const selected = data.role === value;

                            return (
                                <button
                                    key={value}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => {
                                        setData('role', value);
                                        clearErrors('role');
                                    }}
                                    className={`relative z-10 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs short:py-2 font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
                                        selected ? 'text-brand' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    {errors.role && <p className="mt-1.5 text-xs text-red-600">{errors.role}</p>}
                </Stagger>

                <Stagger i={2}>
                    <AuthField label="Full name" error={errors.name} required>
                        <TextInput icon={User} value={data.name} onChange={change('name')} placeholder="Juan Dela Cruz" autoComplete="name" />
                    </AuthField>
                </Stagger>

                {/* Company name expands in for employers only (grid-rows 0fr -> 1fr). -mt-4 cancels the gap while collapsed. */}
                <div
                    className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-slide motion-reduce:transition-none ${
                        isEmployer ? 'grid-rows-[1fr] opacity-100' : '-mt-4 grid-rows-[0fr] opacity-0 short:-mt-3'
                    }`}
                    inert={!isEmployer}
                >
                    <div className="overflow-hidden">
                        <AuthField label="Company name" error={errors.company_name} required>
                            <TextInput icon={Building2} value={data.company_name} onChange={change('company_name')} placeholder="Acme Inc." autoComplete="organization" />
                        </AuthField>
                    </div>
                </div>

                <Stagger i={3}>
                    <AuthField label="Email address" error={errors.email} required>
                        <TextInput icon={Mail} type="email" value={data.email} onChange={change('email')} placeholder="you@example.com" autoComplete="email" />
                    </AuthField>
                </Stagger>

                <Stagger i={4}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AuthField label="Password" error={errors.password} required>
                            <PasswordInput value={data.password} onChange={change('password')} autoComplete="new-password" />
                        </AuthField>
                        <AuthField label="Confirm password" required>
                            <PasswordInput value={data.password_confirmation} onChange={change('password_confirmation')} autoComplete="new-password" />
                        </AuthField>
                    </div>

                    {/* Strength meter slides open once the user starts typing a password */}
                    <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                            data.password ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                        aria-live="polite"
                    >
                        <div className="overflow-hidden">
                            <div className="flex items-center gap-3 pt-2.5 short:pt-1.5">
                                <div className="grid flex-1 grid-cols-4 gap-1.5">
                                    {[1, 2, 3, 4].map((n) => (
                                        <span key={n} className={`h-1.5 rounded-full transition-colors duration-300 ${score >= n ? strength.bar : 'bg-slate-200'}`} />
                                    ))}
                                </div>
                                <span className={`w-16 text-right text-[11px] font-semibold ${strength.text}`}>{strength.label}</span>
                            </div>
                        </div>
                    </div>
                </Stagger>

                <Stagger i={5}>
                    <SubmitButton processing={processing}>
                        Create account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </SubmitButton>
                </Stagger>
            </div>

            <Stagger i={6}>
                <p className="mt-6 text-center text-xs text-slate-500 short:mt-4">
                    Already have an account?{' '}
                    <button type="button" onClick={onSwitch} className="font-semibold text-brand hover:underline">
                        Log in
                    </button>
                </p>
            </Stagger>
        </form>
    );
}
