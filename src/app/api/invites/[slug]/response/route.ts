import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { DateOption } from '@/lib/types';

type ResponseBody = {
  accepted?: unknown;
  selectedOptionIds?: unknown;
  proposedTimes?: unknown;
  note?: unknown;
};

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

  const normalizedProposedTimes: string[] = [];
  if (proposedTimes !== undefined && proposedTimes !== null) {
    if (
      !Array.isArray(proposedTimes) ||
      proposedTimes.length > 3 ||
      !proposedTimes.every(
        (t: unknown): t is string =>
          typeof t === 'string' && !isNaN(new Date(t).getTime()),
      )
    ) {
      return NextResponse.json(
        { error: 'proposedTimes must be up to 3 valid datetime strings' },
        { status: 400 },
      );
    }
    normalizedProposedTimes.push(
      ...proposedTimes.map((t) => new Date(t).toISOString()),
    );
  }

  const response = await prisma.response.create({
    data: {
      inviteId: invite.id,
      accepted,
      selectedOptionIds,
      proposedTimes: normalizedProposedTimes,
      note: typeof note === 'string' && note.trim() ? note.trim() : null,
    },
  });

  return NextResponse.json({ ok: true, id: response.id }, { status: 201 });
}
