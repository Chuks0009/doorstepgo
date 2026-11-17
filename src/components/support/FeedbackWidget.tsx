import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { Button, Textarea } from '@/components/ui';
import { cn } from '@/utils';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
const TAGS = ['Fast pickup', 'Friendly rider', 'Fair price', 'Easy booking', 'Clear tracking', 'Needs improvement'];

/** Quick rating + comment. Demo only — nothing is sent anywhere. */
export function FeedbackWidget({ dark = true }: { dark?: boolean }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const shown = hover || rating;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!rating) return setError('Pick a star rating first.');
    setError(undefined);
    setSent(true);
  };

  const keyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setRating((r) => Math.min(5, r + 1));
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setRating((r) => Math.max(1, r - 1));
    }
  };

  return (
    <div className={cn('rounded-3xl p-6', dark ? 'border border-white/10 bg-white/[0.04] text-white' : 'card')}>
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div key="thanks" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center" role="status">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }} className="mx-auto grid size-14 place-items-center rounded-full bg-go-sheen shadow-glow-go">
              <Heart className="size-6 fill-white text-white" aria-hidden />
            </motion.span>
            <p className="mt-4 font-display text-xl font-bold">Thank you!</p>
            <p className={cn('mt-1 text-sm', dark ? 'text-white/65' : 'text-text-2')}>You rated us {rating}/5 — “{LABELS[rating]}”. Feedback is a demo and wasn't sent anywhere.</p>
            <button type="button" onClick={() => { setSent(false); setRating(0); setTags([]); setComment(''); }} className={cn('mt-4 text-sm font-semibold underline-offset-4 hover:underline', dark ? 'text-go-300' : 'text-brand-700')}>
              Leave more feedback
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold">How was your experience?</p>
                <p className={cn('text-sm', dark ? 'text-white/60' : 'text-text-2')}>Quick feedback helps us improve every trip.</p>
              </div>
              <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase', dark ? 'border border-go-400/40 bg-go-500/15 text-go-300' : 'bg-brand-50 text-brand-700')}>Demo</span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div role="radiogroup" aria-label="Rating out of 5" className="flex gap-1" onKeyDown={keyNav} onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? 's' : ''} — ${LABELS[n]}`}
                    tabIndex={rating === n || (!rating && n === 1) ? 0 : -1}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    className="grid size-11 place-items-center rounded-xl transition hover:scale-110 active:scale-95"
                  >
                    <Star className={cn('size-7 transition-colors', n <= shown ? 'fill-go-500 text-go-500' : dark ? 'text-white/25' : 'text-line-strong')} aria-hidden />
                  </button>
                ))}
              </div>
              <span className={cn('text-sm font-semibold', dark ? 'text-white/80' : 'text-ink-900')} aria-hidden>{LABELS[shown]}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="What stood out?">
              {TAGS.map((t) => {
                const on = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTags((p) => (on ? p.filter((x) => x !== t) : [...p, t]))}
                    className={cn(
                      'min-h-9 rounded-full border px-3 text-xs font-semibold transition',
                      on ? 'border-go-500 bg-go-500 text-white' : dark ? 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10' : 'border-line-strong bg-white text-text-2 hover:border-brand-300',
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            <div className={cn('mt-4', dark && '[&_label]:text-white [&_.field-input]:border-white/10 [&_.field-input]:bg-white/[0.06] [&_.field-input]:text-white [&_.field-input]:placeholder:text-white/40 [&_p]:text-white/50')}>
              <Textarea label="Comment" optional rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us what went well or what we can do better…" />
            </div>
            {error && <p role="alert" className="mt-3 text-sm font-medium text-red-400">{error}</p>}
            <Button type="submit" variant={dark ? 'white' : 'ink'} className="mt-4" block>Send feedback</Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
