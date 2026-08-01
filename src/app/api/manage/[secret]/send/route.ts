import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendInviteEmail } from '@/lib/email';
import { originFromHeaders } from '@/lib/url';
import { isValidEmail } from '@/lib/validation';
import type { DateOption } from '@/lib/types';

/**
 * Emails the invite link to the invitee. Guarded by the creator's private
 * `secret`, plus a small per-invite rate limit so a leaked manage link can't
 * be turned into a mailer.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 5;
const sendLog = new Map<string, number[]>();

function rateLimited(secret: string): boolean {
  const now = Date.now();
  if (sendLog.size > 500) sendLog.clear();
  const recent = (sendLog.get(secret) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_SENDS_PER_WINDOW) {
    sendLog.set(secret, recent);
    return true;
  }
  sendLog.set(secret, [...recent, now]);
  return false;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ secret: string }> },
) {
  const { secret } = await params;

  const invite = await prisma.invite.findUnique({ where: { secret } });
  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as { toEmail?: unknown } | null;
  const toEmail = body?.toEmail;
  if (typeof toEmail !== 'string' || !isValidEmail(toEmail)) {
    return NextResponse.json(
      { error: 'That doesn’t look like an email address' },
      { status: 400 },
    );
  }

  if (rateLimited(secret)) {
    return NextResponse.json(
      { error: 'That invite has been emailed a few times already — try again later.' },
      { status: 429 },
    );
  }

  const origin = originFromHeaders(req.headers);
  const result = await sendInviteEmail({
    to: toEmail.trim(),
    fromName: invite.fromName,
    toName: invite.toName,
    theme: invite.theme,
    optionCount: (invite.dateOptions as DateOption[]).length,
    inviteUrl: `${origin}/i/${invite.slug}`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const sentAt = new Date();
  await prisma.invite.update({
    where: { id: invite.id },
    data: { toEmail: toEmail.trim(), inviteSentAt: sentAt },
  });

  return NextResponse.json({ ok: true, sentAt: sentAt.toISOString() });
}
