import { useId, type CSSProperties } from 'react';

export type DishVisual = 'ramen-cream' | 'ramen-amber' | 'ramen-red' | 'sushi-maki' | 'sushi-nigiri' | 'donburi' | 'small-plate' | 'cup';

const BROTHS: Record<string, [string, string]> = {
  'ramen-cream': ['#fbf2e0', '#e5c99c'],
  'ramen-amber': ['#e9b670', '#a8692a'],
  'ramen-red': ['#e8724b', '#a3321d'],
};

/**
 * Top-down dish illustrations for the menu. Generic placeholders by type, not depictions of
 * specific menu items; replace with real photography once the menu is confirmed.
 */
export function DishArt({ visual, className = '', style }: { visual: DishVisual | string; className?: string; style?: CSSProperties }) {
  const id = useId().replace(/:/g, '');
  const common = { viewBox: '0 0 200 200', className, style, 'aria-hidden': true as const };

  if (visual.startsWith('ramen')) {
    const [a, b] = BROTHS[visual] ?? BROTHS['ramen-cream'];
    return (
      <svg {...common}>
        <defs>
          <radialGradient id={`b${id}`} cx="45%" cy="40%" r="65%">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </radialGradient>
          <radialGradient id={`y${id}`}>
            <stop offset="0" stopColor="#d96a05" />
            <stop offset="0.7" stopColor="#f2a531" />
            <stop offset="1" stopColor="#f6c35a" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill="#0c0c0c" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="#D7392B" strokeWidth="3" />
        <circle cx="100" cy="100" r="82" fill={`url(#b${id})`} />
        <g fill="none" stroke="#efd497" strokeWidth="3.2" strokeLinecap="round" opacity="0.95">
          <path d="M40 112c22-8 50 10 82-4s30-2 38 4" />
          <path d="M44 124c26-6 44 8 76-2s28 0 36 6" />
          <path d="M52 136c20-4 40 6 66 0s22 0 30 4" />
        </g>
        <g>
          <circle cx="70" cy="70" r="24" fill="#cf8b6f" stroke="#6a3318" strokeWidth="4" />
          <path d="M70 70m-4 0a4 4 0 1 1 8 0a9 9 0 1 1-18 0a14 14 0 1 1 28 0" fill="none" stroke="#f8e6d2" strokeWidth="2.5" opacity="0.8" />
          <circle cx="92" cy="56" r="21" fill="#d4917a" stroke="#6a3318" strokeWidth="4" />
          <path d="M92 56m-3 0a3 3 0 1 1 6 0a8 8 0 1 1-16 0a12 12 0 1 1 24 0" fill="none" stroke="#f8e6d2" strokeWidth="2.5" opacity="0.8" />
        </g>
        <g>
          <ellipse cx="136" cy="78" rx="19" ry="14" fill="#f6efe2" stroke="#b8763c" strokeWidth="3" />
          <ellipse cx="136" cy="78" rx="10" ry="8" fill={`url(#y${id})`} />
          <ellipse cx="128" cy="104" rx="18" ry="13" fill="#f6efe2" stroke="#b8763c" strokeWidth="3" transform="rotate(-25 128 104)" />
          <ellipse cx="128" cy="104" rx="9.5" ry="7.5" fill={`url(#y${id})`} transform="rotate(-25 128 104)" />
        </g>
        <rect x="40" y="36" width="34" height="46" rx="2" fill="#0f1a13" transform="rotate(-36 57 59)" />
        <g fill="none" stroke="#6fae3e" strokeWidth="2.4">
          {[[104, 128], [112, 134], [98, 138], [118, 126], [108, 142], [92, 130], [122, 138]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" stroke={i % 3 === 0 ? '#dfe9c4' : '#6fae3e'} />
          ))}
        </g>
        <g fill="#efe2c4">
          {[[60, 150], [84, 156], [146, 128], [150, 140], [72, 100], [118, 152], [140, 60]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="1.6" ry="1" />
          ))}
        </g>
      </svg>
    );
  }

  if (visual === 'sushi-maki' || visual === 'sushi-nigiri') {
    const maki = visual === 'sushi-maki';
    return (
      <svg {...common}>
        <rect x="18" y="38" width="164" height="124" rx="10" fill="#2b2d2f" />
        <rect x="18" y="38" width="164" height="124" rx="10" fill="none" stroke="#3b3e41" strokeWidth="2" />
        {maki
          ? [[52, 78], [96, 74], [140, 78], [60, 122], [104, 124], [148, 120]].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="19" fill="#0f1a13" />
                <circle cx={x} cy={y} r="16" fill="#efeae0" />
                <ellipse cx={x - 2} cy={y + 1} rx="7" ry="5.5" fill="#f07a4a" />
                <circle cx={x + 5} cy={y - 4} r="3.4" fill="#4d8a35" />
              </g>
            ))
          : [[46, 100], [82, 100], [118, 100], [154, 100]].map(([x, y], i) => (
              <g key={i} transform={`rotate(-12 ${x} ${y})`}>
                <rect x={x - 14} y={y - 30} width="28" height="60" rx="13" fill="#efeae0" />
                <rect x={x - 16} y={y - 33} width="32" height="64" rx="14" fill={i % 2 ? '#f07a4a' : '#e9604a'} />
                {[-18, -6, 6, 18].map((d) => (
                  <path key={d} d={`M${x - 12} ${y + d}q12 -5 24 0`} stroke="#ffc3a2" strokeWidth="2.2" fill="none" />
                ))}
              </g>
            ))}
      </svg>
    );
  }

  if (visual === 'donburi') {
    return (
      <svg {...common}>
        <circle cx="100" cy="100" r="92" fill="#1a1a1a" />
        <circle cx="100" cy="100" r="84" fill="none" stroke="#D7392B" strokeWidth="2" />
        <circle cx="100" cy="100" r="78" fill="#efeae0" />
        <g fill="#b8743e" stroke="#7a4420" strokeWidth="2">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={58 + i * 17} y={64 + (i % 2) * 6} width="20" height="58" rx="6" transform={`rotate(${-14 + i * 6} ${68 + i * 17} 94)`} />
          ))}
        </g>
        <g fill="none" stroke="#6fae3e" strokeWidth="2.4">
          {[[86, 136], [100, 142], [114, 136], [92, 148], [108, 150]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" />
          ))}
        </g>
      </svg>
    );
  }

  if (visual === 'cup') {
    return (
      <svg {...common}>
        <circle cx="100" cy="100" r="70" fill="#262626" />
        <circle cx="100" cy="100" r="62" fill="#efe6d6" />
        <circle cx="100" cy="100" r="54" fill={`url(#t${id})`} />
        <defs>
          <radialGradient id={`t${id}`} cx="40%" cy="38%">
            <stop offset="0" stopColor="#b9a35a" />
            <stop offset="1" stopColor="#6f6326" />
          </radialGradient>
        </defs>
        <ellipse cx="84" cy="82" rx="16" ry="8" fill="#fff" opacity="0.18" transform="rotate(-30 84 82)" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="100" cy="100" r="80" fill="#f2ede4" />
      <circle cx="100" cy="100" r="66" fill="none" stroke="#D7392B" strokeWidth="2" opacity="0.6" />
      <g fill="#d9a35a" stroke="#9a6328" strokeWidth="2.5">
        <ellipse cx="78" cy="92" rx="24" ry="15" transform="rotate(-20 78 92)" />
        <ellipse cx="118" cy="86" rx="24" ry="15" transform="rotate(15 118 86)" />
        <ellipse cx="100" cy="124" rx="24" ry="15" />
      </g>
    </svg>
  );
}
