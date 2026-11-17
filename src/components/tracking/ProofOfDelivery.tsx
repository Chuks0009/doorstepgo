import { useEffect, useId, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, CircleCheck, ImagePlus, KeyRound, Lock, PackageCheck, UserCheck, X } from 'lucide-react';
import type { DeliveryBooking } from '@/types';
import { deliveryService } from '@/services/api';
import { Badge, Button, Checkbox, DemoNotice, Input, Segmented } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { formatDateTime } from '@/utils';

type Method = 'code' | 'photo' | 'signature';
const methodLabel: Record<Method, string> = { code: 'Delivery code', photo: 'Photo evidence', signature: 'Recipient confirmation' };

/** Delivery confirmation / proof-of-delivery interface (demo — nothing leaves the browser). */
export function ProofOfDelivery({ delivery, stageIndex }: { delivery: DeliveryBooking; stageIndex: number }) {
  const toast = useToast();
  const codeId = useId();
  const [method, setMethod] = useState<Method>('code');
  const [code, setCode] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);

  const cancelled = delivery.status === 'cancelled';
  const unlocked = stageIndex >= 5 || (delivery.stage === 'delivered' && !delivery.proof);

  if (delivery.proof) {
    const p = delivery.proof;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="overflow-hidden rounded-2xl border border-emerald-200 bg-ok-bg/60">
        <div className="flex items-start gap-4 p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ok text-white shadow-[0_10px_24px_-10px_rgb(15_157_88/0.7)]"><PackageCheck className="size-6" aria-hidden /></span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold text-ink-900">Delivered &amp; confirmed</p>
            <p className="text-sm text-text-2">Proof captured {formatDateTime(p.at)}</p>
          </div>
          <Badge tone="ok" dot>Proof on file (demo)</Badge>
        </div>
        <dl className="grid gap-px border-t border-emerald-200 bg-emerald-200 text-sm sm:grid-cols-3">
          <div className="bg-white/80 p-4"><dt className="text-xs text-muted">Method</dt><dd className="mt-0.5 font-semibold text-ink-900">{methodLabel[p.method]}</dd></div>
          <div className="bg-white/80 p-4"><dt className="text-xs text-muted">Received by</dt><dd className="mt-0.5 font-semibold text-ink-900">{p.receivedBy || delivery.recipient.name}</dd></div>
          <div className="bg-white/80 p-4"><dt className="text-xs text-muted">Time</dt><dd className="mt-0.5 font-semibold text-ink-900">{formatDateTime(p.at)}</dd></div>
        </dl>
        {photo && p.method === 'photo' && (
          <div className="border-t border-emerald-200 bg-white/80 p-4">
            <p className="mb-2 text-xs text-muted">Photo preview (kept in this tab only — not uploaded)</p>
            <img src={photo} alt="Proof of delivery preview" className="max-h-56 rounded-xl object-cover" />
          </div>
        )}
      </motion.div>
    );
  }

  if (cancelled) {
    return <p className="rounded-2xl bg-surface-2 p-5 text-sm text-text-2">This delivery was cancelled, so no proof of delivery is required.</p>;
  }

  if (!unlocked) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-dashed border-line-strong bg-surface-2/60 p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-muted shadow-soft"><Lock className="size-5" aria-hidden /></span>
        <div>
          <p className="font-semibold text-ink-900">Unlocks when the rider is approaching</p>
          <p className="mt-1 text-sm text-text-2">At handover the recipient can confirm with the 4-digit delivery code, a photo or their name. Use “Simulate next update” to move this delivery along.</p>
        </div>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (method === 'code' && !/^\d{4}$/.test(code.trim())) return setError('Enter the 4-digit delivery code.');
    if (method === 'photo' && !photo) return setError('Add a photo of the handover first.');
    if (method !== 'code' && receivedBy.trim().length < 2) return setError('Enter the name of the person who received the package.');
    if (method === 'signature' && !confirmed) return setError('Tick the box to confirm the recipient received the package.');
    setBusy(true);
    const res = await deliveryService.confirmDelivery(delivery.id, method, { code, receivedBy: receivedBy.trim() || undefined });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    toast({ title: 'Delivery confirmed', body: `${delivery.reference} marked as delivered (demo).` });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Segmented<Method>
        label="Confirmation method"
        value={method}
        onChange={(m) => {
          setMethod(m);
          setError(undefined);
        }}
        className="flex w-full"
        size="sm"
        options={[
          { value: 'code', label: <span className="sr-only sm:not-sr-only">Delivery code</span>, icon: <KeyRound className="size-4" aria-hidden /> },
          { value: 'photo', label: <span className="sr-only sm:not-sr-only">Photo</span>, icon: <Camera className="size-4" aria-hidden /> },
          { value: 'signature', label: <span className="sr-only sm:not-sr-only">Recipient name</span>, icon: <UserCheck className="size-4" aria-hidden /> },
        ]}
      />
      <p className="text-sm font-semibold text-ink-900 sm:hidden">{methodLabel[method]}</p>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={method} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
          {method === 'code' && (
            <div>
              <label htmlFor={codeId} className="text-sm font-semibold text-text">4-digit delivery code</label>
              <p className="text-[13px] text-muted">The recipient received this code by SMS when the delivery was booked.</p>
              <input
                id={codeId}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="• • • •"
                aria-invalid={!!error || undefined}
                className="field-input mt-2 h-16 max-w-56 text-center font-mono text-3xl font-bold tracking-[0.6em]"
              />
              <button type="button" onClick={() => setShowHint((s) => !s)} className="mt-2 block text-xs font-semibold text-brand-700 hover:underline" aria-expanded={showHint}>
                {showHint ? `Demo code: ${delivery.deliveryCode}` : 'Show demo code'}
              </button>
            </div>
          )}

          {method === 'photo' && (
            <div>
              <p className="text-sm font-semibold text-text">Photo of the handover</p>
              {photo ? (
                <div className="relative mt-2 inline-block">
                  <img src={photo} alt="Selected proof-of-delivery photo preview" className="max-h-48 rounded-2xl border border-line object-cover shadow-soft" />
                  <button type="button" onClick={() => setPhoto(null)} className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-ink-950/80 text-white hover:bg-ink-950" aria-label="Remove photo">
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line-strong bg-surface-2/50 px-4 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/40 focus-within:outline-3 focus-within:outline-brand-500">
                  <ImagePlus className="size-7 text-brand-600" aria-hidden />
                  <span className="text-sm font-semibold text-ink-900">Take or choose a photo</span>
                  <span className="text-xs text-muted">Preview only — nothing is uploaded in this demo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setPhoto(URL.createObjectURL(f));
                    }}
                  />
                </label>
              )}
            </div>
          )}

          {(method !== 'code' || code.length === 4) && (
            <Input label="Received by" optional={method === 'code'} placeholder={delivery.recipient.name} value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} autoComplete="name" />
          )}

          {method === 'signature' && (
            <Checkbox checked={confirmed} onChange={setConfirmed} label="Recipient confirmed receipt in person" description="The rider showed the package and the recipient accepted it." />
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p role="alert" className="rounded-xl bg-crit-bg px-3 py-2 text-sm font-medium text-crit">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="brand" loading={busy} iconLeft={<CircleCheck className="size-4" />}>Confirm delivery</Button>
        <span className="text-xs text-muted">Confirms handover &amp; completes the timeline.</span>
      </div>
      <DemoNotice compact>Proof of delivery is simulated — codes are checked locally and photos never leave this tab.</DemoNotice>
    </form>
  );
}
