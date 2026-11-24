import { useEffect, useState } from 'react';
import { HOURS_PLACEHOLDER, openStatus, type OpenStatus } from '../../lib/hours';

export function useOpenStatus() {
  const [status, setStatus] = useState<OpenStatus>(() => openStatus());
  useEffect(() => {
    const id = setInterval(() => setStatus(openStatus()), 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

/** Live open/closed pill, computed in Australia/Sydney time from hours.json. */
export function OpenStatusPill({ className = '' }: { className?: string }) {
  const s = useOpenStatus();
  const dot = s.state === 'open' ? 'bg-emerald-400' : s.state === 'closed' ? 'bg-vermilion-400' : 'bg-washi-50/40';
  return (
    <span className={`inline-flex items-center gap-2 text-[12px] font-medium ${className}`} role="status" aria-live="polite">
      <span className={`relative h-2 w-2 rounded-full ${dot}`}>
        {s.state === 'open' && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />}
      </span>
      {s.state === 'unknown' ? (
        <span>
          Hours <span className="ph">{HOURS_PLACEHOLDER}</span>
        </span>
      ) : (
        s.label
      )}
    </span>
  );
}
