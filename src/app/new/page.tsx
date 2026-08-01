'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { themes } from '@/lib/themes';
import { formatDateOption } from '@/lib/format';
import InviteCardPreview from '@/components/InviteCardPreview';

type DraftOption = { label: string; iso: string };

const TIME_PRESETS = [
  { name: 'brunch', emoji: '🥐', time: '11:00' },
  { name: 'afternoon', emoji: '☕', time: '15:00' },
  { name: 'dinner', emoji: '🍽️', time: '19:00' },
  { name: 'drinks', emoji: '🍸', time: '21:00' },
];

type DayChip = { date: string; weekday: string; day: string };

function buildDayChips(count = 30): DayChip[] {
  const pad = (n: number) => String(n).padStart(2, '0');
  const chips: DayChip[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    chips.push({
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      weekday:
        i === 0
          ? 'Today'
          : i === 1
            ? 'Tmrw'
            : d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return chips;
}

export default function NewInvitePage() {
  const router = useRouter();
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState('blush');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [location, setLocation] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [checkingSaved, setCheckingSaved] = useState(true);
  const [gateCode, setGateCode] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);
  const [gateChecking, setGateChecking] = useState(false);

  async function verifyCode(code: string): Promise<boolean> {
    const res = await fetch('/api/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode: code }),
    });
    return res.ok;
  }

  useEffect(() => {
    const saved = localStorage.getItem('secretapp-access-code');
    (saved ? verifyCode(saved) : Promise.resolve(false))
      .then((ok) => {
        if (ok && saved) {
          setAccessCode(saved);
          setUnlocked(true);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSaved(false));
  }, []);

  async function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGateError(null);
    setGateChecking(true);
    try {
      if (await verifyCode(gateCode)) {
        localStorage.setItem('secretapp-access-code', gateCode.trim());
        setAccessCode(gateCode.trim());
        setUnlocked(true);
      } else {
        setGateError('Hmm, that code isn’t right — double-check with the app owner.');
      }
    } catch {
      setGateError('Network error — please try again.');
    } finally {
      setGateChecking(false);
    }
  }
  const [options, setOptions] = useState<DraftOption[]>([]);
  const [dayChips] = useState(() => buildDayChips());
  const [pickDate, setPickDate] = useState('');
  const [pickTime, setPickTime] = useState('19:00');
  const [pickLabel, setPickLabel] = useState('');
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
        body: JSON.stringify({ accessCode, fromName, toName, vibe, idea }),
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

  const validOptions = options.filter((o) => o.iso);

  function addOption() {
    if (!pickDate || !pickTime || options.length >= 5) return;
    const iso = `${pickDate}T${pickTime}`;
    setOptions((prev) =>
      prev.some((o) => o.iso === iso)
        ? prev
        : [...prev, { label: pickLabel.trim(), iso }],
    );
    setPickLabel('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessCode,
          fromName,
          toName,
          message,
          theme,
          notifyEmail,
          location,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
        {!unlocked && (
          <div className="mx-auto mt-16 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-rose-200 bg-white/80 p-8 text-center backdrop-blur-md"
            >
              {checkingSaved ? (
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="text-4xl"
                >
                  🔑
                </motion.div>
              ) : (
                <>
                  <div className="text-4xl">🔑</div>
                  <h1 className="mt-3 font-display text-2xl font-semibold">
                    First, the secret code
                  </h1>
                  <p className="mt-2 text-sm text-rose-900/70">
                    Creating invites is invite-only. Enter your access code to
                    continue.
                  </p>
                  <form onSubmit={handleGateSubmit} className="mt-5 flex flex-col gap-3">
                    <input
                      type="password"
                      className={inputClass}
                      value={gateCode}
                      onChange={(e) => setGateCode(e.target.value)}
                      placeholder="access code"
                      autoComplete="off"
                      autoFocus
                      required
                    />
                    {gateError && (
                      <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">
                        {gateError}
                      </p>
                    )}
                    <motion.button
                      type="submit"
                      disabled={gateChecking || !gateCode.trim()}
                      whileHover={{ scale: gateChecking ? 1 : 1.02 }}
                      whileTap={{ scale: gateChecking ? 1 : 0.98 }}
                      className="rounded-full bg-rose-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-rose-300/60 transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {gateChecking ? 'Checking…' : 'Unlock 💘'}
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}

        {unlocked && (
        <>
        <h1 className="mt-4 font-display text-4xl font-semibold">
          Craft your invite 💌
        </h1>
        <p className="mt-2 text-rose-900/70">
          Fill this in and we&apos;ll give you a link to send.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-5">
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

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Where? 📍{' '}
              <span className="font-normal text-rose-900/60">(optional — shows on the invite and in her calendar)</span>
              <input
                type="text"
                className={inputClass}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Tartine Bakery, San Francisco"
                maxLength={200}
              />
            </label>

            <fieldset className="flex min-w-0 flex-col gap-3">
              <legend className="text-sm font-medium">
                Proposed dates{' '}
                <span className="font-normal text-rose-900/60">
                  (pick 1–5 — she chooses what works)
                </span>
              </legend>

              {options.length > 0 && (
                <div className="flex flex-col gap-2">
                  {options.map((o) => (
                    <div
                      key={o.iso}
                      className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-white/80 px-4 py-2.5 text-sm"
                    >
                      <span className="font-medium">
                        💖 {formatDateOption(o.iso)}
                      </span>
                      {o.label && (
                        <span className="text-rose-900/60">· {o.label}</span>
                      )}
                      <button
                        type="button"
                        aria-label="Remove option"
                        onClick={() =>
                          setOptions((prev) =>
                            prev.filter((p) => p.iso !== o.iso),
                          )
                        }
                        className="ml-auto rounded-full px-2 py-0.5 text-rose-400 transition hover:bg-rose-100 hover:text-rose-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {options.length < 5 && (
                <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-rose-300 bg-white/50 p-4">
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                    {dayChips.map((c) => (
                      <button
                        key={c.date}
                        type="button"
                        onClick={() => setPickDate(c.date)}
                        className={`flex shrink-0 flex-col items-center rounded-2xl border px-3.5 py-2 text-xs transition ${
                          pickDate === c.date
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : 'border-rose-200 bg-white/80 text-rose-900 hover:border-rose-400'
                        }`}
                      >
                        <span className="font-semibold">{c.weekday}</span>
                        <span className="opacity-80">{c.day}</span>
                      </button>
                    ))}
                    <label className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-rose-200 bg-white/80 px-3.5 py-2 text-xs text-rose-900 transition hover:border-rose-400">
                      <span className="font-semibold">later?</span>
                      <input
                        type="date"
                        value={pickDate}
                        onChange={(e) => setPickDate(e.target.value)}
                        className="w-[7.5rem] cursor-pointer bg-transparent text-center opacity-80 outline-none"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {TIME_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setPickTime(p.time)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${
                          pickTime === p.time
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : 'border-rose-200 bg-white/80 text-rose-900 hover:border-rose-400'
                        }`}
                      >
                        {p.emoji} {p.name}
                      </button>
                    ))}
                    <input
                      type="time"
                      value={pickTime}
                      onChange={(e) => setPickTime(e.target.value)}
                      className="rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-xs text-rose-900 outline-none transition focus:border-rose-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      className={`${inputClass} flex-1 !py-2 text-sm`}
                      value={pickLabel}
                      onChange={(e) => setPickLabel(e.target.value)}
                      placeholder="what's the plan? e.g. dinner, picnic… (optional)"
                      maxLength={120}
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      disabled={!pickDate}
                      className="shrink-0 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      + Add
                    </button>
                  </div>
                  {!pickDate && (
                    <p className="text-[11px] text-rose-900/50">
                      Tap a day and a time, then hit Add. You can add up to 5.
                    </p>
                  )}
                </div>
              )}
            </fieldset>

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
              location={location}
              dateOptions={options}
            />
          </div>
        </div>
        </>
        )}
      </div>
    </main>
  );
}
