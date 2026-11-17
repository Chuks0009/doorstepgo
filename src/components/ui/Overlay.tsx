import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/utils';
import { useLockBody } from '@/hooks';

function useFocusTrap(open: boolean, ref: React.RefObject<HTMLElement | null>, onCloseProp: () => void) {
  // Keep the latest onClose in a ref so re-renders with new callbacks don't re-run the trap (and steal focus).
  const closeRef = useRef(onCloseProp);
  closeRef.current = onCloseProp;
  useEffect(() => {
    if (!open) return;
    const onClose = () => closeRef.current();
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusables = () => el?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])') ?? [];
    requestAnimationFrame(() => (focusables()[0] ?? el)?.focus());
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !el) return;
      const f = [...focusables()];
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      prev?.focus?.();
    };
  }, [open, ref]);
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: ReactNode; description?: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useLockBody(open);
  useFocusTrap(open, ref, onClose);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            tabIndex={-1}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-3xl',
              size === 'sm' && 'sm:max-w-md',
              size === 'md' && 'sm:max-w-lg',
              size === 'lg' && 'sm:max-w-2xl',
              size === 'xl' && 'sm:max-w-4xl',
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 pt-6 pb-4">
              <div>
                <h2 id={`${id}-t`} className="text-xl font-bold text-ink-900">{title}</h2>
                {description && <p className="mt-1 text-sm text-text-2">{description}</p>}
              </div>
              <button onClick={onClose} className="-mt-1 -mr-2 rounded-xl p-2 text-muted transition hover:bg-surface-2 hover:text-text" aria-label="Close dialog">
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-line bg-surface-2/50 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, children, side = 'right', className, dark, width = 420 }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; side?: 'left' | 'right'; className?: string; dark?: boolean; width?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useLockBody(open);
  useFocusTrap(open, ref, onClose);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            tabIndex={-1}
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            style={{ width: `min(94vw, ${width}px)` }}
            className={cn('absolute top-0 bottom-0 flex flex-col shadow-lift', side === 'right' ? 'right-0' : 'left-0', dark ? 'bg-ink-900 text-white' : 'bg-white', className)}
          >
            <div className={cn('flex items-center justify-between border-b px-5 py-4', dark ? 'border-white/10' : 'border-line')}>
              <div id={`${id}-t`} className="font-display text-lg font-bold">{title}</div>
              <button onClick={onClose} className={cn('rounded-xl p-2 transition', dark ? 'text-white/70 hover:bg-white/10' : 'text-muted hover:bg-surface-2')} aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function AccordionItem({ question, children, defaultOpen = false, dark }: { question: ReactNode; children: ReactNode; defaultOpen?: boolean; dark?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={cn('rounded-2xl border transition-colors', dark ? 'border-white/10 bg-white/[0.04]' : 'border-line bg-white', open && (dark ? 'border-go-500/40' : 'border-go-200 shadow-soft'))}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-p`}
          id={`${id}-b`}
          onClick={() => setOpen((o) => !o)}
          className={cn('flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-sans text-[15px] font-semibold tracking-normal sm:text-base', dark ? 'text-white' : 'text-ink-900')}
        >
          {question}
          <span className={cn('grid size-8 shrink-0 place-items-center rounded-full transition-all duration-300', open ? 'rotate-180 bg-go-500 text-white' : dark ? 'bg-white/10 text-white' : 'bg-surface-2 text-ink-700')}>
            <ChevronDown className="size-4" aria-hidden />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-p`}
            role="region"
            aria-labelledby={`${id}-b`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className={cn('px-5 pb-5 text-[15px] leading-relaxed', dark ? 'text-white/70' : 'text-text-2')}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
