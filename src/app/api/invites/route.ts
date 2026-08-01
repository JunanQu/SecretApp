import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/db';
import { themeIds } from '@/lib/themes';
import { isValidAccessCode } from '@/lib/access';
import type { DateOption } from '@/lib/types';

type CreateInviteBody = {
  accessCode?: unknown;
  fromName?: unknown;
  toName?: unknown;
  message?: unknown;
  theme?: unknown;
  notifyEmail?: unknown;
  location?: unknown;
  timezone?: unknown;
  dateOptions?: unknown;
};

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

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as CreateInviteBody | null;
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { accessCode, fromName, toName, message, theme, notifyEmail, location, timezone, dateOptions } = body;

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
    if (
      typeof notifyEmail !== 'string' ||
      notifyEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail.trim())
    ) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    cleanNotifyEmail = notifyEmail.trim();
  }
  let cleanLocation: string | null = null;
  if (location !== undefined && location !== null && location !== '') {
    if (typeof location !== 'string' || location.length > 200) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    }
    cleanLocation = location.trim() || null;
  }
  if (
    !Array.isArray(dateOptions) ||
    dateOptions.length < 1 ||
    dateOptions.length > 5 ||
    !dateOptions.every(
      (o: unknown): o is { label?: unknown; iso?: unknown } =>
        typeof o === 'object' && o !== null,
    ) ||
    !dateOptions.every(
      (o: { label?: unknown; iso?: unknown }) =>
        typeof o.iso === 'string' &&
        !isNaN(new Date(o.iso).getTime()) &&
        (o.label === undefined || (typeof o.label === 'string' && o.label.length <= 120)),
    )
  ) {
    return NextResponse.json(
      { error: 'Between 1 and 5 valid date options are required' },
      { status: 400 },
    );
  }

  const normalizedOptions: DateOption[] = (
    dateOptions as { label?: string; iso: string }[]
  ).map((o) => ({
    id: nanoid(8),
    label: o.label?.trim() ?? '',
    iso: o.iso,
  }));

  const invite = await prisma.invite.create({
    data: {
      slug: nanoid(10),
      secret: nanoid(24),
      fromName: fromName.trim(),
      toName: toName.trim(),
      message: message.trim(),
      theme,
      notifyEmail: cleanNotifyEmail,
      location: cleanLocation,
      timezone: normalizeTimezone(timezone),
      dateOptions: normalizedOptions,
    },
  });

  return NextResponse.json(
    { slug: invite.slug, secret: invite.secret },
    { status: 201 },
  );
}
