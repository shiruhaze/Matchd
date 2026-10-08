import { Link, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Button, Field, inputClass } from '../../Components/ui';
import AuthLayout from '../../Layouts/AuthLayout';

export default function Login() {
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
        <AuthLayout
            title="Sign in"
            heading="Welcome back"
            subtitle="Please enter your credentials to access your account"
            footer={
                <>
                    Don&apos;t have an account yet?{' '}
                    <Link href="/register" className="font-semibold text-brand hover:underline">
                        Create an account
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} className="space-y-5" noValidate>
                <Field label="Email Address" error={errors.email}>
                    <input
                        type="email"
                        value={data.email}
                        onChange={change('email')}
                        placeholder="e.g. hr@mcorp.io or john.doe@example.com"
                        autoComplete="email"
                        className={inputClass(errors.email)}
                    />
                </Field>

                <Field label="Password" error={errors.password}>
                    <input
                        type="password"
                        value={data.password}
                        onChange={change('password')}
                        autoComplete="current-password"
                        className={inputClass(errors.password)}
                    />
                    <div className="text-right mt-1">
                        <Link href="/forgot-password" className="text-xs font-medium text-brand hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </Field>

                <label className="flex items-center text-xs text-slate-600 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={change('remember')}
                        className="h-4 w-4 text-brand border-slate-300 rounded mr-2"
                    />
                    Remember me on this device
                </label>

                <Button type="submit" disabled={processing} className="w-full py-3 text-sm">
                    Sign In <ArrowRight className="w-4 h-4" />
                </Button>
            </form>
        </AuthLayout>
    );
}
