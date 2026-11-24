import { isPlaceholder } from '../../lib/placeholder';

/** Renders a confirmed value as text, or a dashed placeholder chip while it awaits the owner. */
export function Ph({ value, className = '' }: { value: string | null | undefined; className?: string }) {
  if (!isPlaceholder(value)) return <>{value}</>;
  return (
    <span className={`ph ${className}`} title="Placeholder: awaiting owner confirmation">
      {value ?? '{{TBC}}'}
    </span>
  );
}
