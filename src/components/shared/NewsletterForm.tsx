import { useState } from 'react';
import { ArrowRight, CircleCheck, Mail } from 'lucide-react';
import { supportService } from '@/services/api';
import { email as emailRule } from '@/utils/validation';
import { cn } from '@/utils';

export function NewsletterForm({ dark = true, className }: { dark?: boolean; className?: string }) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string>();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = !value.trim() ? 'Enter your email address' : emailRule()(value, {});
    if (err) return setError(err);
    setError(undefined);
    setState('loading');
    const res = await supportService.subscribe(value.trim());
    if (!res.ok) {
      setError(res.error);
      setState('idle');
      return;
    }
    setState('done');
  };

  if (state === 'done') {
    return (
      <div role="status" className={cn('flex items-center gap-3 rounded-2xl px-4 py-3.5', dark ? 'bg-white/10 text-white' : 'bg-ok-bg text-ok', className)}>
        <CircleCheck className="size-5 shrink-0" aria-hidden />
        <p className="text-sm font-medium">You're on the list! (Demo — saved in this browser only.)</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={className}>
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <div className={cn('flex items-center gap-1.5 rounded-2xl p-1.5 transition focus-within:ring-4', dark ? 'bg-white/10 ring-go-500/30 backdrop-blur' : 'border border-line-strong bg-white ring-brand-500/15')}>
        <Mail className={cn('ml-2.5 size-5 shrink-0', dark ? 'text-white/50' : 'text-muted')} aria-hidden />
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? 'newsletter-err' : undefined}
          className={cn('min-w-0 flex-1 bg-transparent px-1 py-2.5 text-[15px] outline-none', dark ? 'text-white placeholder:text-white/40' : 'text-text placeholder:text-muted')}
        />
        <button type="submit" disabled={state === 'loading'} className="group flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-go-sheen px-4 text-sm font-semibold text-white shadow-glow-go transition hover:brightness-110 disabled:opacity-60">
          {state === 'loading' ? 'Joining…' : 'Subscribe'}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
      </div>
      {error && <p id="newsletter-err" role="alert" className={cn('mt-2 text-[13px] font-medium', dark ? 'text-go-300' : 'text-crit')}>{error}</p>}
    </form>
  );
}
