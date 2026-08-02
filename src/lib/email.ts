import { formatDateRange } from '@/lib/format';
import { getActivity } from '@/lib/activities';
import { getTheme } from '@/lib/themes';
import type { ProposedTime } from '@/lib/proposed';
import type { DateOption } from '@/lib/types';

export type SendResult = { ok: true } | { ok: false; error: string };

type AnswerEmailParams = {
  to: string;
  fromName: string;
  toName: string;
  theme: string;
  accepted: boolean;
  selectedOptions: DateOption[];
  proposedTimes: ProposedTime[];
  note: string | null;
  location: string | null;
  /** IANA timezone of the invite creator, used to render times in the email */
  timezone: string | null;
  manageUrl: string;
};

type InviteEmailParams = {
  to: string;
  fromName: string;
  toName: string;
  theme: string;
  /** how many date ideas are waiting inside — teased, never spoiled */
  optionCount: number;
  inviteUrl: string;
  /** optional line from the sender, shown above the button */
  note?: string | null;
};

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function optionLine(option: DateOption, timezone: string | null): string {
  const emoji = getActivity(option.activity)?.emoji ?? '💖';
  const when = formatDateRange(option.iso, option.endIso, timezone);
  return `${emoji} ${when}${option.label ? ` — ${option.label}` : ''}`;
}

function button(url: string, label: string, accent: string): string {
  return `<p style="margin: 28px 0 8px;">
      <a href="${url}" style="background: ${accent}; color: #ffffff; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">
        ${label}
      </a>
    </p>
    <p style="font-size: 12px; color: #6b7280;">or paste this link: ${url}</p>`;
}

/** Posts to Brevo. Returns a result instead of throwing so callers can decide. */
async function sendBrevoEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
}): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    return {
      ok: false,
      error: 'Email is not configured on this server (BREVO_API_KEY / BREVO_SENDER_EMAIL).',
    };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'SecretApp', email: senderEmail },
        to: [{ email: opts.to }],
        ...(opts.replyTo ? { replyTo: { email: opts.replyTo } } : {}),
        subject: opts.subject,
        htmlContent: opts.html,
        textContent: opts.text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error('Brevo send failed', res.status, detail);
      return { ok: false, error: `Email provider rejected the send (${res.status}).` };
    }
    return { ok: true };
  } catch (err) {
    console.error('Brevo send errored', err);
    return { ok: false, error: 'Could not reach the email provider.' };
  }
}

/** Sends the "they answered!" notification. Never throws. */
export async function sendAnswerEmail(params: AnswerEmailParams): Promise<SendResult> {
  const {
    to,
    fromName,
    toName,
    theme,
    accepted,
    selectedOptions,
    proposedTimes,
    note,
    location,
    timezone,
    manageUrl,
  } = params;
  const accent = getTheme(theme).accent;

  const subject = accepted
    ? `💖 ${toName} said YES!`
    : `${toName} answered your invite`;

  const timesHtml = selectedOptions.length
    ? `<p><strong>Times that work for them:</strong></p><ul>${selectedOptions
        .map((o) => `<li>${esc(optionLine(o, timezone))}</li>`)
        .join('')}</ul>`
    : '';

  const proposedHtml = proposedTimes.length
    ? `<p><strong>They suggested:</strong></p><ul>${proposedTimes
        .map((t) => `<li>${esc(formatDateRange(t.iso, t.endIso, timezone))}</li>`)
        .join('')}</ul>`
    : '';

  const noteHtml = note ? `<p><strong>Their note:</strong> “${esc(note)}”</p>` : '';

  const locationHtml = location ? `<p><strong>Where:</strong> 📍 ${esc(location)}</p>` : '';

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: ${accent};">${
        accepted ? `${esc(toName)} said YES! 🎉` : `${esc(toName)} said “maybe another time” 🤍`
      }</h2>
      <p>Hey ${esc(fromName)}, your invite just got an answer.</p>
      ${locationHtml}
      ${timesHtml}
      ${proposedHtml}
      ${noteHtml}
      ${button(manageUrl, 'View full answer', accent)}
    </div>`;

  const text = [
    accepted ? `${toName} said YES!` : `${toName} said "maybe another time".`,
    location ? `Where: ${location}` : '',
    selectedOptions.length
      ? `Times that work for them:\n${selectedOptions
          .map((o) => `- ${optionLine(o, timezone)}`)
          .join('\n')}`
      : '',
    proposedTimes.length
      ? `They suggested:\n${proposedTimes
          .map((t) => `- ${formatDateRange(t.iso, t.endIso, timezone)}`)
          .join('\n')}`
      : '',
    note ? `Their note: "${note}"` : '',
    `View the full answer: ${manageUrl}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const result = await sendBrevoEmail({ to, subject, html, text });
  if (!result.ok) console.warn('answer email not sent:', result.error);
  return result;
}

/** Emails the invite link to the invitee. Keeps the surprise — no message spoilers. */
export async function sendInviteEmail(params: InviteEmailParams): Promise<SendResult> {
  const { to, fromName, toName, theme, optionCount, inviteUrl, note } = params;
  const t = getTheme(theme);

  const subject = `${t.emoji} ${fromName} sent you an invitation`;
  const teaser =
    optionCount > 0
      ? `A little message and ${optionCount} date ${optionCount === 1 ? 'idea' : 'ideas'} are waiting inside.`
      : 'A little message is waiting inside.';
  const noteHtml = note
    ? `<p style="font-style: italic; opacity: 0.8;">“${esc(note)}”</p>`
    : '';

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; text-align: center;">
      <div style="font-size: 44px; line-height: 1;">💌</div>
      <h2 style="color: ${t.accent}; margin-top: 12px;">${esc(toName)}, you&rsquo;ve got mail</h2>
      <p><strong>${esc(fromName)}</strong> made something for you.</p>
      <p style="opacity: 0.8;">${esc(teaser)} Tap below to open your envelope.</p>
      ${noteHtml}
      ${button(inviteUrl, 'Open your invitation 💌', t.accent)}
      <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
        Sent with SecretApp — no account needed, just tap the link.
      </p>
    </div>`;

  const text = [
    `${toName}, you've got mail!`,
    `${fromName} made something for you. ${teaser}`,
    note ? `"${note}"` : '',
    `Open your invitation: ${inviteUrl}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return sendBrevoEmail({ to, subject, html, text });
}
