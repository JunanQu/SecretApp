import { NextResponse } from 'next/server';
import { isValidAccessCode } from '@/lib/access';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { accessCode?: unknown } | null;
  if (!body || !isValidAccessCode(body.accessCode)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
