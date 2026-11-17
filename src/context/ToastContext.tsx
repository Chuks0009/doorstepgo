import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { cn } from '@/utils';

type Tone = 'success' | 'error' | 'info';
interface Toast { id: number; title: string; body?: string; tone: Tone }
interface ToastCtx { toast: (t: { title: string; body?: string; tone?: Tone }) => void }

const Ctx = createContext<ToastCtx>({ toast: () => {} });
let n = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setItems((p) => p.filter((t) => t.id !== id)), []);
  const toast = useCallback<ToastCtx['toast']>(({ title, body, tone = 'success' }) => {
    const id = ++n;
    setItems((p) => [...p.slice(-3), { id, title, body, tone }]);
    setTimeout(() => dismiss(id), 4800);
  }, [dismiss]);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 top-3 z-[120] flex flex-col items-center gap-2 px-4 sm:top-auto sm:right-6 sm:bottom-6 sm:left-auto sm:items-end">
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const Icon = t.tone === 'success' ? CircleCheck : t.tone === 'error' ? CircleAlert : Info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                role={t.tone === 'error' ? 'alert' : 'status'}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-ink-900/95 p-4 text-white shadow-lift backdrop-blur-xl"
              >
                <Icon className={cn('mt-0.5 size-5 shrink-0', t.tone === 'success' && 'text-emerald-400', t.tone === 'error' && 'text-red-400', t.tone === 'info' && 'text-brand-300')} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.body && <p className="mt-0.5 text-[13px] text-white/70">{t.body}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Dismiss notification">
                  <X className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx).toast;
