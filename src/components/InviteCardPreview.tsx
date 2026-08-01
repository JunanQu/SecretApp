'use client';

import { getTheme } from '@/lib/themes';
import { formatDateOption } from '@/lib/format';

type PreviewProps = {
  fromName: string;
  toName: string;
  message: string;
  theme: string;
  location?: string;
  dateOptions: { label: string; iso: string }[];
};

export default function InviteCardPreview({
  fromName,
  toName,
  message,
  theme,
  location,
  dateOptions,
}: PreviewProps) {
  const t = getTheme(theme);

  return (
    <div className={`rounded-3xl p-6 ${t.bg}`}>
      <div
        className={`rounded-3xl border p-6 text-center shadow-xl ${t.card} ${t.text}`}
      >
        <div className="text-4xl">{t.emoji}</div>
        <h3 className={`mt-3 font-display text-2xl font-semibold ${t.heading}`}>
          {toName.trim() || 'Their name'}, will you go out with me?
        </h3>
        <p className="mt-3 whitespace-pre-wrap text-sm opacity-80">
          {message.trim() || 'Your sweet message shows up here…'}
        </p>
        {location?.trim() && (
          <p className="mt-3 text-sm font-medium opacity-80">
            📍 {location.trim()}
          </p>
        )}
        {dateOptions.filter((o) => o.iso).length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {dateOptions
              .filter((o) => o.iso)
              .map((o, i) => (
                <div
                  key={i}
                  className={`rounded-full border px-4 py-2 text-sm ${t.chip}`}
                >
                  {formatDateOption(o.iso)}
                  {o.label.trim() && (
                    <span className="opacity-70"> · {o.label.trim()}</span>
                  )}
                </div>
              ))}
          </div>
        )}
        <p className="mt-4 text-sm opacity-70">
          — {fromName.trim() || 'your name'} 💌
        </p>
      </div>
    </div>
  );
}
