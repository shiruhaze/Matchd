import { Eye, EyeOff } from 'lucide-react';
import { cloneElement, createContext, useContext, useId, useState } from 'react';

/** Set by FormPane: true while that pane's form is the visible one. */
export const PaneContext = createContext(true);

/**
 * Staggered entrance: when the surrounding pane becomes active, children fade up one after
 * another (`i` = position in the sequence). Uses a keyframe rather than a transition so it also
 * replays when a pane goes from display:none to visible on phones.
 */
export function Stagger({ i = 0, className = '', children }) {
    const active = useContext(PaneContext);

    return (
        <div
            className={`${active ? 'animate-fade-up motion-reduce:animate-none' : ''} ${className}`}
            style={active ? { animationDelay: `${220 + i * 70}ms` } : undefined}
        >
            {children}
        </div>
    );
}

const inputClass = (error, withIcon, withAction) =>
    [
        'h-11 short:h-10 w-full rounded-xl border bg-white/80 text-sm text-slate-800 placeholder:text-slate-400',
        'transition duration-200 focus:bg-white focus:outline-none focus:ring-4',
        withIcon ? 'pl-10' : 'pl-3.5',
        withAction ? 'pr-11' : 'pr-3.5',
        error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10'
            : 'border-slate-200 hover:border-slate-300 focus:border-brand focus:ring-brand/10',
    ].join(' ');

/** Label + control + error, wired together with a generated id for accessibility. */
export function AuthField({ label, error, required, aside, children }) {
    const id = useId();

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor={id} className="text-xs font-semibold text-slate-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                {aside}
            </div>
            {cloneElement(children, {
                id,
                error,
                'aria-invalid': Boolean(error),
                'aria-describedby': error ? `${id}-error` : undefined,
            })}
            {error && (
                <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

/** Text input with an optional leading icon that lights up on focus. */
export function TextInput({ icon: Icon, error, action, ...props }) {
    return (
        <div className="group relative">
            {Icon && (
                <Icon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand" />
            )}
            <input {...props} className={inputClass(error, Boolean(Icon), Boolean(action))} />
            {action}
        </div>
    );
}

/** Password input with a show/hide toggle. */
export function PasswordInput(props) {
    const [visible, setVisible] = useState(false);

    return (
        <TextInput
            {...props}
            type={visible ? 'text' : 'password'}
            action={
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            }
        />
    );
}

/** Primary call-to-action used by both forms. */
export function SubmitButton({ processing, children }) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="group relative inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand via-[#3a5cff] to-brand-dark text-[15px] font-bold tracking-wide text-white shadow-xl shadow-brand/35 ring-4 ring-brand/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-brand/45 hover:ring-brand/20 focus:outline-none focus-visible:ring-brand/40 active:translate-y-0 active:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 short:h-11"
        >
            <ButtonShine />
            {processing && <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            <span className="relative inline-flex items-center gap-2">{children}</span>
        </button>
    );
}

/** Light sweep across a button on hover (parent needs `group relative`). Clipped to the button's own shape. */
export function ButtonShine() {
    return (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <span className="absolute inset-y-0 -left-2/3 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/45 to-transparent transition-[left] duration-700 ease-out group-hover:left-[120%] motion-reduce:hidden" />
        </span>
    );
}

/** Form header shared by both panes. */
export function FormHeading({ eyebrow, title, subtitle }) {
    return (
        <Stagger i={0} className="mb-7 short:mb-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-brand uppercase">
                <span className="h-px w-6 bg-brand/60" />
                {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl short:mt-1">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
        </Stagger>
    );
}
