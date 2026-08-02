'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getTheme, type Theme } from '@/lib/themes';
import { getActivity } from '@/lib/activities';
import { formatDateRange } from '@/lib/format';
import { endIsoFrom } from '@/lib/datetime';
import type { InvitePublic } from '@/lib/types';
import FloatingHearts from '@/components/FloatingHearts';
import AddToCalendar from '@/components/AddToCalendar';
import MapLinks from '@/components/MapLinks';
import ThemeMascot from '@/components/ThemeMascot';

type Stage = 'envelope' | 'card' | 'availability' | 'declined' | 'done';

/** A suggested time the invitee types in: local start + optional "HH:MM" end. */
type ProposedDraft = { start: string; end: string };

const shapeCache = new Map<string, confetti.Shape[]>();
function emojiShapes(emojis: string[]): confetti.Shape[] {
  const key = emojis.join('');
  const cached = shapeCache.get(key);
  if (cached) return cached;
  let shapes: confetti.Shape[] = [];
  try {
    shapes = emojis.map((text) => confetti.shapeFromText({ text, scalar: 2 }));
  } catch {
    shapes = [];
  }
  shapeCache.set(key, shapes);
  return shapes;
}

function heartPop(theme: Theme) {
  const shapes = emojiShapes(theme.confettiEmojis);
  confetti({
    particleCount: shapes.length ? 20 : 35,
    spread: 80,
    startVelocity: 26,
    scalar: shapes.length ? 1.7 : 1,
    shapes: shapes.length ? shapes : undefined,
    colors: theme.confettiColors,
    origin: { x: 0.5, y: 0.45 },
    disableForReducedMotion: true,
  });
}

function fireConfetti(theme: Theme) {
  const burst = (opts: confetti.Options) =>
    confetti({
      particleCount: 90,
      spread: 75,
      colors: theme.confettiColors,
      disableForReducedMotion: true,
      ...opts,
    });
  burst({ origin: { x: 0.2, y: 0.7 }, angle: 60 });
  burst({ origin: { x: 0.8, y: 0.7 }, angle: 120 });
  setTimeout(() => burst({ origin: { x: 0.5, y: 0.6 }, spread: 100 }), 250);
  const shapes = emojiShapes(theme.confettiEmojis);
  if (shapes.length) {
    setTimeout(
      () =>
        confetti({
          particleCount: 24,
          spread: 110,
          scalar: 1.8,
          startVelocity: 30,
          shapes,
          origin: { x: 0.5, y: 0.55 },
          disableForReducedMotion: true,
        }),
      400,
    );
  }
}

const revealContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.25 } },
};
const revealItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export default function InviteExperience({ invite }: { invite: InvitePublic }) {
  const t = getTheme(invite.theme);
  const [stage, setStage] = useState<Stage>('envelope');
  const [opening, setOpening] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [proposed, setProposed] = useState<ProposedDraft[]>([]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filledProposals = proposed.filter(
    (p) => p.start && !isNaN(new Date(p.start).getTime()),
  );

  function openEnvelope() {
    if (opening) return;
    setOpening(true);
    setTimeout(() => heartPop(t), 500);
    setTimeout(() => setStage('card'), 1100);
  }

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
            ? filledProposals.map((p) => ({
                iso: new Date(p.start).toISOString(),
                endIso: endIsoFrom(p.start, p.end),
              }))
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
      <FloatingHearts className={t.particle} emojis={t.particles} />
      <motion.div
        aria-hidden
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-white/40 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-white/40 blur-3xl"
      />
      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          {stage === 'envelope' && (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 170, damping: 18 }}
              className="flex flex-col items-center"
            >
              <motion.h1
                animate={{ opacity: opening ? 0 : 1 }}
                className={`mb-8 text-center font-display text-3xl font-semibold ${t.heading}`}
              >
                {invite.toName}, you&apos;ve got mail
              </motion.h1>
              <motion.button
                onClick={openEnvelope}
                aria-label="Open your invitation"
                whileHover={opening ? undefined : { scale: 1.03, rotate: -1 }}
                whileTap={opening ? undefined : { scale: 0.97 }}
                animate={opening ? { y: 0 } : { y: [0, -8, 0] }}
                transition={
                  opening
                    ? { duration: 0.2 }
                    : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                }
                className="relative block w-[19rem] max-w-full cursor-pointer sm:w-[22rem]"
              >
                <div className="relative aspect-[8/5] w-full [perspective:1000px]">
                  {/* envelope interior */}
                  <div className={`absolute inset-0 rounded-2xl border shadow-2xl ${t.card}`} />
                  {/* the letter inside */}
                  <motion.div
                    animate={opening ? { y: '-64%' } : { y: 0 }}
                    transition={{ delay: 0.4, duration: 0.65, ease: 'easeOut' }}
                    className="absolute inset-x-5 bottom-3 top-3 z-10 flex flex-col items-center justify-center rounded-xl bg-white shadow-md"
                  >
                    <ThemeMascot themeId={invite.theme} size={44} />
                    <span className={`mt-1 text-xs font-medium tracking-wide opacity-60 ${t.text}`}>
                      for {invite.toName}
                    </span>
                  </motion.div>
                  {/* front pocket */}
                  <div
                    className={`absolute inset-x-0 bottom-0 z-20 h-[58%] rounded-b-2xl ${t.envelope} [clip-path:polygon(0_0,50%_38%,100%_0,100%_100%,0_100%)]`}
                  />
                  {/* flap */}
                  <motion.div
                    animate={opening ? { rotateX: -180 } : { rotateX: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    style={{ transformOrigin: 'top' }}
                    className={`absolute inset-x-0 top-0 h-[55%] rounded-t-2xl ${t.envelopeFlap} [clip-path:polygon(0_0,100%_0,50%_100%)] ${
                      opening ? 'z-0' : 'z-30'
                    }`}
                  />
                  {/* wax seal */}
                  <motion.div
                    animate={
                      opening
                        ? { opacity: 0, scale: 0.4 }
                        : { scale: [1, 1.12, 1] }
                    }
                    transition={
                      opening
                        ? { duration: 0.3 }
                        : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                    }
                    className={`absolute left-1/2 top-[44%] z-40 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border text-xl shadow-lg ${t.chipSelected}`}
                  >
                    💌
                  </motion.div>
                </div>
              </motion.button>
              <motion.p
                animate={
                  opening ? { opacity: 0 } : { opacity: [0.5, 0.9, 0.5] }
                }
                transition={
                  opening
                    ? { duration: 0.2 }
                    : { duration: 2, repeat: Infinity }
                }
                className={`mt-7 text-sm ${t.text}`}
              >
                someone has a question for you… tap to open
              </motion.p>
            </motion.div>
          )}

          {stage === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: 'spring', stiffness: 150, damping: 17 }}
              className={card}
            >
              <motion.div
                variants={revealContainer}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={revealItem}
                  className="flex justify-center"
                >
                  <ThemeMascot themeId={invite.theme} size={72} />
                </motion.div>
                <motion.h1
                  variants={revealItem}
                  className={`mt-4 font-display text-3xl font-semibold ${t.heading}`}
                >
                  {invite.toName}, will you go out with me?
                </motion.h1>
                <motion.p
                  variants={revealItem}
                  className="mt-4 whitespace-pre-wrap opacity-80"
                >
                  {invite.message}
                </motion.p>
                {invite.location && (
                  <motion.div variants={revealItem} className="mt-4">
                    <p className="text-sm font-medium opacity-80">
                      📍 {invite.location}
                    </p>
                    <MapLinks location={invite.location} className="mt-2" />
                  </motion.div>
                )}
                <motion.p variants={revealItem} className="mt-4 text-sm opacity-70">
                  — {invite.fromName} 💌
                </motion.p>
                <motion.div
                  variants={revealItem}
                  className="mt-8 flex flex-col items-center gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      fireConfetti(t);
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
                </motion.div>
              </motion.div>
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
                  const activity = getActivity(o.activity);
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
                      className={`rounded-2xl border px-5 py-3 text-sm font-medium transition ${
                        isSelected ? t.chipSelected : t.chip
                      }`}
                    >
                      {activity ? `${activity.emoji} ` : isSelected ? '💖 ' : ''}
                      {formatDateRange(o.iso, o.endIso)}
                      {(o.label || activity) && (
                        <span className="opacity-70">
                          {' '}
                          · {o.label || activity?.name}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-5 rounded-2xl border border-dashed border-current/25 bg-white/50 p-4 text-left">
                <p className="text-sm font-medium">
                  None of these work? Suggest your own time 💡
                </p>
                <div className="mt-2 flex flex-col gap-3">
                  {proposed.map((p, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <input
                        type="datetime-local"
                        value={p.start}
                        onChange={(e) =>
                          setProposed((prev) =>
                            prev.map((prop, idx) =>
                              idx === i ? { ...prop, start: e.target.value } : prop,
                            ),
                          )
                        }
                        className="min-w-0 flex-1 rounded-2xl border border-current/20 bg-white/80 px-4 py-2.5 text-sm outline-none"
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
                      <label className="flex w-full items-center gap-2 text-xs opacity-70">
                        until
                        <input
                          type="time"
                          aria-label="End time (optional)"
                          value={p.end}
                          onChange={(e) =>
                            setProposed((prev) =>
                              prev.map((prop, idx) =>
                                idx === i ? { ...prop, end: e.target.value } : prop,
                              ),
                            )
                          }
                          className="rounded-full border border-current/20 bg-white/80 px-3 py-1 text-xs outline-none"
                        />
                        <span className="opacity-70">(optional)</span>
                      </label>
                    </div>
                  ))}
                  {proposed.length < 3 && (
                    <button
                      onClick={() =>
                        setProposed((prev) => [...prev, { start: '', end: '' }])
                      }
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
                  (selected.length === 0 && filledProposals.length === 0)
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
              {(selected.length > 0 || filledProposals.length > 0) && (
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
                          {getActivity(o.activity)?.emoji ?? '💖'}{' '}
                          {formatDateRange(o.iso, o.endIso)}
                          {o.label && (
                            <span className="opacity-80"> · {o.label}</span>
                          )}
                          <AddToCalendar
                            withName={invite.fromName}
                            startIso={o.iso}
                            endIso={o.endIso}
                            message={invite.message}
                            label={o.label || undefined}
                            location={invite.location || undefined}
                            activity={o.activity}
                          />
                        </div>
                      ))}
                    {filledProposals.map((p) => {
                      const iso = new Date(p.start).toISOString();
                      const endIso = endIsoFrom(p.start, p.end);
                      return (
                        <div
                          key={iso}
                          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${t.chip}`}
                        >
                          💡 {formatDateRange(iso, endIso)}
                          <AddToCalendar
                            withName={invite.fromName}
                            startIso={iso}
                            endIso={endIso}
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
