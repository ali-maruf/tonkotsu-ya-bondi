import hours from '../data/hours.json';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type Range = { open: string; close: string };

export const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const DAY_LABELS: Record<DayKey, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

const days = hours.days as Record<DayKey, Range[] | null>;
export const TIMEZONE = hours.timezone;
export const HOURS_PLACEHOLDER = hours.placeholder;
export const hoursKnown = DAY_KEYS.every((d) => Array.isArray(days[d]));

export function rangesFor(day: DayKey): Range[] | null {
  return days[day];
}

/** Current weekday and minutes since midnight in Australia/Sydney, independent of the visitor's zone. */
export function sydneyNow(date = new Date()): { day: DayKey; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-AU', { timeZone: TIMEZONE, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = get('weekday').slice(0, 3).toLowerCase() as DayKey;
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 && h < 24 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`;
}

export type OpenStatus =
  | { state: 'unknown'; label: string }
  | { state: 'open'; label: string; closesAt: string }
  | { state: 'closed'; label: string; opensAt?: string };

/** Live status from hours.json. Handles ranges that run past midnight. */
export function openStatus(date = new Date()): OpenStatus {
  if (!hoursKnown) return { state: 'unknown', label: 'Hours to be confirmed' };
  const { day, minutes } = sydneyNow(date);
  const idx = DAY_KEYS.indexOf(day);
  const prev = DAY_KEYS[(idx + 6) % 7];

  for (const r of days[prev] ?? []) {
    const o = toMin(r.open), c = toMin(r.close);
    if (c <= o && minutes < c) return { state: 'open', label: `Open now · until ${formatTime(r.close)}`, closesAt: r.close };
  }
  for (const r of days[day] ?? []) {
    const o = toMin(r.open), c = toMin(r.close);
    const overnight = c <= o;
    if (minutes >= o && (overnight || minutes < c)) return { state: 'open', label: `Open now · until ${formatTime(r.close)}`, closesAt: r.close };
  }
  const later = (days[day] ?? []).find((r) => toMin(r.open) > minutes);
  if (later) return { state: 'closed', label: `Closed · opens ${formatTime(later.open)}`, opensAt: later.open };
  for (let i = 1; i <= 7; i++) {
    const d = DAY_KEYS[(idx + i) % 7];
    const first = (days[d] ?? [])[0];
    if (first) return { state: 'closed', label: `Closed · opens ${i === 1 ? 'tomorrow' : DAY_LABELS[d]} ${formatTime(first.open)}`, opensAt: first.open };
  }
  return { state: 'closed', label: 'Closed' };
}
