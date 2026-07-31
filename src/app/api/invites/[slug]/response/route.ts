import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { DateOption } from '@/lib/types';

type ResponseBody = {
  accepted?: unknown;
  selectedOptionIds?: unknown;
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

  const { accepted, selectedOptionIds, note } = body;

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

  const response = await prisma.response.create({
    data: {
      inviteId: invite.id,
      accepted,
      selectedOptionIds,
      note: typeof note === 'string' && note.trim() ? note.trim() : null,
    },
  });

  return NextResponse.json({ ok: true, id: response.id }, { status: 201 });
}
