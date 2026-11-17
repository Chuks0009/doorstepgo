import { Check, Copy } from 'lucide-react';
import { useCopy } from '@/components/tracking/TrackingParts';

/** Reference chip with copy-to-clipboard for light surfaces. */
export function CopyChipLight({ text, label }: { text: string; label: string }) {
  const { copied, copy } = useCopy();
  const done = copied === text;
  return (
    <button
      type="button"
      onClick={() => copy(text, `${label} copied`)}
      className="inline-flex min-h-11 items-center gap-3 rounded-2xl border-2 border-dashed border-go-300 bg-go-50 px-4 font-mono text-base font-bold tracking-wider text-ink-900 transition hover:border-go-500"
      aria-label={`Copy ${label} ${text}`}
    >
      {text}
      {done ? <Check className="size-4 text-ok" aria-hidden /> : <Copy className="size-4 text-go-600" aria-hidden />}
    </button>
  );
}
