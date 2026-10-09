import { Link, useForm } from '@inertiajs/react';
import { ArrowRight, Mail } from 'lucide-react';
import { AuthField, FormHeading, PasswordInput, Stagger, SubmitButton, TextInput } from './fields';

export default function LoginForm({ onSwitch }) {
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const change = (field) => (event) => {
        setData(field, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
        clearErrors(field);
    };

    const submit = (event) => {
        event.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    return (
        <form onSubmit={submit} noValidate className="w-full">
            <FormHeading eyebrow="Log in" title="Welcome back" subtitle="Enter your credentials to access your account." />

            <div className="space-y-4 short:space-y-3">
                <Stagger i={1}>
                    <AuthField label="Email address" error={errors.email}>
                        <TextInput
                            icon={Mail}
                            type="email"
                            value={data.email}
                            onChange={change('email')}
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </AuthField>
                </Stagger>

                <Stagger i={2}>
                    <AuthField
                        label="Password"
                        error={errors.password}
                        aside={
                            <Link href="/forgot-password" className="text-xs font-medium text-brand hover:underline">
                                Forgot password?
                            </Link>
                        }
                    >
                        <PasswordInput value={data.password} onChange={change('password')} autoComplete="current-password" />
                    </AuthField>
                </Stagger>

                <Stagger i={3}>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 select-none">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={change('remember')}
                            className="h-4 w-4 rounded border-slate-300 accent-brand"
                        />
                        Remember me on this device
                    </label>
                </Stagger>

                <Stagger i={4}>
                    <SubmitButton processing={processing}>
                        Log in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </SubmitButton>
                </Stagger>
            </div>

            <Stagger i={5}>
                <p className="mt-6 text-center text-xs text-slate-500 short:mt-4">
                    Don&apos;t have an account yet?{' '}
                    <button type="button" onClick={onSwitch} className="font-semibold text-brand hover:underline">
                        Sign up
                    </button>
                </p>
            </Stagger>
        </form>
    );
}
