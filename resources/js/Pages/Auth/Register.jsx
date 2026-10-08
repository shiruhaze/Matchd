import { Link, useForm } from '@inertiajs/react';
import { Briefcase, Building2 } from 'lucide-react';
import { Button, Field, inputClass } from '../../Components/ui';
import AuthLayout from '../../Layouts/AuthLayout';

const ROLES = [
    { value: 'Applicant', label: 'I am looking for a job', icon: Briefcase },
    { value: 'Employer', label: 'I am hiring', icon: Building2 },
];

export default function Register() {
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
        role: 'Applicant',
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

    return (
        <AuthLayout
            title="Create account"
            heading="Create your account"
            subtitle="Join Matchd as an applicant or an employer"
            footer={
                <>
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-brand hover:underline">
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} className="space-y-4" noValidate>
                <Field error={errors.role}>
                    <div className="grid grid-cols-2 gap-3">
                        {ROLES.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setData('role', value)}
                                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                                    data.role === value
                                        ? 'border-brand bg-brand/5 text-brand'
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </button>
                        ))}
                    </div>
                </Field>

                <Field label="Full Name" error={errors.name} required>
                    <input type="text" value={data.name} onChange={change('name')} autoComplete="name" className={inputClass(errors.name)} />
                </Field>

                {data.role === 'Employer' && (
                    <Field label="Company Name" error={errors.company_name} required>
                        <input
                            type="text"
                            value={data.company_name}
                            onChange={change('company_name')}
                            className={inputClass(errors.company_name)}
                        />
                    </Field>
                )}

                <Field label="Email Address" error={errors.email} required>
                    <input type="email" value={data.email} onChange={change('email')} autoComplete="email" className={inputClass(errors.email)} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Password" error={errors.password} required>
                        <input
                            type="password"
                            value={data.password}
                            onChange={change('password')}
                            autoComplete="new-password"
                            className={inputClass(errors.password)}
                        />
                    </Field>
                    <Field label="Confirm Password" required>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={change('password_confirmation')}
                            autoComplete="new-password"
                            className={inputClass()}
                        />
                    </Field>
                </div>

                <Button type="submit" disabled={processing} className="w-full py-3 text-sm">
                    Create Account
                </Button>
            </form>
        </AuthLayout>
    );
}
