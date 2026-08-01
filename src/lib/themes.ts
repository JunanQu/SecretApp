export type Theme = {
  id: string;
  name: string;
  emoji: string;
  /** full-page gradient background */
  bg: string;
  /** card surface */
  card: string;
  /** display text color */
  heading: string;
  /** body text color */
  text: string;
  /** primary button */
  button: string;
  /** soft accent chip / selected state */
  chip: string;
  chipSelected: string;
  /** particle color for floating hearts */
  particle: string;
  /** envelope pocket / flap paper tones */
  envelope: string;
  envelopeFlap: string;
};

export const themes: Record<string, Theme> = {
  blush: {
    id: 'blush',
    name: 'Blush Pink',
    emoji: '🌸',
    bg: 'bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200',
    card: 'bg-white/80 backdrop-blur-md border-rose-200',
    heading: 'text-rose-600',
    text: 'text-rose-950',
    button:
      'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-300/60',
    chip: 'bg-rose-50 border-rose-200 text-rose-900 hover:border-rose-400',
    chipSelected: 'bg-rose-500 border-rose-500 text-white',
    particle: 'text-rose-300',
    envelope: 'bg-rose-200',
    envelopeFlap: 'bg-rose-300',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Dream',
    emoji: '💜',
    bg: 'bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-200',
    card: 'bg-white/80 backdrop-blur-md border-violet-200',
    heading: 'text-violet-600',
    text: 'text-violet-950',
    button:
      'bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-300/60',
    chip: 'bg-violet-50 border-violet-200 text-violet-900 hover:border-violet-400',
    chipSelected: 'bg-violet-500 border-violet-500 text-white',
    particle: 'text-violet-300',
    envelope: 'bg-violet-200',
    envelopeFlap: 'bg-violet-300',
  },
  sunset: {
    id: 'sunset',
    name: 'Golden Sunset',
    emoji: '🌅',
    bg: 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-200',
    card: 'bg-white/80 backdrop-blur-md border-amber-200',
    heading: 'text-orange-600',
    text: 'text-orange-950',
    button:
      'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-300/60',
    chip: 'bg-amber-50 border-amber-200 text-amber-900 hover:border-amber-400',
    chipSelected: 'bg-orange-500 border-orange-500 text-white',
    particle: 'text-orange-300',
    envelope: 'bg-amber-200',
    envelopeFlap: 'bg-amber-300',
  },
};

export const themeIds = Object.keys(themes);

export function getTheme(id: string): Theme {
  return themes[id] ?? themes.blush;
}
