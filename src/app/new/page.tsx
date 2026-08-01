'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { themes } from '@/lib/themes';
import InviteCardPreview from '@/components/InviteCardPreview';

type DraftOption = { label: string; iso: string };

export default function NewInvitePage() {
  const router = useRouter();
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState('blush');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [options, setOptions] = useState<DraftOption[]>([
    { label: '', iso: '' },
    { label: '', iso: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vibe, setVibe] = useState('sweet');
  const [aiIdea, setAiIdea] = useState('');
  const [suggesting, setSuggesting] = useState(false);

  async function suggestMessage() {
    setSuggesting(true);
    setError(null);
    const optionHints = options
      .map((o) => o.label.trim())
      .filter(Boolean)
      .join(', ');
    const idea = [aiIdea.trim() || message.trim(), optionHints && `planned activities: ${optionHints}`]
      .filter(Boolean)
      .join('; ');
    try {
      const res = await fetch('/api/suggest-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromName, toName, vibe, idea }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Suggestion failed — try again?');
        return;
      }
      setMessage(data.message);
    } catch {
      setError('Network error — please try again');
    } finally {
      setSuggesting(false);
    }
  }

  const updateOption = (i: number, patch: Partial<DraftOption>) => {
    setOptions((prev) =>
      prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    );
  };

  const validOptions = options.filter((o) => o.iso);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromName,
          toName,
          message,
          theme,
          notifyEmail,
          dateOptions: validOptions.map((o) => ({
            label: o.label,
            iso: new Date(o.iso).toISOString(),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        setSubmitting(false);
        return;
      }
      router.push(`/manage/${data.secret}?created=1`);
    } catch {
      setError('Network error — please try again');
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-2xl border border-rose-200 bg-white/80 px-4 py-3 text-rose-950 placeholder-rose-300 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200';

  return (
    <main className="flex-1 bg-gradient-to-br from-rose-100 via-pink-50 to-violet-100 text-rose-950">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link
          href="/"
          className="text-sm text-rose-500 transition hover:text-rose-700"
        >
          ← back
        </Link>
        <h1 className="mt-4 font-display text-4xl font-semibold">
          Craft your invite 💌
        </h1>
        <p className="mt-2 text-rose-900/70">
          Fill this in and we&apos;ll give you a link to send.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Your name
                <input
                  className={inputClass}
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Alex"
                  maxLength={80}
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Their name
                <input
                  className={inputClass}
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="Sam"
                  maxLength={80}
                  required
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Your message
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I know this cute little ramen place… want to check it out with me? 🍜"
                maxLength={1000}
                required
              />
            </label>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-rose-300 bg-white/50 px-4 py-3">
              <input
                className={`${inputClass} w-full`}
                value={aiIdea}
                onChange={(e) => setAiIdea(e.target.value)}
                placeholder="What's the date about? e.g. ramen then arcade, we met rock climbing…"
                maxLength={300}
              />
              <span className="text-xs font-medium text-rose-900/60">
                Pick a vibe:
              </span>
              {(['sweet', 'funny', 'bold'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVibe(v)}
                  className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                    vibe === v
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : 'border-rose-200 bg-white/70 text-rose-900 hover:border-rose-400'
                  }`}
                >
                  {v}
                </button>
              ))}
              <button
                type="button"
                onClick={suggestMessage}
                disabled={suggesting}
                className="ml-auto rounded-full border border-rose-300 bg-white px-4 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-500 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {suggesting ? 'Writing… ✍️' : '✨ Write it for me'}
              </button>
              <p className="w-full text-[11px] leading-snug text-rose-900/50">
                Describe the plan above, pick a vibe, and the AI drafts your
                message — edit it however you like before sending.
              </p>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Theme</legend>
              <div className="flex gap-3">
                {Object.values(themes).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                      theme === t.id
                        ? 'border-rose-500 bg-rose-500 text-white'
                        : 'border-rose-200 bg-white/70 hover:border-rose-400'
                    }`}
                  >
                    <span>{t.emoji}</span>
                    {t.name}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-medium">
                Proposed dates{' '}
                <span className="font-normal text-rose-900/60">
                  (1–5 options)
                </span>
              </legend>
              {options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    className={`${inputClass} flex-1`}
                    value={o.iso}
                    onChange={(e) => updateOption(i, { iso: e.target.value })}
                  />
                  <input
                    className={`${inputClass} flex-1`}
                    value={o.label}
                    onChange={(e) => updateOption(i, { label: e.target.value })}
                    placeholder="e.g. dinner, picnic…"
                    maxLength={120}
                  />
                  {options.length > 1 && (
                    <button
                      type="button"
                      aria-label="Remove option"
                      onClick={() =>
                        setOptions((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="rounded-full px-2 py-1 text-rose-400 transition hover:bg-rose-100 hover:text-rose-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={() =>
                    setOptions((prev) => [...prev, { label: '', iso: '' }])
                  }
                  className="self-start rounded-full border border-dashed border-rose-300 px-4 py-2 text-sm text-rose-500 transition hover:border-rose-500 hover:text-rose-700"
                >
                  + add another option
                </button>
              )}
            </fieldset>

            {/* Email notifications are wired up server-side but hidden until an
                email provider account is available. Restore this field to re-enable. */}
            {false && (
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Email me when they answer{' '}
                <span className="font-normal text-rose-900/60">(optional)</span>
                <input
                  type="email"
                  className={inputClass}
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={254}
                />
              </label>
            )}

            {error && (
              <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={submitting || validOptions.length === 0}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="mt-2 rounded-full bg-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-300/60 transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create my invite 💘'}
            </motion.button>
          </form>

          <div className="lg:sticky lg:top-12 lg:self-start">
            <p className="mb-3 text-sm font-medium text-rose-900/60">
              Live preview
            </p>
            <InviteCardPreview
              fromName={fromName}
              toName={toName}
              message={message}
              theme={theme}
              dateOptions={options}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
