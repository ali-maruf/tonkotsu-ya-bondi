/**
 * Lightweight CSS noren used until the WebGL curtain is ready (and as its graceful fallback).
 * Reads --o (0 closed .. 1 open) from an ancestor.
 */
export function CssNoren({ color = 'var(--vermilion-600)', ink = 'var(--washi-50)', glyphs = ['豚骨', 'ラーメン'], hidden = false }: { color?: string; ink?: string; glyphs?: [string, string]; hidden?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500" style={{ opacity: hidden ? 0 : 1 }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="absolute top-0 flex h-full w-1/2 items-end justify-center pb-[18vh] md:items-start md:pb-0 md:pt-[16vh]"
          style={{
            [i ? 'right' : 'left']: 0,
            background: `linear-gradient(90deg, rgb(0 0 0 / 0.08), transparent 30%, rgb(0 0 0 / 0.06) 70%, transparent), ${color}`,
            transform: `translateX(calc(var(--o, 0) * ${i ? '' : '-'}105%)) skewX(calc(var(--o, 0) * ${i ? '' : '-'}4deg))`,
            transformOrigin: 'top',
            borderTop: '18px solid rgb(0 0 0 / 0.28)',
          }}
        >
          <span className="jp text-[clamp(56px,8vw,120px)] leading-[1.05]" style={{ color: ink, writingMode: 'vertical-rl' }}>
            {glyphs[i]}
          </span>
        </div>
      ))}
    </div>
  );
}
