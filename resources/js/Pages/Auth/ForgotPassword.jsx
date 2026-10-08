import { Link, useForm } from '@inertiajs/react';
import { Button, Field, inputClass } from '../../Components/ui';
import AuthLayout from '../../Layouts/AuthLayout';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({ email: '' });

    const submit = (event) => {
        event.preventDefault();
        post('/forgot-password');
    };

    return (
        <AuthLayout
            title="Forgot password"
            heading="Forgot your password?"
            subtitle="Enter your email and we'll send you a reset link."
            footer={
                <Link href="/login" className="font-semibold text-brand hover:underline">
                    Back to sign in
                </Link>
            }
        >
            {status && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs">{status}</div>
            )}

            <form onSubmit={submit} className="space-y-5" noValidate>
                <Field label="Email Address" error={errors.email}>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => {
                            setData('email', e.target.value);
                            clearErrors('email');
                        }}
                        className={inputClass(errors.email)}
                    />
                </Field>
                <Button type="submit" disabled={processing} className="w-full py-3 text-sm">
                    Email Reset Link
                </Button>
            </form>
        </AuthLayout>
    );
}
