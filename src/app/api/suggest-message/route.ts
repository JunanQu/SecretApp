import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { isValidAccessCode } from '@/lib/access';

const VIBES: Record<string, string> = {
  sweet: 'warm, sincere, and a little shy — heartfelt but not over the top',
  funny: 'playful and lightly self-deprecating, with one gentle joke',
  bold: 'confident and charming, direct but still respectful',
};

type SuggestBody = {
  accessCode?: unknown;
  fromName?: unknown;
  toName?: unknown;
  vibe?: unknown;
  idea?: unknown;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as SuggestBody | null;
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isValidAccessCode(body.accessCode)) {
    return NextResponse.json(
      { error: 'Invalid access code — ask the app owner for one 💌' },
      { status: 401 },
    );
  }

  const fromName = typeof body.fromName === 'string' ? body.fromName.slice(0, 80) : '';
  const toName = typeof body.toName === 'string' ? body.toName.slice(0, 80) : '';
  const idea = typeof body.idea === 'string' ? body.idea.slice(0, 300) : '';
  const vibe =
    typeof body.vibe === 'string' && body.vibe in VIBES ? body.vibe : 'sweet';

  try {
    const { text } = await generateText({
      model: google('gemini-flash-latest'),
      system:
        'You write short, charming date-invitation messages for a cute invite app. ' +
        'Write in the first person as the sender. Output ONLY the message text — no quotes, ' +
        'no preamble, no sign-off with the sender name (the app adds that). ' +
        'Keep it to 2-3 sentences, under 60 words. At most one emoji. ' +
        'Never be crude, pushy, or overly intense.',
      prompt: [
        `Tone: ${VIBES[vibe]}.`,
        toName ? `The invitee's name is ${toName}.` : '',
        fromName ? `The sender's name is ${fromName}.` : '',
        idea
          ? `The date idea / details to work in: ${idea}`
          : 'No specific date idea given — keep it about spending time together.',
      ]
        .filter(Boolean)
        .join('\n'),
    });

    return NextResponse.json({ message: text.trim() });
  } catch (err) {
    console.error('suggest-message failed', err);
    return NextResponse.json(
      { error: 'The AI is feeling shy right now — try again in a moment.' },
      { status: 502 },
    );
  }
}
