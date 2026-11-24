/** Drifting steam wisps that bridge two chapters. Pure CSS/SVG; hidden for reduced motion. */
const WISPS = [
  { left: '12%', dur: '11s', delay: '0s', dx: '18px', o: 0.35, w: 180 },
  { left: '34%', dur: '9s', delay: '-3s', dx: '-14px', o: 0.28, w: 140 },
  { left: '58%', dur: '12s', delay: '-6s', dx: '22px', o: 0.32, w: 200 },
  { left: '80%', dur: '10s', delay: '-1.5s', dx: '-20px', o: 0.26, w: 150 },
];

export function SteamDivider({ tint = '#FAF8F3' }: { tint?: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none relative z-20 h-0">
      <div className="absolute inset-x-0 -top-40 h-80 overflow-hidden">
        {WISPS.map((w, i) => (
          <svg
            key={i}
            viewBox="0 0 100 300"
            className="steam-wisp absolute bottom-0"
            style={{ left: w.left, width: w.w, ['--steam-dur' as string]: w.dur, ['--steam-delay' as string]: w.delay, ['--steam-dx' as string]: w.dx, ['--steam-o' as string]: w.o, filter: 'blur(14px)' }}
          >
            <path d="M50 300C20 240 80 200 48 150S30 60 55 0" fill="none" stroke={tint} strokeWidth="26" strokeLinecap="round" />
          </svg>
        ))}
      </div>
    </div>
  );
}
