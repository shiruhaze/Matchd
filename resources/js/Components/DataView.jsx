import { Search, SearchX, X } from 'lucide-react';

const TILE_TONES = {
    brand: { icon: 'bg-brand/10 text-brand', bar: 'bg-brand' },
    success: { icon: 'bg-success/10 text-success', bar: 'bg-success' },
    violet: { icon: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500' },
    amber: { icon: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
    slate: { icon: 'bg-slate-100 text-slate-600', bar: 'bg-slate-500' },
    red: { icon: 'bg-red-50 text-red-600', bar: 'bg-red-500' },
};

/** KPI tile. Pass `share` (0–1) to show a proportion bar under the value. */
export function StatTile({ icon: Icon, label, value, hint, share, tone = 'brand' }) {
    const t = TILE_TONES[tone] ?? TILE_TONES.brand;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl transition group-hover:scale-105 ${t.icon}`}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
            {share != null ? (
                <div className="mt-4 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full transition-[width] duration-700 ${t.bar}`} style={{ width: `${Math.round(share * 100)}%` }} />
                    </div>
                    <span className="w-9 text-right text-[11px] font-semibold text-slate-500 tabular-nums">{Math.round(share * 100)}%</span>
                </div>
            ) : (
                hint && <p className="mt-4 text-xs text-slate-400">{hint}</p>
            )}
        </div>
    );
}

/** Segmented filter with counts. tabs: [{ value, label, count }] */
export function FilterTabs({ tabs, value, onChange, label }) {
    return (
        <div role="tablist" aria-label={label} className="flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-slate-100/80 p-1 [scrollbar-width:none]">
            {tabs.map((tab) => {
                const active = tab.value === value;

                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(tab.value)}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
                            active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {tab.label}
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${active ? 'bg-brand text-white' : 'bg-slate-200/80 text-slate-500'}`}>{tab.count}</span>
                    </button>
                );
            })}
        </div>
    );
}

export function SearchField({ value, onChange, placeholder }) {
    return (
        <div className="group relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand" />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-10 text-sm text-slate-800 transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand/50 focus:ring-4 focus:ring-brand/10 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    aria-label="Clear search"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}

export function NoResults({ title = 'No matches', children, onReset }) {
    return (
        <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <SearchX className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-bold text-slate-800">{title}</p>
            {children && <p className="mt-1 max-w-sm text-sm text-slate-500">{children}</p>}
            {onReset && (
                <button type="button" onClick={onReset} className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Clear filters
                </button>
            )}
        </div>
    );
}

/** Kebab-style trigger for row action menus. */
export function RowMenuButton({ open, ...props }) {
    return (
        <button
            {...props}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/15 ${
                open ? 'border-brand/30 bg-brand/5 text-brand' : 'border-transparent text-slate-400 hover:border-slate-200 hover:bg-white hover:text-slate-700 hover:shadow-sm'
            }`}
        >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <circle cx="12" cy="5" r="1.75" />
                <circle cx="12" cy="12" r="1.75" />
                <circle cx="12" cy="19" r="1.75" />
            </svg>
        </button>
    );
}
