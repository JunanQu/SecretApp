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
  /** particle color for the floating background emoji */
  particle: string;
  /** emoji that drift up the background */
  particles: string[];
  /** envelope pocket / flap paper tones */
  envelope: string;
  envelopeFlap: string;
  /** confetti burst colors + emoji shapes */
  confettiColors: string[];
  confettiEmojis: string[];
  /** hex accent for HTML emails, which can't use Tailwind classes */
  accent: string;
  /** illustrated character shown instead of the emoji, see ThemeMascot */
  mascot?: 'shepherd' | 'ragdoll';
};

const HEART_PARTICLES = ['💕', '✨', '💗', '🌸', '💫', '🤍'];

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
    particles: HEART_PARTICLES,
    envelope: 'bg-rose-200',
    envelopeFlap: 'bg-rose-300',
    confettiColors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffffff'],
    confettiEmojis: ['💖', '💌'],
    accent: '#f43f5e',
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
    particles: HEART_PARTICLES,
    envelope: 'bg-violet-200',
    envelopeFlap: 'bg-violet-300',
    confettiColors: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ffffff'],
    confettiEmojis: ['💜', '💌'],
    accent: '#8b5cf6',
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
    particles: HEART_PARTICLES,
    envelope: 'bg-amber-200',
    envelopeFlap: 'bg-amber-300',
    confettiColors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffffff'],
    confettiEmojis: ['🌅', '💌'],
    accent: '#f97316',
  },
  shepherd: {
    id: 'shepherd',
    name: 'Shepherd Pup',
    emoji: '🐕',
    bg: 'bg-gradient-to-br from-amber-100 via-orange-50 to-stone-200',
    card: 'bg-white/85 backdrop-blur-md border-amber-300',
    heading: 'text-amber-800',
    text: 'text-stone-900',
    button:
      'bg-amber-700 hover:bg-amber-800 text-white shadow-lg shadow-amber-400/50',
    chip: 'bg-amber-50 border-amber-300 text-stone-900 hover:border-amber-600',
    chipSelected: 'bg-amber-700 border-amber-700 text-white',
    particle: 'text-amber-500',
    particles: ['🐾', '🦴', '🐕', '🎾', '💛', '🐶'],
    envelope: 'bg-amber-200',
    envelopeFlap: 'bg-amber-300',
    confettiColors: ['#b45309', '#d97706', '#fbbf24', '#44403c', '#ffffff'],
    confettiEmojis: ['🐾', '🦴', '🐶'],
    accent: '#b45309',
    mascot: 'shepherd',
  },
  ragdoll: {
    id: 'ragdoll',
    name: 'Ragdoll Kitty',
    emoji: '🐱',
    bg: 'bg-gradient-to-br from-sky-100 via-slate-50 to-indigo-100',
    card: 'bg-white/85 backdrop-blur-md border-sky-200',
    heading: 'text-sky-700',
    text: 'text-slate-900',
    button:
      'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-300/60',
    chip: 'bg-sky-50 border-sky-200 text-slate-900 hover:border-sky-400',
    chipSelected: 'bg-sky-500 border-sky-500 text-white',
    particle: 'text-sky-300',
    particles: ['🐾', '🐱', '🧶', '🐟', '💙', '✨'],
    envelope: 'bg-sky-200',
    envelopeFlap: 'bg-sky-300',
    confettiColors: ['#0ea5e9', '#7dd3fc', '#bae6fd', '#a5b4fc', '#ffffff'],
    confettiEmojis: ['🐾', '🐱', '🧶'],
    accent: '#0ea5e9',
    mascot: 'ragdoll',
  },
};

export const themeIds = Object.keys(themes);

export function getTheme(id: string): Theme {
  return themes[id] ?? themes.blush;
}
