import { toAppleMapsUrl, toGoogleMapsUrl } from '@/lib/calendar';

const linkClass =
  'rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50';

export default function MapLinks({
  location,
  align = 'center',
  className = '',
}: {
  location: string;
  align?: 'center' | 'start';
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap gap-2 ${
        align === 'center' ? 'justify-center' : 'justify-start'
      } ${className}`}
    >
      <a
        href={toGoogleMapsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Google Maps
      </a>
      <a
        href={toAppleMapsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Apple Maps
      </a>
    </div>
  );
}
