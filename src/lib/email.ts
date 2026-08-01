import { formatDateOption } from '@/lib/format';
import type { DateOption } from '@/lib/types';

type AnswerEmailParams = {
  to: string;
  fromName: string;
  toName: string;
  accepted: boolean;
  selectedOptions: DateOption[];
  proposedTimes: string[];
  note: string | null;
  manageUrl: string;
};

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** Sends the "they answered!" notification via Brevo. Never throws. */
export async function sendAnswerEmail(params: AnswerEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    console.warn('BREVO_API_KEY / BREVO_SENDER_EMAIL not set — skipping notification email');
    return;
  }

  const { to, fromName, toName, accepted, selectedOptions, proposedTimes, note, manageUrl } =
    params;

  const subject = accepted
    ? `💖 ${toName} said YES!`
    : `${toName} answered your invite`;

  const timesHtml = selectedOptions.length
    ? `<p><strong>Times that work for them:</strong></p><ul>${selectedOptions
        .map(
          (o) =>
            `<li>${esc(formatDateOption(o.iso))}${o.label ? ` — ${esc(o.label)}` : ''}</li>`,
        )
        .join('')}</ul>`
    : '';

  const proposedHtml = proposedTimes.length
    ? `<p><strong>They suggested:</strong></p><ul>${proposedTimes
        .map((iso) => `<li>${esc(formatDateOption(iso))}</li>`)
        .join('')}</ul>`
    : '';

  const noteHtml = note ? `<p><strong>Their note:</strong> “${esc(note)}”</p>` : '';

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #e11d48;">${
        accepted ? `${esc(toName)} said YES! 🎉` : `${esc(toName)} said “maybe another time” 🤍`
      }</h2>
      <p>Hey ${esc(fromName)}, your invite just got an answer.</p>
      ${timesHtml}
      ${proposedHtml}
      ${noteHtml}
      <p style="margin-top: 24px;">
        <a href="${manageUrl}" style="background: #f43f5e; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600;">
          View full answer
        </a>
      </p>
    </div>`;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'SecretApp', email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      console.error('Brevo send failed', res.status, await res.text());
    }
  } catch (err) {
    console.error('Brevo send errored', err);
  }
}
