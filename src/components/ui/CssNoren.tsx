/**
 * CSS noren curtain in real 3D: two fabric panels hinged at the outer edges swing open toward the
 * viewer (rotateY with perspective) while sliding apart, with a shading gradient that darkens as each
 * panel turns away from the light. Reads --o (0 closed .. 1 open) from an ancestor.
 */
export function CssNoren({ color = 'var(--vermilion-600)', ink = 'var(--washi-50)', glyphs = ['豚骨', 'ラーメン'], hidden = false }: { color?: string; ink?: string; glyphs?: [string, string]; hidden?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] transition-opacity duration-500" style={{ opacity: hidden ? 0 : 'calc(1.6 - var(--o, 0) * 1.6)', perspective: '1400px', perspectiveOrigin: '50% 30%' }}>
      {[0, 1].map((i) => {
        const s = i ? '' : '-';
        return (
          <div
            key={i}
            className="absolute top-0 flex h-full w-1/2 items-end justify-center pb-[18vh] md:items-start md:pb-0 md:pt-[16vh]"
            style={{
              [i ? 'right' : 'left']: 0,
              background: `linear-gradient(90deg, rgb(0 0 0 / 0.1), transparent 30%, rgb(0 0 0 / 0.08) 70%, transparent), ${color}`,
              transformOrigin: i ? 'right center' : 'left center',
              transform: `translateX(calc(var(--o, 0) * ${s}40%)) translateZ(calc(var(--o, 0) * 220px)) rotateY(calc(var(--o, 0) * ${i ? '-' : ''}82deg)) rotateZ(calc(var(--o, 0) * ${s}3deg))`,
              borderTop: '18px solid rgb(0 0 0 / 0.28)',
              boxShadow: 'inset 0 -40px 60px rgb(0 0 0 / 0.12)',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* turning away from the light */}
            <div className="absolute inset-0" style={{ background: 'rgb(0 0 0)', opacity: 'calc(var(--o, 0) * 0.55)' }} />
            <span className="jp relative text-[clamp(56px,8vw,120px)] leading-[1.05]" style={{ color: ink, writingMode: 'vertical-rl' }}>
              {glyphs[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
