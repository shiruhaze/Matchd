import { Plus } from 'lucide-react';
import { useState } from 'react';
import { inputClass, SkillChip } from './ui';

/** Add / remove skill tags. `value` is an array of strings; type and press Enter. */
export default function TagInput({ value, onChange, placeholder, suggestions = [], error }) {
    const [draft, setDraft] = useState('');

    const add = (raw) => {
        const tag = raw.trim().replace(/^#+/, '').toLowerCase();
        if (tag && !value.includes(tag)) {
            onChange([...value, tag]);
        }
        setDraft('');
    };

    const remove = (tag) => onChange(value.filter((t) => t !== tag));

    const onKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            add(draft);
        }
    };

    const unused = suggestions.filter((s) => !value.includes(s)).slice(0, 8);

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    className={`flex-1 ${inputClass(error)}`}
                />
                <button
                    type="button"
                    onClick={() => add(draft)}
                    className="bg-brand hover:bg-brand-dark text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" /> Add Tag
                </button>
            </div>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((tag) => (
                        <SkillChip key={tag} solid onRemove={() => remove(tag)}>
                            #{tag}
                        </SkillChip>
                    ))}
                </div>
            )}

            {unused.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                    Suggestions:
                    {unused.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => add(s)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg"
                        >
                            #{s}
                        </button>
                    ))}
                </div>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}
