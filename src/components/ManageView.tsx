'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getTheme } from '@/lib/themes';
import { formatDateOption } from '@/lib/format';
import type { InvitePublic } from '@/lib/types';
import AddToCalendar from '@/components/AddToCalendar';
import MapLinks from '@/components/MapLinks';

type ResponseData = {
  id: string;
  accepted: boolean;
  selectedOptionIds: string[];
  proposedTimes: string[];
  note: string | null;
  createdAt: string;
};

export default function ManageView({
  invite,
  inviteUrl,
  responses,
}: {
  invite: InvitePublic;
  inviteUrl: string;
  responses: ResponseData[];
}) {
  const t = getTheme(invite.theme);
  const searchParams = useSearchParams();
  const justCreated = searchParams.get('created') === '1';
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const latest = responses[0];

  return (
    <main className={`flex-1 px-4 py-12 ${t.bg} ${t.text}`}>
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        {justCreated && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl border p-6 text-center ${t.card}`}
          >
            <div className="text-4xl">🎊</div>
            <h1 className={`mt-2 font-display text-2xl font-semibold ${t.heading}`}>
              Your invite is ready!
            </h1>
            <p className="mt-2 text-sm opacity-70">
              Send {invite.toName} this link — and bookmark{' '}
              <span className="font-semibold">this page</span>
              {' '}to see their answer. It&apos;s your private link,
              don&apos;t share it.
            </p>
          </motion.div>
        )}

        <div className={`rounded-3xl border p-6 ${t.card}`}>
          <p className="text-sm font-medium opacity-60">
            Share link for {invite.toName}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded-2xl bg-white/70 px-4 py-3 text-sm">
              {inviteUrl}
            </code>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={copyLink}
              className={`shrink-0 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${t.button}`}
            >
              {copied ? 'Copied! ✅' : 'Copy'}
            </motion.button>
          </div>
        </div>

        <div className={`rounded-3xl border p-6 ${t.card}`}>
          <h2 className={`font-display text-xl font-semibold ${t.heading}`}>
            {invite.toName}&apos;s answer
          </h2>
          {invite.location && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm opacity-80">
              <span className="font-medium">📍 {invite.location}</span>
              <MapLinks location={invite.location} align="start" />
            </div>
          )}

          {!latest && (
            <div className="mt-4 flex items-center gap-3 text-sm opacity-70">
              <motion.span
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="text-2xl"
              >
                ⏳
              </motion.span>
              No answer yet — check back after you send the link!
            </div>
          )}

          {latest && latest.accepted && (
            <div className="mt-4">
              <p className="text-lg font-semibold">They said YES! 🎉</p>
              {latest.selectedOptionIds.length > 0 && (
                <>
                  <p className="mt-3 text-sm font-medium opacity-60">
                    Times that work for them:
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {invite.dateOptions
                      .filter((o) => latest.selectedOptionIds.includes(o.id))
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
                            withName={invite.toName}
                            startIso={o.iso}
                            message={invite.message}
                            label={o.label || undefined}
                            location={invite.location || undefined}
                          />
                        </div>
                      ))}
                  </div>
                </>
              )}
              {latest.proposedTimes.length > 0 && (
                <>
                  <p className="mt-3 text-sm font-medium opacity-60">
                    They suggested {latest.selectedOptionIds.length > 0 ? 'some other times too' : 'these times instead'}:
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {latest.proposedTimes.map((iso) => (
                      <div
                        key={iso}
                        className={`rounded-2xl border px-4 py-3 text-sm font-medium ${t.chip}`}
                      >
                        💡 {formatDateOption(iso)}
                        <AddToCalendar
                          withName={invite.toName}
                          startIso={iso}
                          message={invite.message}
                          location={invite.location || undefined}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
              {latest.note && (
                <blockquote className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm italic">
                  “{latest.note}”
                </blockquote>
              )}
            </div>
          )}

          {latest && !latest.accepted && (
            <div className="mt-4 text-sm opacity-80">
              <p className="text-base font-semibold">
                They said “maybe another time” 🤍
              </p>
              <p className="mt-2">
                Chin up — the right yes is worth the wait.
              </p>
            </div>
          )}
        </div>

        <Link
          href="/new"
          className="text-center text-sm opacity-60 transition hover:opacity-90"
        >
          + create another invite
        </Link>
      </div>
    </main>
  );
}
