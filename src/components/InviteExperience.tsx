'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getTheme } from '@/lib/themes';
import { formatDateOption } from '@/lib/format';
import type { InvitePublic } from '@/lib/types';
import FloatingHearts from '@/components/FloatingHearts';
import AddToCalendar from '@/components/AddToCalendar';
import MapLinks from '@/components/MapLinks';

type Stage = 'envelope' | 'card' | 'availability' | 'declined' | 'done';

function fireConfetti() {
  const burst = (opts: confetti.Options) =>
    confetti({
      particleCount: 90,
      spread: 75,
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffffff'],
      disableForReducedMotion: true,
      ...opts,
    });
  burst({ origin: { x: 0.2, y: 0.7 }, angle: 60 });
  burst({ origin: { x: 0.8, y: 0.7 }, angle: 120 });
  setTimeout(() => burst({ origin: { x: 0.5, y: 0.6 }, spread: 100 }), 250);
}

export default function InviteExperience({ invite }: { invite: InvitePublic }) {
  const t = getTheme(invite.theme);
  const [stage, setStage] = useState<Stage>('envelope');
  const [selected, setSelected] = useState<string[]>([]);
  const [proposed, setProposed] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(accepted: boolean) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/invites/${invite.slug}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accepted,
          selectedOptionIds: accepted ? selected : [],
          proposedTimes: accepted
            ? proposed.filter(Boolean).map((t) => new Date(t).toISOString())
            : [],
          note,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Something went wrong — try again?');
        setSubmitting(false);
        return;
      }
      setStage(accepted ? 'done' : 'declined');
    } catch {
      setError('Network hiccup — try again?');
    } finally {
      setSubmitting(false);
    }
  }

  const card = `rounded-3xl border p-8 text-center shadow-2xl ${t.card} ${t.text}`;

  return (
    <main
      className={`relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12 ${t.bg}`}
    >
      <FloatingHearts className={t.particle} />
      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          {stage === 'envelope' && (
            <motion.button
              key="envelope"
              onClick={() => setStage('card')}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, rotate: -4 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className={`${card} w-full cursor-pointer`}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-7xl"
              >
                💌
              </motion.div>
              <h1 className={`mt-5 font-display text-3xl font-semibold ${t.heading}`}>
                {invite.toName}, you&apos;ve got mail
              </h1>
              <p className="mt-3 text-sm opacity-70">
                Someone has a question for you… tap to open
              </p>
            </motion.button>
          )}

          {stage === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: 'spring', stiffness: 140, damping: 16 }}
              className={card}
            >
              <div className="text-5xl">{t.emoji}</div>
              <h1 className={`mt-4 font-display text-3xl font-semibold ${t.heading}`}>
                {invite.toName}, will you go out with me?
              </h1>
              <p className="mt-4 whitespace-pre-wrap opacity-80">
                {invite.message}
              </p>
              {invite.location && (
                <div className="mt-4">
                  <p className="text-sm font-medium opacity-80">
                    📍 {invite.location}
                  </p>
                  <MapLinks location={invite.location} className="mt-2" />
                </div>
              )}
              <p className="mt-4 text-sm opacity-70">— {invite.fromName} 💌</p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    fireConfetti();
                    setStage('availability');
                  }}
                  className={`rounded-full px-12 py-4 text-xl font-semibold transition-colors ${t.button}`}
                >
                  Yes! 🥰
                </motion.button>
                <button
                  onClick={() => submit(false)}
                  disabled={submitting}
                  className="text-xs opacity-50 transition hover:opacity-80"
                >
                  maybe another time…
                </button>
              </div>
            </motion.div>
          )}

          {stage === 'availability' && (
            <motion.div
              key="availability"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: 'spring', stiffness: 160, damping: 18 }}
              className={card}
            >
              <div className="text-5xl">🎉</div>
              <h2 className={`mt-4 font-display text-2xl font-semibold ${t.heading}`}>
                Yay! When are you free?
              </h2>
              <p className="mt-2 text-sm opacity-70">
                Tap every time that works — or suggest your own below.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                {invite.dateOptions.map((o) => {
                  const isSelected = selected.includes(o.id);
                  return (
                    <motion.button
                      key={o.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        setSelected((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== o.id)
                            : [...prev, o.id],
                        )
                      }
                      className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                        isSelected ? t.chipSelected : t.chip
                      }`}
                    >
                      {isSelected ? '💖 ' : ''}
                      {formatDateOption(o.iso)}
                      {o.label && <span className="opacity-70"> · {o.label}</span>}
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-5 rounded-2xl border border-dashed border-current/25 bg-white/50 p-4 text-left">
                <p className="text-sm font-medium">
                  None of these work? Suggest your own time 💡
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {proposed.map((time, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="datetime-local"
                        value={time}
                        onChange={(e) =>
                          setProposed((prev) =>
                            prev.map((p, idx) => (idx === i ? e.target.value : p)),
                          )
                        }
                        className="flex-1 rounded-2xl border border-current/20 bg-white/80 px-4 py-2.5 text-sm outline-none"
                      />
                      <button
                        aria-label="Remove suggested time"
                        onClick={() =>
                          setProposed((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="rounded-full px-2 py-1 opacity-50 transition hover:opacity-90"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {proposed.length < 3 && (
                    <button
                      onClick={() => setProposed((prev) => [...prev, ''])}
                      className="self-start rounded-full border border-dashed border-current/30 px-4 py-1.5 text-xs font-medium opacity-70 transition hover:opacity-100"
                    >
                      + suggest a time
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                placeholder="Leave a little note? (optional)"
                className="mt-4 w-full resize-y rounded-2xl border border-current/20 bg-white/70 px-4 py-3 text-sm outline-none placeholder:opacity-50"
              />
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
              <motion.button
                whileHover={{ scale: submitting ? 1 : 1.04 }}
                whileTap={{ scale: submitting ? 1 : 0.96 }}
                disabled={
                  submitting ||
                  (selected.length === 0 && proposed.filter(Boolean).length === 0)
                }
                onClick={() => submit(true)}
                className={`mt-5 w-full rounded-full px-8 py-4 text-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${t.button}`}
              >
                {submitting ? 'Sending…' : 'Send my answer 💌'}
              </motion.button>
            </motion.div>
          )}

          {stage === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16 }}
              className={card}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="text-6xl"
              >
                💖
              </motion.div>
              <h2 className={`mt-4 font-display text-3xl font-semibold ${t.heading}`}>
                It&apos;s a date!
              </h2>
              <p className="mt-3 opacity-80">
                Your answer is on its way to {invite.fromName}. Get excited! ✨
              </p>
              {(selected.length > 0 || proposed.filter(Boolean).length > 0) && (
                <div className="mt-6 text-left">
                  <p className="text-center text-sm font-medium opacity-60">
                    Save a time to your calendar
                  </p>
                  <div className="mt-3 flex flex-col gap-3">
                    {invite.dateOptions
                      .filter((o) => selected.includes(o.id))
                      .map((o) => (
                        <div
                          key={o.id}
                          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${t.chipSelected}`}
                        >
                          💖 {formatDateOption(o.iso)}
                          {o.label && (
                            <span className="opacity-80"> · {o.label}</span>
                          )}
                          <AddToCalendar
                            withName={invite.fromName}
                            startIso={o.iso}
                            message={invite.message}
                            label={o.label || undefined}
                            location={invite.location || undefined}
                          />
                        </div>
                      ))}
                    {proposed
                      .filter(Boolean)
                      .map((time) => {
                        const iso = new Date(time).toISOString();
                        return (
                          <div
                            key={iso}
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${t.chip}`}
                          >
                            💡 {formatDateOption(iso)}
                            <AddToCalendar
                              withName={invite.fromName}
                              startIso={iso}
                              message={invite.message}
                              location={invite.location || undefined}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {stage === 'declined' && (
            <motion.div
              key="declined"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={card}
            >
              <div className="text-5xl">🤍</div>
              <h2 className={`mt-4 font-display text-2xl font-semibold ${t.heading}`}>
                No worries at all
              </h2>
              <p className="mt-3 text-sm opacity-70">
                We&apos;ve let {invite.fromName} know, gently.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
