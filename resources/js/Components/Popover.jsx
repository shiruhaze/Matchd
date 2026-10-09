import { Check, ChevronDown, Loader2, Lock, Search } from 'lucide-react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Popover positioning + dismissal shared by Menu and Select.
 * The panel renders in a portal with fixed positioning, so it is never clipped by
 * overflow containers (e.g. scrollable tables). It aligns to the trigger's start/end edge,
 * flips upward when there isn't room below, and stays inside the viewport.
 */
function usePopover({ align = 'end', side = 'bottom', offset = 8 } = {}) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState(null);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);

    const update = useCallback(() => {
        const t = triggerRef.current?.getBoundingClientRect();
        const panel = panelRef.current;
        if (!t || !panel) return;

        const { offsetWidth: pw, offsetHeight: ph } = panel;
        const roomBelow = window.innerHeight - t.bottom;
        const roomAbove = t.top;
        const up = side === 'top' ? roomAbove >= ph + offset || roomAbove > roomBelow : roomBelow < ph + offset && roomAbove > roomBelow;

        // 'stretch' panels are at least as wide as the trigger but may grow to fit their content.
        const w = align === 'stretch' ? Math.max(pw, t.width) : pw;
        const left = align === 'start' || align === 'stretch' ? t.left : t.right - pw;
        setPos({
            top: up ? t.top - ph - offset : t.bottom + offset,
            left: Math.min(Math.max(8, left), window.innerWidth - w - 8),
            width: align === 'stretch' ? t.width : undefined,
            up,
        });
    }, [align, side, offset]);

    // Measure before paint so the panel never flashes at the wrong spot.
    useLayoutEffect(() => {
        if (open) update();
        else setPos(null);
    }, [open, update]);

    useEffect(() => {
        if (!open) return undefined;

        const onPointer = (e) => {
            if (!triggerRef.current?.contains(e.target) && !panelRef.current?.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [open, update]);

    return { open, setOpen, pos, triggerRef, panelRef };
}

/** Floating panel shell: glass card + entrance animation from the trigger's side. */
function Panel({ popover, className = '', children, ...props }) {
    const { pos, panelRef } = popover;

    return createPortal(
        <div
            ref={panelRef}
            {...props}
            style={{
                position: 'fixed',
                top: pos?.top ?? 0,
                left: pos?.left ?? 0,
                minWidth: pos?.width,
                visibility: pos ? 'visible' : 'hidden',
                '--pop-from': pos?.up ? '4px' : '-4px',
            }}
            className={`z-[60] animate-pop-in rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5 backdrop-blur-xl focus:outline-none motion-reduce:animate-none ${
                pos?.up ? 'origin-bottom' : 'origin-top'
            } ${className}`}
        >
            {children}
        </div>,
        document.body,
    );
}

/** Arrow / Home / End navigation between the focusable rows of a panel. */
function onListKeyDown(event, selector) {
    const items = [...event.currentTarget.querySelectorAll(selector)].filter((el) => !el.disabled);
    if (!items.length) return;
    const index = items.indexOf(document.activeElement);
    const go = (i) => {
        event.preventDefault();
        items[(i + items.length) % items.length].focus();
    };

    if (event.key === 'ArrowDown') go(index + 1);
    else if (event.key === 'ArrowUp') go(index - 1);
    else if (event.key === 'Home') go(0);
    else if (event.key === 'End') go(items.length - 1);
}

/* ─────────────────────────────── Menu ─────────────────────────────── */

/**
 * Action menu.
 *   <Menu trigger={(props, { open }) => <button {...props}>…</button>}>
 *     {(close) => <><MenuItem onClick={…}>Edit</MenuItem></>}
 *   </Menu>
 */
export function Menu({ trigger, align = 'end', side = 'bottom', width = 'w-56', label, children }) {
    const popover = usePopover({ align, side });
    const id = useId();
    const close = () => popover.setOpen(false);

    // Focus the first item when opening (keyboard users land inside the menu).
    useEffect(() => {
        if (popover.open && popover.pos) popover.panelRef.current?.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
    }, [popover.open, popover.pos]);

    return (
        <>
            {trigger({
                ref: popover.triggerRef,
                type: 'button',
                'aria-haspopup': 'menu',
                'aria-expanded': popover.open,
                'aria-controls': popover.open ? id : undefined,
                'aria-label': label,
                onClick: () => popover.setOpen((o) => !o),
            }, { open: popover.open })}
            {popover.open && (
                <Panel
                    popover={popover}
                    id={id}
                    role="menu"
                    className={width}
                    onKeyDown={(e) => {
                        if (e.key === 'Tab') close();
                        onListKeyDown(e, '[role="menuitem"]');
                    }}
                >
                    {typeof children === 'function' ? children(close) : children}
                </Panel>
            )}
        </>
    );
}

export function MenuItem({ icon: Icon, children, hint, danger = false, onClick, disabled }) {
    return (
        <button
            type="button"
            role="menuitem"
            disabled={disabled}
            onClick={onClick}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                danger ? 'text-red-600 hover:bg-red-50 focus:bg-red-50' : 'text-slate-700 hover:bg-slate-100/80 focus:bg-slate-100/80'
            }`}
        >
            {Icon && (
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${danger ? 'bg-red-100/70 text-red-600' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'}`}>
                    <Icon className="h-4 w-4" />
                </span>
            )}
            <span className="flex-1">
                {children}
                {hint && <span className={`block text-[11px] font-normal ${danger ? 'text-red-400' : 'text-slate-400'}`}>{hint}</span>}
            </span>
        </button>
    );
}

