import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/db';
import { themeIds } from '@/lib/themes';
import { activityIds } from '@/lib/activities';
import { isValidAccessCode } from '@/lib/access';
import { isValidEmail } from '@/lib/validation';
import { sendInviteEmail } from '@/lib/email';
import { originFromHeaders } from '@/lib/url';
import type { DateOption } from '@/lib/types';

type CreateInviteBody = {
  accessCode?: unknown;
  fromName?: unknown;
  toName?: unknown;
  message?: unknown;
  theme?: unknown;
  notifyEmail?: unknown;
  toEmail?: unknown;
  sendInvite?: unknown;
  location?: unknown;
  timezone?: unknown;
  dateOptions?: unknown;
};

/** An end time further out than this is a typo, not a very long date. */
const MAX_OPTION_LENGTH_MS = 24 * 60 * 60 * 1000;

function normalizeTimezone(tz: unknown): string | null {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return null;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    return null;
  }
}

function isNonEmptyString(v: unknown, max = 500): v is string {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= max;
}

function normalizeDateOptions(
  raw: unknown,
): { options: DateOption[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 5) {
    return { error: 'Between 1 and 5 valid date options are required' };
  }

  const options: DateOption[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) {
      return { error: 'Between 1 and 5 valid date options are required' };
    }
    const { label, iso, endIso, activity } = entry as {
      label?: unknown;
      iso?: unknown;
      endIso?: unknown;
      activity?: unknown;
    };

    if (typeof iso !== 'string' || isNaN(new Date(iso).getTime())) {
      return { error: 'Every date option needs a valid start time' };
    }
    const start = new Date(iso);

    if (
      label !== undefined &&
      label !== null &&
      (typeof label !== 'string' || label.length > 120)
    ) {
      return { error: 'Date option labels must be 120 characters or fewer' };
    }

    let cleanEndIso: string | null = null;
    if (endIso !== undefined && endIso !== null && endIso !== '') {
      if (typeof endIso !== 'string' || isNaN(new Date(endIso).getTime())) {
        return { error: 'Invalid end time on a date option' };
      }
      const end = new Date(endIso);
      if (end <= start) {
        return { error: 'An end time has to be after its start time' };
      }
      if (end.getTime() - start.getTime() > MAX_OPTION_LENGTH_MS) {
        return { error: 'A date option can’t run longer than 24 hours' };
      }
      cleanEndIso = end.toISOString();
    }

    let cleanActivity: string | null = null;
    if (activity !== undefined && activity !== null && activity !== '') {
      if (typeof activity !== 'string' || !activityIds.includes(activity)) {
        return { error: 'Unknown activity on a date option' };
      }
      cleanActivity = activity;
    }

    options.push({
      id: nanoid(8),
      label: typeof label === 'string' ? label.trim() : '',
      iso: start.toISOString(),
      endIso: cleanEndIso,
      activity: cleanActivity,
    });
  }

  return { options };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as CreateInviteBody | null;
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    accessCode,
    fromName,
    toName,
    message,
    theme,
    notifyEmail,
    toEmail,
    sendInvite,
    location,
    timezone,
    dateOptions,
  } = body;

  if (!isValidAccessCode(accessCode)) {
    return NextResponse.json(
      { error: 'Invalid access code — ask the app owner for one 💌' },
      { status: 401 },
    );
  }

  if (!isNonEmptyString(fromName, 80)) {
    return NextResponse.json({ error: 'Your name is required' }, { status: 400 });
  }
  if (!isNonEmptyString(toName, 80)) {
    return NextResponse.json({ error: 'Their name is required' }, { status: 400 });
  }
  if (!isNonEmptyString(message, 1000)) {
    return NextResponse.json({ error: 'A message is required' }, { status: 400 });
  }
  if (typeof theme !== 'string' || !themeIds.includes(theme)) {
    return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
  }
  let cleanNotifyEmail: string | null = null;
  if (notifyEmail !== undefined && notifyEmail !== null && notifyEmail !== '') {
    if (typeof notifyEmail !== 'string' || !isValidEmail(notifyEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    cleanNotifyEmail = notifyEmail.trim();
  }
  let cleanToEmail: string | null = null;
  if (toEmail !== undefined && toEmail !== null && toEmail !== '') {
    if (typeof toEmail !== 'string' || !isValidEmail(toEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address for them' },
        { status: 400 },
      );
    }
    cleanToEmail = toEmail.trim();
  }
  let cleanLocation: string | null = null;
  if (location !== undefined && location !== null && location !== '') {
    if (typeof location !== 'string' || location.length > 200) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    }
    cleanLocation = location.trim() || null;
  }

  const normalized = normalizeDateOptions(dateOptions);
  if ('error' in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const invite = await prisma.invite.create({
    data: {
      slug: nanoid(10),
      secret: nanoid(24),
      fromName: fromName.trim(),
      toName: toName.trim(),
      message: message.trim(),
      theme,
      notifyEmail: cleanNotifyEmail,
      toEmail: cleanToEmail,
      location: cleanLocation,
      timezone: normalizeTimezone(timezone),
      dateOptions: normalized.options,
    },
  });

  // Emailing the invite is opt-in: the link is only mailed when asked for.
  let emailSent = false;
  let emailError: string | undefined;
  if (cleanToEmail && sendInvite === true) {
    const origin = originFromHeaders(req.headers);
    const result = await sendInviteEmail({
      to: cleanToEmail,
      fromName: invite.fromName,
      toName: invite.toName,
      theme: invite.theme,
      optionCount: normalized.options.length,
      inviteUrl: `${origin}/i/${invite.slug}`,
    });
    emailSent = result.ok;
    if (result.ok) {
      await prisma.invite.update({
        where: { id: invite.id },
        data: { inviteSentAt: new Date() },
      });
    } else {
      emailError = result.error;
    }
  }

  return NextResponse.json(
    { slug: invite.slug, secret: invite.secret, emailSent, emailError },
    { status: 201 },
  );
}
