import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendAnswerEmail } from '@/lib/email';
import { originFromHeaders } from '@/lib/url';
import type { ProposedTime } from '@/lib/proposed';
import type { DateOption } from '@/lib/types';

type ResponseBody = {
  accepted?: unknown;
  selectedOptionIds?: unknown;
  proposedTimes?: unknown;
  note?: unknown;
};

const MAX_PROPOSED_LENGTH_MS = 24 * 60 * 60 * 1000;

/**
 * A suggested time is either a plain ISO string (the original shape, still
 * accepted) or `{ iso, endIso }` now that invitees can give an end time.
 */
function parseProposedTime(entry: unknown): ProposedTime | null {
  const raw =
    typeof entry === 'string'
      ? { iso: entry, endIso: null }
      : typeof entry === 'object' && entry !== null
        ? (entry as { iso?: unknown; endIso?: unknown })
        : null;
  if (!raw || typeof raw.iso !== 'string') return null;

  const start = new Date(raw.iso);
  if (isNaN(start.getTime())) return null;

  let endIso: string | null = null;
  if (raw.endIso !== undefined && raw.endIso !== null && raw.endIso !== '') {
    if (typeof raw.endIso !== 'string') return null;
    const end = new Date(raw.endIso);
    if (isNaN(end.getTime()) || end <= start) return null;
    if (end.getTime() - start.getTime() > MAX_PROPOSED_LENGTH_MS) return null;
    endIso = end.toISOString();
  }

  return { iso: start.toISOString(), endIso };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const invite = await prisma.invite.findUnique({ where: { slug } });
  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as ResponseBody | null;
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { accepted, selectedOptionIds, proposedTimes, note } = body;

  if (typeof accepted !== 'boolean') {
    return NextResponse.json({ error: 'accepted must be a boolean' }, { status: 400 });
  }

  const validIds = new Set(
    (invite.dateOptions as DateOption[]).map((o) => o.id),
  );
  if (
    !Array.isArray(selectedOptionIds) ||
    !selectedOptionIds.every(
      (id: unknown): id is string => typeof id === 'string' && validIds.has(id),
    )
  ) {
    return NextResponse.json(
      { error: 'selectedOptionIds must be an array of valid option ids' },
      { status: 400 },
    );
  }

  if (note !== undefined && note !== null && (typeof note !== 'string' || note.length > 1000)) {
    return NextResponse.json({ error: 'Invalid note' }, { status: 400 });
  }

  const normalizedProposedTimes: ProposedTime[] = [];
  if (proposedTimes !== undefined && proposedTimes !== null) {
    if (!Array.isArray(proposedTimes) || proposedTimes.length > 3) {
      return NextResponse.json(
        { error: 'proposedTimes must be up to 3 valid datetime entries' },
        { status: 400 },
      );
    }
    for (const entry of proposedTimes) {
      const parsed = parseProposedTime(entry);
      if (!parsed) {
        return NextResponse.json(
          {
            error:
              'Each suggested time needs a valid start, and any end must be after it (max 24 hours)',
          },
          { status: 400 },
        );
      }
      normalizedProposedTimes.push(parsed);
    }
  }

  const cleanNote = typeof note === 'string' && note.trim() ? note.trim() : null;

  const response = await prisma.response.create({
    data: {
      inviteId: invite.id,
      accepted,
      selectedOptionIds,
      proposedTimes: normalizedProposedTimes,
      note: cleanNote,
    },
  });

  if (invite.notifyEmail) {
    const origin = originFromHeaders(req.headers);
    const inviteOptions = invite.dateOptions as DateOption[];
    await sendAnswerEmail({
      to: invite.notifyEmail,
      fromName: invite.fromName,
      toName: invite.toName,
      theme: invite.theme,
      accepted,
      selectedOptions: inviteOptions.filter((o) =>
        (selectedOptionIds as string[]).includes(o.id),
      ),
      proposedTimes: normalizedProposedTimes,
      note: cleanNote,
      location: invite.location,
      timezone: invite.timezone,
      manageUrl: `${origin}/manage/${invite.secret}`,
    });
  }

  return NextResponse.json({ ok: true, id: response.id }, { status: 201 });
}