export function MenuDivider() {
    return <div role="separator" className="my-1.5 h-px bg-slate-100" />;
}

export function MenuHeader({ children }) {
    return <div className="px-3 pt-2 pb-1.5">{children}</div>;
}

/* ─────────────────────────────── Select ─────────────────────────────── */

/**
 * Rich single-select (listbox) with icons, descriptions and tones.
 * options: [{ value, label, description?, icon?, tone? }]
 * tone classes: { chip, icon } (see ROLE_OPTIONS in Admin/Users for an example)
 */
export function Select({ value, options, onChange, disabled = false, loading = false, lockedReason, label, size = 'md', width = 'w-72' }) {
    const popover = usePopover({ align: 'start' });
    const id = useId();
    const current = options.find((o) => o.value === value);
    const CurrentIcon = current?.icon;

    useEffect(() => {
        if (!popover.open || !popover.pos) return;
        const panel = popover.panelRef.current;
        (panel?.querySelector('[aria-selected="true"]') ?? panel?.querySelector('[role="option"]'))?.focus();
    }, [popover.open, popover.pos]);

    const choose = (option) => {
        popover.setOpen(false);
        popover.triggerRef.current?.focus();
        if (option.value !== value) onChange(option.value);
    };

    const pad = size === 'sm' ? 'py-1 pl-1 pr-2' : 'py-1.5 pl-1.5 pr-2.5';

    return (
        <>
            <button
                ref={popover.triggerRef}
                type="button"
                disabled={disabled || loading}
                title={disabled ? lockedReason : undefined}
                aria-haspopup="listbox"
                aria-expanded={popover.open}
                aria-controls={popover.open ? id : undefined}
                aria-label={label}
                onClick={() => popover.setOpen((o) => !o)}
                className={`group inline-flex items-center gap-2 rounded-full border text-xs font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/15 disabled:cursor-not-allowed ${pad} ${
                    popover.open ? 'border-brand/40 bg-white shadow-md shadow-brand/10' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                } ${disabled ? 'opacity-70 hover:border-slate-200 hover:shadow-none' : ''}`}
            >
                {CurrentIcon && (
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full ${current.tone?.chip ?? 'bg-slate-100 text-slate-600'}`}>
                        <CurrentIcon className="h-3.5 w-3.5" />
                    </span>
                )}
                <span className="text-slate-800">{current?.label ?? 'Select…'}</span>
                {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                ) : disabled ? (
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${popover.open ? 'rotate-180 text-brand' : ''}`} />
                )}
            </button>

            {popover.open && (
                <Panel
                    popover={popover}
                    id={id}
                    role="listbox"
                    aria-label={label}
                    className={width}
                    onKeyDown={(e) => {
                        if (e.key === 'Tab') popover.setOpen(false);
                        onListKeyDown(e, '[role="option"]');
                    }}
                >
                    {options.map((option) => {
                        const selected = option.value === value;
                        const Icon = option.icon;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() => choose(option)}
                                className={`flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors focus:outline-none ${
                                    selected ? 'bg-brand/5' : 'hover:bg-slate-100/80 focus:bg-slate-100/80'
                                }`}
                            >
                                {Icon && (
                                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${option.tone?.icon ?? 'bg-slate-100 text-slate-600'}`}>
                                        <Icon className="h-4 w-4" />
                                    </span>
                                )}
                                <span className="min-w-0 flex-1">
                                    <span className={`block text-sm font-semibold ${selected ? 'text-brand' : 'text-slate-800'}`}>{option.label}</span>
                                    {option.description && <span className="mt-0.5 block text-xs leading-snug text-slate-500">{option.description}</span>}
                                </span>
                                {selected && <Check className="mt-1 h-4 w-4 shrink-0 text-brand" />}
                            </button>
                        );
                    })}
                </Panel>
            )}
        </>
    );
}

/* ─────────────────────────────── FieldSelect ─────────────────────────────── */

/**
 * Form-field dropdown (full width, input styling) with the same animated panel as Select.
 * options: [{ value, label, description?, icon?, leading? (node, e.g. an avatar), meta? (right-aligned text) }]
 * Pass `searchable` for long lists; the panel matches the trigger's width.
 */
export function FieldSelect({ value, options, onChange, placeholder = 'Select…', label, error, searchable = false, disabled = false, emptyText = 'No options' }) {
    const popover = usePopover({ align: 'stretch' });
    const id = useId();
    const [query, setQuery] = useState('');
    const searchRef = useRef(null);
    const current = options.find((o) => String(o.value) === String(value));
    const CurrentIcon = current?.icon;

    const q = query.trim().toLowerCase();
    const visible = q ? options.filter((o) => `${o.label} ${o.description ?? ''}`.toLowerCase().includes(q)) : options;

    useEffect(() => {
        if (!popover.open) {
            setQuery('');
            return;
        }
        if (!popover.pos) return;
        const panel = popover.panelRef.current;
        const selected = panel?.querySelector('[aria-selected="true"]');
        // Long lists open scrolled to the current choice.
        selected?.scrollIntoView({ block: 'center' });
        if (searchable) searchRef.current?.focus({ preventScroll: true });
        else (selected ?? panel?.querySelector('[role="option"]'))?.focus({ preventScroll: true });
    }, [popover.open, popover.pos, searchable]); // eslint-disable-line react-hooks/exhaustive-deps

    const choose = (option) => {
        popover.setOpen(false);
        popover.triggerRef.current?.focus();
        if (String(option.value) !== String(value)) onChange(option.value);
    };

    return (
        <>
            <button
                ref={popover.triggerRef}
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={popover.open}
                aria-controls={popover.open ? id : undefined}
                aria-label={label}
                onClick={() => popover.setOpen((o) => !o)}
                onKeyDown={(e) => {
                    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !popover.open) {
                        e.preventDefault();
                        popover.setOpen(true);
                    }
                }}
                className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                    error
                        ? 'border-red-400 bg-slate-50/50'
                        : popover.open
                          ? 'border-brand bg-white ring-4 ring-brand/10'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/10'
                }`}
            >
                {current?.leading ??
                    (CurrentIcon && (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                            <CurrentIcon className="h-4 w-4" />
                        </span>
                    ))}
                <span className="min-w-0 flex-1">
                    <span className={`block truncate ${current ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>{current?.label ?? placeholder}</span>
                    {current?.description && <span className="block truncate text-[11px] text-slate-500">{current.description}</span>}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${popover.open ? 'rotate-180 text-brand' : 'group-hover:text-slate-600'}`} />
            </button>

            {popover.open && (
                <Panel
                    popover={popover}
                    id={id}
                    role="listbox"
                    aria-label={label}
                    className="w-max max-w-[min(24rem,calc(100vw-1rem))]"
                    onKeyDown={(e) => {
                        if (e.key === 'Tab') popover.setOpen(false);
                        if (e.key === 'ArrowDown' && document.activeElement === searchRef.current) {
                            e.preventDefault();
                            e.currentTarget.querySelector('[role="option"]')?.focus();
                            return;
                        }
                        onListKeyDown(e, '[role="option"]');
                    }}
                >
                    {searchable && (
                        <div className="relative mb-1.5">
                            <Search className="pointer-events-none absolute top-1/2 left-3 z-10 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                                ref={searchRef}
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && visible[0]) {
                                        e.preventDefault();
                                        choose(visible[0]);
                                    }
                                }}
                                placeholder="Search…"
                                aria-label={`Search ${label ?? 'options'}`}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-8 text-xs transition focus:border-brand focus:bg-white focus:outline-none"
                            />
                        </div>
                    )}
                    <div className="max-h-72 space-y-0.5 overflow-y-auto overscroll-contain">
                        {visible.length === 0 && <p className="px-3 py-4 text-center text-xs text-slate-400">{q ? `No matches for "${query}"` : emptyText}</p>}
                        {visible.map((option, i) => {
                            const selected = String(option.value) === String(value);
                            const Icon = option.icon;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    onClick={() => choose(option)}
                                    // Options fade in one after another for a smooth open.
                                    style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
                                    className={`flex w-full animate-option-in items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors focus:outline-none motion-reduce:animate-none ${
                                        selected ? 'bg-brand/5' : 'hover:bg-slate-100/80 focus:bg-slate-100/80'
                                    }`}
                                >
                                    {option.leading ??
                                        (Icon && (
                                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${selected ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                <Icon className="h-4 w-4" />
                                            </span>
                                        ))}
                                    <span className="min-w-0 flex-1">
                                        <span className={`block truncate text-sm font-semibold ${selected ? 'text-brand' : 'text-slate-800'}`}>{option.label}</span>
                                        {option.description && <span className="block truncate text-xs text-slate-500">{option.description}</span>}
                                    </span>
                                    {option.meta && <span className="shrink-0 text-[11px] text-slate-400">{option.meta}</span>}
                                    {selected && <Check className="h-4 w-4 shrink-0 text-brand" />}
                                </button>
                            );
                        })}
                    </div>
                </Panel>
            )}
        </>
    );
}
