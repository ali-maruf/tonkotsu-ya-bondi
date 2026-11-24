export function ChapterHeading({ n, label, jp, tone = 'dark' }: { n: string; label: string; jp?: string; tone?: 'dark' | 'light' }) {
  return (
    <div className={`flex items-center gap-3 ${tone === 'dark' ? 'text-washi-50/80' : 'text-charcoal-950/75'}`}>
      <span className={`label ${tone === 'dark' ? 'text-vermilion-400' : 'text-vermilion-600'}`}>{n}</span>
      <span className="rule" aria-hidden="true" />
      <span className="label">{label}</span>
      {jp && (
        <span className="jp text-sm opacity-60" aria-hidden="true">
          {jp}
        </span>
      )}
    </div>
  );
}
