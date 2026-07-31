'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

type Particle = {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  emoji: string;
};

const EMOJIS = ['💕', '✨', '💗', '🌸', '💫', '🤍'];

/** Deterministic PRNG so the server and client render identical particles. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function FloatingHearts({ className = '' }: { className?: string }) {
  const particles = useMemo<Particle[]>(() => {
    const rand = mulberry32(20260731);
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      size: 14 + rand() * 18,
      delay: rand() * 8,
      duration: 9 + rand() * 8,
      emoji: EMOJIS[Math.floor(rand() * EMOJIS.length)],
    }));
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute select-none opacity-0"
          style={{ left: `${p.left}%`, fontSize: p.size }}
          initial={{ y: '105vh', opacity: 0 }}
          animate={{ y: '-10vh', opacity: [0, 0.7, 0.7, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}
