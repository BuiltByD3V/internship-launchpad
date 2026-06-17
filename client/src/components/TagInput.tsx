import { useState } from 'react';
import type { KeyboardEvent } from 'react';

export function TagInput({
  value,
  onChange,
  placeholder = 'Type and press Enter...',
  id,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const tag = raw.trim();
    if (tag.length === 0 || value.includes(tag)) return;
    onChange([...value, tag]);
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
      setDraft('');
    } else if (e.key === 'Backspace' && draft.length === 0 && value.length > 0) {
      removeAt(value.length - 1);
    }
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-edge bg-white/[0.02] px-3 py-2 transition-colors focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
      {value.map((tag, i) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-lg bg-accent/15 px-2 py-1 text-xs font-medium text-accent ring-1 ring-accent/25"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeAt(i)}
            className="text-accent/70 transition-colors hover:text-white"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (draft.trim()) {
            add(draft);
            setDraft('');
          }
        }}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
      />
    </div>
  );
}
