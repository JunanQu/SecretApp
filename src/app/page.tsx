'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import FloatingHearts from '@/components/FloatingHearts';

const steps = [
  {
    emoji: '💌',
    title: 'Write your invite',
    body: 'Add a sweet message and propose a few dates & times.',
  },
  {
    emoji: '🔗',
    title: 'Send the link',
    body: 'Text it, DM it, slip it into conversation. No sign-up needed.',
  },
  {
    emoji: '🎉',
    title: 'Get your answer',
    body: 'They tap Yes, pick the times that work, and you both win.',
  },
];

export default function Home() {
  return (
    <main className="relative flex-1 bg-gradient-to-br from-rose-100 via-pink-50 to-violet-100 text-rose-950">
      <FloatingHearts />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-12 px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6"
        >
          <span className="text-6xl">💘</span>
          <h1 className="font-display text-5xl font-semibold leading-tight sm:text-6xl">
            Ask them out,{' '}
            <span className="text-rose-500">adorably.</span>
          </h1>
          <p className="max-w-xl text-lg text-rose-900/70">
            Create a cute little invitation, share one link, and find out
            exactly when they&apos;re free. No apps to download, no accounts,
            just butterflies.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/new"
              className="inline-block rounded-full bg-rose-500 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-300/60 transition-colors hover:bg-rose-600"
            >
              Create an invite 💌
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid w-full gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
              className="rounded-3xl border border-rose-200 bg-white/70 p-6 backdrop-blur-md"
            >
              <div className="text-3xl">{step.emoji}</div>
              <h2 className="mt-3 font-display text-xl font-semibold">
                {step.title}
              </h2>
              <p className="mt-2 text-sm text-rose-900/70">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
