'use client';

import { motion } from 'framer-motion';
import { getTheme } from '@/lib/themes';

/**
 * The face of a theme: an illustrated pup/kitty for the pet themes, and the
 * theme emoji for everything else. Both idle-animate so the card feels alive.
 */
type Props = {
  themeId: string;
  /** rendered size in px */
  size?: number;
  className?: string;
};

const blink = {
  animate: { scaleY: [1, 1, 0.12, 1, 1] },
  transition: { duration: 4.5, times: [0, 0.82, 0.88, 0.94, 1], repeat: Infinity },
  style: { transformBox: 'fill-box' as const, transformOrigin: 'center' },
};

function ShepherdFace() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="A cute German shepherd">
      {/* ears */}
      <motion.g
        animate={{ rotate: [0, -5, 0, 4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'bottom center' }}
      >
        <path d="M24 60 L31 8 L58 42 Z" fill="#3f342c" />
        <path d="M31 53 L35 22 L50 42 Z" fill="#c98f6f" />
        <path d="M96 60 L89 8 L62 42 Z" fill="#3f342c" />
        <path d="M89 53 L85 22 L70 42 Z" fill="#c98f6f" />
      </motion.g>

      {/* head */}
      <ellipse cx="60" cy="64" rx="33" ry="31" fill="#d9a05b" />
      {/* saddle shading across the brow */}
      <path d="M27 60 Q60 30 93 60 Q60 48 27 60 Z" fill="#a9743c" opacity="0.55" />

      {/* muzzle mask */}
      <ellipse cx="60" cy="78" rx="21" ry="16" fill="#463a31" />
      <path d="M54 86 Q60 100 66 86 Z" fill="#ef8f92" />
      <ellipse cx="60" cy="74" rx="8" ry="5.5" fill="#17120f" />
      <ellipse cx="57" cy="72.5" rx="2.4" ry="1.5" fill="#ffffff" opacity="0.55" />

      {/* brow pips */}
      <ellipse cx="45" cy="49" rx="4.5" ry="2.6" fill="#f2d6ab" />
      <ellipse cx="75" cy="49" rx="4.5" ry="2.6" fill="#f2d6ab" />

      {/* eyes */}
      <motion.g {...blink}>
        <ellipse cx="46" cy="61" rx="5.6" ry="6.6" fill="#241a12" />
        <ellipse cx="74" cy="61" rx="5.6" ry="6.6" fill="#241a12" />
        <circle cx="44.2" cy="58.8" r="1.9" fill="#ffffff" />
        <circle cx="72.2" cy="58.8" r="1.9" fill="#ffffff" />
      </motion.g>
    </svg>
  );
}

function RagdollFace() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="A cute ragdoll cat">
      {/* ears */}
      <motion.g
        animate={{ rotate: [0, 4, 0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'bottom center' }}
      >
        <path d="M22 50 L27 10 L55 36 Z" fill="#a8907e" />
        <path d="M29 45 L32 22 L48 37 Z" fill="#f0b8bd" />
        <path d="M98 50 L93 10 L65 36 Z" fill="#a8907e" />
        <path d="M91 45 L88 22 L72 37 Z" fill="#f0b8bd" />
      </motion.g>

      {/* fluffy head */}
      <g fill="#f7efe6" stroke="#e0cfbd" strokeWidth="1.5">
        <circle cx="32" cy="76" r="13" />
        <circle cx="88" cy="76" r="13" />
        <ellipse cx="60" cy="66" rx="34" ry="30" />
      </g>
      {/* colorpoint mask */}
      <ellipse cx="60" cy="74" rx="23" ry="16" fill="#e5d2c2" opacity="0.75" />

      {/* whiskers */}
      <g stroke="#cbb8a6" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M34 73 L11 68" />
        <path d="M34 78 L10 79" />
        <path d="M35 83 L13 90" />
        <path d="M86 73 L109 68" />
        <path d="M86 78 L110 79" />
        <path d="M85 83 L107 90" />
      </g>

      {/* eyes — ragdoll blue */}
      <motion.g {...blink}>
        <ellipse cx="46" cy="64" rx="8" ry="9" fill="#4aa3dd" />
        <ellipse cx="74" cy="64" rx="8" ry="9" fill="#4aa3dd" />
        <ellipse cx="46" cy="64" rx="3.4" ry="6.4" fill="#12384f" />
        <ellipse cx="74" cy="64" rx="3.4" ry="6.4" fill="#12384f" />
        <circle cx="43.4" cy="60.6" r="2.4" fill="#ffffff" />
        <circle cx="71.4" cy="60.6" r="2.4" fill="#ffffff" />
      </motion.g>

      {/* nose + mouth */}
      <path d="M55.5 76 L64.5 76 L60 81.5 Z" fill="#eba3ab" />
      <g stroke="#c0a894" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M60 81.5 Q56 87 51.5 84" />
        <path d="M60 81.5 Q64 87 68.5 84" />
      </g>
    </svg>
  );
}

export default function ThemeMascot({ themeId, size = 72, className = '' }: Props) {
  const theme = getTheme(themeId);

  return (
    <motion.div
      animate={{ rotate: [0, -6, 6, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      style={{ width: size, height: size, transformOrigin: 'bottom center' }}
      className={`inline-block ${className}`}
    >
      {theme.mascot === 'shepherd' ? (
        <ShepherdFace />
      ) : theme.mascot === 'ragdoll' ? (
        <RagdollFace />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center leading-none"
          style={{ fontSize: size * 0.86 }}
        >
          {theme.emoji}
        </span>
      )}
    </motion.div>
  );
}
