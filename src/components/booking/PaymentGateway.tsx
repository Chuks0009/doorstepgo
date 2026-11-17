/* Simulated hosted-payment gateway. It NEVER collects real card or bank
   details — it shows read-only test credentials and lets the user choose a
   simulated outcome. A real integration (Paystack / Flutterwave) would
   initialise the transaction server-side and redirect / open its own SDK. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CircleX, Copy, FlaskConical, Hash, Landmark, LoaderCircle, Lock, RotateCcw, ShieldCheck, Smartphone, Timer } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useInterval } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { paymentService } from '@/services/api';
import type { PaymentMethodKind, PaymentRecord } from '@/types';
import { cn, naira, sleep } from '@/utils';

type Phase = 'review' | 'processing' | 'failed';
const stages = ['Connecting to test gateway', 'Authorising (simulated)', 'Confirming your booking'];
const providers = ['OPay', 'PalmPay', 'MoMo PSB', 'Paga'];

function hashDigits(seed: string, n: number) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  let out = '';
  for (let i = 0; i < n; i++) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
    out += String(Math.abs(h) % 10);
  }
  return out;
}

export function PaymentGatewayModal({
  open, onClose, method, methodLabel, amount, reference, description, onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  method: PaymentMethodKind;
  methodLabel: string;
  amount: number;
  reference: string;
  description: string;
  onSuccess: (record: PaymentRecord) => void;
}) {
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>('review');
  const [stage, setStage] = useState(0);
  const [provider, setProvider] = useState(providers[0]);
  const [seconds, setSeconds] = useState(30 * 60);
  const account = useMemo(() => `99${hashDigits(reference, 8)}`, [reference]);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const close = useCallback(() => {
    if (phaseRef.current !== 'processing') closeRef.current();
  }, []);

  useEffect(() => {
    if (open) {
      setPhase('review');
      setStage(0);
      setSeconds(30 * 60);
    }
  }, [open]);
  useInterval(() => setSeconds((s) => Math.max(0, s - 1)), open && method === 'bank_transfer' && phase === 'review' ? 1000 : null);

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${what} copied`, tone: 'info' });
    } catch {
      toast({ title: 'Copy not available', body: text, tone: 'info' });
    }
  };

  const run = async (outcome: 'success' | 'failure') => {
    setPhase('processing');
    setStage(0);
    const tick = async () => {
      for (let i = 1; i < stages.length; i++) {
        await sleep(560);
        setStage(i);
      }
    };
    if (outcome === 'failure') {
      await tick();
      await sleep(400);
      setPhase('failed');
      return;
    }
    const [res] = await Promise.all([paymentService.charge({ bookingReference: reference, amount, method, description: `${description} · ${methodLabel}${method === 'mobile_money' ? ` (${provider})` : ''}` }), tick()]);
    if (res.ok) onSuccess(res.data);
    else {
      toast({ title: 'Payment failed', body: res.error, tone: 'error' });
      setPhase('failed');
    }
  };

  const ussd = `*000*${reference.slice(-4).replace(/\D/g, '0')}*${Math.round(amount)}#`;
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <Modal
      open={open}
      onClose={close}
      size="md"
      title={
        <span className="flex items-center gap-2">
          <Lock className="size-5 text-ok" aria-hidden /> DoorstepGo Test Checkout
        </span>
      }
      description="Simulated payment gateway — no real card data, no real money."
    >
      <div className="-mx-6 -mt-5 mb-5 flex items-center justify-between gap-3 bg-ink-900 px-6 py-4 text-white">
        <div className="min-w-0">
          <p className="truncate text-xs text-white/60">{description}</p>
          <p className="font-display text-2xl font-extrabold tabular-nums">{naira(amount)}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-go-500/20 px-3 py-1 text-[11px] font-bold tracking-wide text-go-200 uppercase">
          <FlaskConical className="size-3.5" aria-hidden /> Simulated
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {phase === 'review' && (
          <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {method === 'card' && (
              <div>
                <div className="relative overflow-hidden rounded-2xl bg-brand-sheen p-5 text-white shadow-glow-brand" aria-label="Read-only test card">
                  <span aria-hidden className="absolute -right-10 -bottom-16 size-48 rounded-full bg-go-500/40 blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase">Test card</span>
                    <span className="h-7 w-10 rounded-md bg-gradient-to-br from-amber-200 to-amber-400" aria-hidden />
                  </div>
                  <p className="relative mt-6 font-mono text-lg tracking-[0.18em] sm:text-xl">4000 0000 0000 0002</p>
                  <div className="relative mt-4 flex gap-8 text-xs">
                    <span><span className="block text-white/60">Expiry</span><span className="font-mono font-semibold">12/30</span></span>
                    <span><span className="block text-white/60">CVV</span><span className="font-mono font-semibold">•••</span></span>
                    <span><span className="block text-white/60">Holder</span><span className="font-semibold">DEMO USER</span></span>
                  </div>
                </div>
                <p className="mt-3 flex items-start gap-2 text-[13px] text-text-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden /> This test checkout never asks for your real card number, PIN or OTP. Choose an outcome below to simulate the payment.
                </p>
              </div>
            )}

            {method === 'bank_transfer' && (
              <div className="rounded-2xl border border-line bg-surface-2/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Landmark className="size-4 text-brand-600" aria-hidden /> Demo virtual account</p>
                  <span className="flex items-center gap-1 rounded-full bg-warn-bg px-2.5 py-0.5 text-xs font-bold text-warn tabular-nums" aria-label={`Expires in ${mm} minutes ${ss} seconds`}><Timer className="size-3.5" aria-hidden /> {mm}:{ss}</span>
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  {[
                    ['Bank', 'Demo Test Bank (not real)'],
                    ['Account number', account],
                    ['Account name', `DoorstepGo Checkout – DEMO`],
                    ['Amount', naira(amount)],
                  ].map(([k, val]) => (
                    <div key={k} className="flex items-center justify-between gap-3">
                      <dt className="text-text-2">{k}</dt>
                      <dd className="flex items-center gap-2 font-semibold text-ink-900">
                        <span className={cn(k === 'Account number' && 'font-mono text-base tracking-wider')}>{val}</span>
                        {k === 'Account number' && (
                          <button type="button" onClick={() => copy(account, 'Account number')} className="grid size-9 place-items-center rounded-lg text-brand-700 hover:bg-brand-50" aria-label="Copy account number"><Copy className="size-4" /></button>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-[13px] text-crit">Do not send real money to this account — it does not exist.</p>
              </div>
            )}

            {method === 'ussd' && (
              <div className="rounded-2xl border border-line bg-surface-2/50 p-5 text-center">
                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-ink-900"><Hash className="size-4 text-brand-600" aria-hidden /> Demo USSD code</p>
                <p className="mt-3 font-mono text-2xl font-bold tracking-wider text-ink-900">{ussd}</p>
                <Button size="sm" variant="soft" className="mt-3" iconLeft={<Copy className="size-4" />} onClick={() => copy(ussd, 'USSD code')}>Copy code</Button>
                <p className="mt-3 text-[13px] text-text-2">This is a placeholder code — dialling it does nothing. Choose an outcome below.</p>
              </div>
            )}

            {method === 'mobile_money' && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900"><Smartphone className="size-4 text-brand-600" aria-hidden /> Choose a provider (simulated)</p>
                <div role="radiogroup" aria-label="Mobile money provider" className="grid grid-cols-2 gap-2">
                  {providers.map((p) => (
                    <button key={p} type="button" role="radio" aria-checked={provider === p} onClick={() => setProvider(p)} className={cn('min-h-12 rounded-xl border-2 text-sm font-semibold transition', provider === p ? 'border-go-500 bg-go-50 text-ink-900' : 'border-line text-text-2 hover:border-brand-300')}>
                      {p}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[13px] text-text-2">In a live integration you’d approve a prompt in your {provider} app. Here, simply choose an outcome.</p>
              </div>
            )}

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Button size="lg" onClick={() => run('success')} iconLeft={<Check className="size-4" />}>Simulate success</Button>
              <Button size="lg" variant="outline" onClick={() => run('failure')} iconLeft={<CircleX className="size-4" />}>Simulate failure</Button>
            </div>
            <p className="mt-4 text-center text-xs text-muted">Test mode · {methodLabel} · Ref {reference}</p>
          </motion.div>
        )}

        {phase === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-4" role="status" aria-live="polite">
            <div className="relative mx-auto grid size-20 place-items-center">
              <span className="absolute inset-0 animate-spin rounded-full border-4 border-surface-2 border-t-go-500" aria-hidden />
              <Lock className="size-7 text-ink-900" aria-hidden />
            </div>
            <ol className="mx-auto mt-6 max-w-xs space-y-3">
              {stages.map((s, i) => (
                <li key={s} className={cn('flex items-center gap-3 text-sm transition', i <= stage ? 'text-ink-900' : 'text-muted')}>
                  <span className={cn('grid size-6 place-items-center rounded-full', i < stage ? 'bg-ok text-white' : i === stage ? 'bg-go-100 text-go-600' : 'bg-surface-2')}>
                    {i < stage ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i === stage ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> : null}
                  </span>
                  {s}…
                </li>
              ))}
            </ol>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-go-500" initial={{ width: '5%' }} animate={{ width: `${((stage + 1) / stages.length) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
          </motion.div>
        )}

        {phase === 'failed' && (
          <motion.div key="failed" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center" role="alert">
            <motion.span initial={{ x: 0 }} animate={{ x: [0, -10, 10, -6, 6, 0] }} transition={{ duration: 0.5 }} className="mx-auto grid size-16 place-items-center rounded-full bg-crit-bg text-crit">
              <CircleX className="size-8" aria-hidden />
            </motion.span>
            <p className="mt-4 font-display text-xl font-bold text-ink-900">Payment declined (simulated)</p>
            <p className="mt-1 text-sm text-text-2">The test gateway returned a simulated decline. Nothing was charged. Try again or choose another method.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Button size="lg" onClick={() => setPhase('review')} iconLeft={<RotateCcw className="size-4" />}>Try again</Button>
              <Button size="lg" variant="outline" onClick={close}>Change method</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
