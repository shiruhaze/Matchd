import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const TONES = {
    danger: { icon: AlertTriangle, badge: 'bg-red-50 text-red-600 ring-red-100', button: 'bg-red-600 hover:bg-red-700 shadow-red-600/25 focus-visible:ring-red-500/30' },
    brand: { icon: ShieldCheck, badge: 'bg-brand/10 text-brand ring-brand/10', button: 'bg-brand hover:bg-brand-dark shadow-brand/25 focus-visible:ring-brand/30' },
};

/**
 * Promise-based confirmation dialog.
 *   const [confirm, dialog] = useConfirm();
 *   if (await confirm({ title, message, confirmLabel, tone: 'danger' })) { … }
 *   return <>{dialog} …</>;
 */
export function useConfirm() {
    const [request, setRequest] = useState(null);

    const confirm = useCallback((options) => new Promise((resolve) => setRequest({ ...options, resolve })), []);

    const settle = (result) => {
        request?.resolve(result);
        setRequest(null);
    };

    const dialog = request ? <Dialog {...request} onCancel={() => settle(false)} onConfirm={() => settle(true)} /> : null;

    return [confirm, dialog];
}

function Dialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', icon, onCancel, onConfirm }) {
    const t = TONES[tone] ?? TONES.danger;
    const Icon = icon ?? t.icon;
    const confirmRef = useRef(null);
    const cancelRef = useRef(onCancel);
    cancelRef.current = onCancel;

    // Focus the confirm button on open, Esc cancels, and focus returns to the trigger on close.
    useEffect(() => {
        const previous = document.activeElement;
        confirmRef.current?.focus();
        const onKey = (e) => e.key === 'Escape' && cancelRef.current();
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            previous?.focus?.();
        };
    }, []);

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
            <div className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm motion-reduce:animate-none" onClick={onCancel} />
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-message"
                className="relative w-full max-w-md animate-pop-in rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-900/20 motion-reduce:animate-none"
            >
                <div className="flex items-start gap-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-4 ${t.badge}`}>
                        <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 pt-0.5">
                        <h2 id="confirm-title" className="text-base font-bold text-slate-900">
                            {title}
                        </h2>
                        <p id="confirm-message" className="mt-1.5 text-sm leading-relaxed text-slate-500">
                            {message}
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        type="button"
                        onClick={onConfirm}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-4 ${t.button}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
