'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STEP_MS = 2800;

const captions = [
  'She gets a sealed envelope…',
  '…with your message inside',
  'One tap to say yes 🥰',
  'She picks times that work',
  'You get the good news 🎉',
];

function SceneEnvelope() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="font-display text-sm font-semibold text-rose-600">
        Sam, you&apos;ve got mail
      </p>
      <div className="relative h-24 w-36">
        <div className="absolute inset-0 rounded-xl bg-white shadow" />
        <div className="absolute inset-x-0 bottom-0 h-[58%] rounded-b-xl bg-rose-200 [clip-path:polygon(0_0,50%_38%,100%_0,100%_100%,0_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[55%] rounded-t-xl bg-rose-300 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="absolute left-1/2 top-[42%] flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-rose-500 text-xs text-white shadow"
        >
          💌
        </motion.div>
      </div>
      <motion.p
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="text-[10px] text-rose-900/60"
      >
        tap to open
      </motion.p>
    </div>
  );
}

function SceneCard() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 text-center">
      <span className="text-2xl">🌸</span>
      <p className="mt-2 font-display text-sm font-semibold leading-snug text-rose-600">
        Sam, will you go out with me?
      </p>
      <p className="mt-2 text-[10px] leading-relaxed text-rose-900/70">
        I know this cute little ramen place… want to check it out with me? 🍜
      </p>
      <p className="mt-2 text-[10px] text-rose-900/50">— Alex 💌</p>
    </div>
  );
}

function SceneYes() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3">
      {['💖', '💘', '💕'].map((h, i) => (
        <motion.span
          key={h}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 0], y: -70, x: (i - 1) * 34 }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4 }}
          className="absolute bottom-1/3 text-xl"
        >
          {h}
        </motion.span>
      ))}
      <motion.div
        animate={{ scale: [1, 0.92, 1.06, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-full bg-rose-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-300/60"
      >
        Yes! 🥰
      </motion.div>
      <p className="text-[10px] text-rose-900/50">maybe another time…</p>
    </div>
  );
}

function SceneTimes() {
  const chips = [
    '🎬 Fri, 7:30 – 10 PM',
    '🥐 Sat, 11 AM – 12:30 PM',
    '🏛️ Sun, 2 – 4 PM',
  ];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-5">
      <p className="mb-1 font-display text-xs font-semibold text-rose-600">
        When are you free?
      </p>
      {chips.map((c, i) => (
        <motion.div
          key={c}
          style={{ backgroundColor: '#ffffff', color: '#4c0519' }}
          animate={
            i !== 1
              ? { backgroundColor: '#f43f5e', color: '#ffffff', scale: [1, 1.06, 1] }
              : {}
          }
          transition={{ delay: 0.7 + i * 0.5, duration: 0.4 }}
          className="w-full rounded-full border border-rose-200 px-3 py-1.5 text-center text-[10px] font-medium shadow-sm"
        >
          {c}
        </motion.div>
      ))}
    </div>
  );
}

function SceneDone() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-5 text-center">
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="text-3xl"
      >
        💖
      </motion.span>
      <p className="font-display text-sm font-semibold text-rose-600">
        It&apos;s a date!
      </p>
      <p className="text-[10px] leading-relaxed text-rose-900/60">
        You get an email with her answer, plus one-tap add to calendar 📅
      </p>
    </div>
  );
}

const scenes = [SceneEnvelope, SceneCard, SceneYes, SceneTimes, SceneDone];

export default function DemoWalkthrough() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => (s + 1) % scenes.length),
      STEP_MS,
    );
    return () => clearInterval(id);
  }, []);

  const Scene = scenes[step];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* phone frame */}
      <div className="w-56 rounded-[2rem] border border-rose-200 bg-white/80 p-2.5 shadow-2xl shadow-rose-200/60 backdrop-blur-md">
        <div className="relative h-80 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200">
          <div className="absolute left-1/2 top-2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-rose-950/10" />
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35 }}
              className="h-full"
            >
              <Scene />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {/* caption + progress dots */}
      <div className="flex flex-col items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-medium text-rose-900/70"
          >
            {captions[step]}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1.5">
          {scenes.map((_, i) => (
            <button
              key={i}
              aria-label={`Show demo step ${i + 1}`}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-5 bg-rose-500' : 'w-1.5 bg-rose-300/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
