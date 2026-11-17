/* Flat-illustration team portrait built from the `team` palette (skin / hair / accent).
   PLACEHOLDER artwork — swap for real photography by replacing <IllustratedAvatar/>
   with <img> in TeamSection, or by adding photo URLs to `team` in src/data/content.ts. */
import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

type HairStyle = 'afro' | 'fade' | 'bun' | 'gele' | 'kufi' | 'locs' | 'curly';
const STYLES: HairStyle[] = ['gele', 'fade', 'bun', 'afro', 'kufi', 'locs', 'curly'];

/** Darken / lighten a #rrggbb colour by `amt` (-1…1). */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  const ch = (s: number) => {
    const c = (n >> s) & 255;
    const v = amt < 0 ? c * (1 + amt) : c + (255 - c) * amt;
    return Math.round(Math.max(0, Math.min(255, v)));
  };
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('')}`;
}

export function IllustratedAvatar({
  skin,
  hair,
  accent,
  index = 0,
  name,
  className,
  animate = true,
}: {
  skin: string;
  hair: string;
  accent: string;
  index?: number;
  name: string;
  className?: string;
  animate?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const style = STYLES[index % STYLES.length];
  const skinShadow = shade(skin, -0.22);
  const skinLight = shade(skin, 0.12);
  const accentDark = shade(accent, -0.35);
  const accentLight = shade(accent, 0.35);
  const hasGlasses = index === 1 || index === 4;
  const hasEarrings = style === 'gele' || style === 'bun' || style === 'locs';
  const hasBeard = style === 'kufi' || style === 'curly';
  const hasHeadset = index === 6;
  const jacket = index % 2 === 1;

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`Illustrated portrait of ${name} (placeholder)`} className={cn('block size-full', className)}>
      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0f1f55" />
          <stop offset="1" stopColor="#050b22" />
        </linearGradient>
        <radialGradient id={`glow${uid}`} cx="0.7" cy="0.25" r="0.7">
          <stop offset="0" stopColor={accent} stopOpacity="0.75" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`shirt${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor={accentDark} />
        </linearGradient>
        <clipPath id={`clip${uid}`}>
          <rect width="200" height="200" />
        </clipPath>
      </defs>

      <g clipPath={`url(#clip${uid})`}>
        {/* Background */}
        <rect width="200" height="200" fill={`url(#bg${uid})`} />
        <rect width="200" height="200" fill={`url(#glow${uid})`} />
        <circle cx="100" cy="112" r="70" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1.5" />
        <circle cx="100" cy="112" r="88" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.5" strokeDasharray="4 6" />
        {/* speed lines */}
        <g stroke="#FF6A13" strokeLinecap="round" opacity="0.85">
          <line x1="150" y1="34" x2="186" y2="34" strokeWidth="3" />
          <line x1="160" y1="44" x2="190" y2="44" strokeWidth="3" strokeOpacity="0.6" />
          <line x1="168" y1="54" x2="192" y2="54" strokeWidth="3" strokeOpacity="0.35" />
        </g>

        {/* Back hair */}
        {style === 'afro' && (
          <g fill={hair}>
            <circle cx="100" cy="72" r="48" />
            {[[58, 70], [142, 70], [66, 44], [134, 44], [100, 28], [80, 32], [120, 32]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="16" />)}
          </g>
        )}
        {style === 'bun' && <circle cx="100" cy="40" r="18" fill={hair} />}
        {style === 'locs' && (
          <g fill={hair}>
            {[62, 70, 78, 122, 130, 138].map((x, i) => <rect key={i} x={x - 4} y={70} width="9" height={i % 3 === 1 ? 70 : 60} rx="4.5" />)}
          </g>
        )}

        {/* Shoulders / outfit */}
        <path d="M24 200 C 28 160, 60 140, 100 140 C 140 140, 172 160, 176 200 Z" fill={jacket ? '#16296b' : `url(#shirt${uid})`} />
        {jacket ? (
          <>
            <path d="M84 141 L100 176 L116 141 C 110 140, 90 140, 84 141 Z" fill={`url(#shirt${uid})`} />
            <path d="M84 141 L74 162 L92 160 L100 176 Z" fill="#0f1f55" />
            <path d="M116 141 L126 162 L108 160 L100 176 Z" fill="#0f1f55" />
          </>
        ) : (
          <path d="M84 142 Q100 160 116 142" fill="none" stroke={accentLight} strokeWidth="4" strokeLinecap="round" />
        )}

        {/* Neck */}
        <rect x="87" y="114" width="26" height="34" rx="11" fill={skin} />
        <path d="M87 124 Q100 134 113 124 L113 118 L87 118 Z" fill={skinShadow} opacity="0.7" />

        {/* Ears */}
        <circle cx="66" cy="96" r="8" fill={skin} />
        <circle cx="134" cy="96" r="8" fill={skin} />
        {hasEarrings && (
          <g fill="#ffc857">
            <circle cx="66" cy="107" r="3.5" />
            <circle cx="134" cy="107" r="3.5" />
          </g>
        )}

        {/* Head */}
        <ellipse cx="100" cy="92" rx="34" ry="40" fill={skin} />
        <ellipse cx="88" cy="74" rx="12" ry="7" fill={skinLight} opacity="0.35" />

        {/* Beard */}
        {hasBeard && <path d="M67 96 C 68 126, 86 134, 100 134 C 114 134, 132 126, 133 96 C 127 114, 114 120, 100 120 C 86 120, 73 114, 67 96 Z" fill={hair} />}

        {/* Front hair / headwear */}
        {style === 'afro' && <path d="M66 86 C 66 58, 134 58, 134 86 C 122 72, 78 72, 66 86 Z" fill={hair} />}
        {style === 'fade' && (
          <>
            <path d="M66 90 C 62 54, 138 54, 134 90 C 130 74, 120 64, 100 64 C 82 64, 70 74, 66 90 Z" fill={hair} />
            <path d="M84 60 Q90 68 86 76" stroke={skinShadow} strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
        {style === 'bun' && <path d="M66 92 C 60 52, 140 52, 134 92 C 126 70, 112 62, 98 64 C 84 66, 72 74, 66 92 Z" fill={hair} />}
        {style === 'curly' && (
          <g fill={hair}>
            <path d="M66 88 C 64 58, 136 58, 134 88 C 124 72, 76 72, 66 88 Z" />
            {[72, 84, 96, 108, 120, 130].map((x, i) => <circle key={i} cx={x} cy={i % 2 ? 58 : 62} r="9" />)}
          </g>
        )}
        {style === 'locs' && (
          <g fill={hair}>
            <path d="M64 92 C 60 50, 140 50, 136 92 C 128 70, 112 62, 100 62 C 88 62, 72 70, 64 92 Z" />
          </g>
        )}
        {style === 'gele' && (
          <g>
            <path d="M58 88 C 48 52, 78 28, 104 30 C 134 32, 156 54, 142 90 C 128 70, 74 68, 58 88 Z" fill={accent} />
            <path d="M74 44 C 92 20, 128 22, 138 46 C 120 36, 96 36, 74 44 Z" fill={accentLight} />
            <path d="M120 30 C 140 14, 160 24, 150 44 C 144 34, 132 30, 120 30 Z" fill={accentDark} />
            <path d="M64 70 C 90 56, 120 56, 140 70" stroke={accentLight} strokeWidth="3" fill="none" opacity="0.7" />
          </g>
        )}
        {style === 'kufi' && (
          <g>
            <path d="M66 74 C 66 46, 134 46, 134 74 Z" fill={accent} />
            <rect x="64" y="70" width="72" height="9" rx="4.5" fill={accentDark} />
            {[78, 92, 106, 120].map((x) => <circle key={x} cx={x} cy="60" r="2.4" fill={accentLight} />)}
          </g>
        )}

        {/* Eyebrows */}
        <g stroke={hair === '#000000' ? '#111' : hair} strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M80 84 Q87 80 94 83" />
          <path d="M106 83 Q113 80 120 84" />
        </g>

        {/* Eyes (blink) */}
        <motion.g
          style={{ transformOrigin: '100px 95px' }}
          animate={animate ? { scaleY: [1, 1, 0.1, 1] } : undefined}
          transition={animate ? { duration: 4.2, times: [0, 0.92, 0.96, 1], repeat: Infinity, delay: index * 0.6 } : undefined}
          fill="#14110f"
        >
          <ellipse cx="87" cy="95" rx="3.6" ry="4.2" />
          <ellipse cx="113" cy="95" rx="3.6" ry="4.2" />
          <circle cx="88.4" cy="93.6" r="1.1" fill="#fff" />
          <circle cx="114.4" cy="93.6" r="1.1" fill="#fff" />
        </motion.g>

        {/* Glasses */}
        {hasGlasses && (
          <g fill="none" stroke="#0a1640" strokeWidth="2.6">
            <rect x="76" y="87" width="22" height="16" rx="6" fill="#ffffff" fillOpacity="0.12" />
            <rect x="102" y="87" width="22" height="16" rx="6" fill="#ffffff" fillOpacity="0.12" />
            <path d="M98 94 Q100 92 102 94" />
            <path d="M76 93 L68 91" />
            <path d="M124 93 L132 91" />
          </g>
        )}

        {/* Nose, cheeks, smile */}
        <path d="M100 98 Q96 108 101 109" stroke={skinShadow} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <circle cx="80" cy="108" r="5.5" fill={accent} opacity="0.22" />
        <circle cx="120" cy="108" r="5.5" fill={accent} opacity="0.22" />
        {hasBeard ? (
          <path d="M90 113 Q100 121 110 113 Q100 117 90 113 Z" fill="#fff" stroke="#3a1e10" strokeWidth="2" strokeLinejoin="round" />
        ) : (
          <path d="M89 112 Q100 123 111 112 Z" fill="#fff" stroke="#3a1e10" strokeWidth="2.4" strokeLinejoin="round" />
        )}

        {/* Headset for the crew */}
        {hasHeadset && (
          <g fill="none" stroke="#0a1640" strokeWidth="4.5" strokeLinecap="round">
            <path d="M62 96 C 58 46, 142 46, 138 96" />
            <rect x="56" y="88" width="12" height="20" rx="5" fill="#FF6A13" stroke="none" />
            <rect x="132" y="88" width="12" height="20" rx="5" fill="#FF6A13" stroke="none" />
            <path d="M62 106 C 64 120, 76 124, 86 122" strokeWidth="3" />
            <circle cx="88" cy="122" r="3.5" fill="#0a1640" stroke="none" />
          </g>
        )}
      </g>
    </svg>
  );
}
