import { useForm } from '@inertiajs/react';
import { Button, Field, inputClass } from '../../Components/ui';
import AuthLayout from '../../Layouts/AuthLayout';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
        token,
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    const change = (field) => (event) => {
        setData(field, event.target.value);
        clearErrors(field);
    };

    const submit = (event) => {
        event.preventDefault();
        post('/reset-password', { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <AuthLayout title="Reset password" heading="Choose a new password" subtitle="Make it at least 8 characters.">
            <form onSubmit={submit} className="space-y-5" noValidate>
                <Field label="Email Address" error={errors.email}>
                    <input type="email" value={data.email} onChange={change('email')} className={inputClass(errors.email)} />
                </Field>
                <Field label="New Password" error={errors.password}>
                    <input
                        type="password"
                        value={data.password}
                        onChange={change('password')}
                        autoComplete="new-password"
                        className={inputClass(errors.password)}
                    />
                </Field>
                <Field label="Confirm Password">
                    <input
                        type="password"
                        value={data.password_confirmation}
                        onChange={change('password_confirmation')}
                        autoComplete="new-password"
                        className={inputClass()}
                    />
                </Field>
                <Button type="submit" disabled={processing} className="w-full py-3 text-sm">
                    Reset Password
                </Button>
            </form>
        </AuthLayout>
    );
}
