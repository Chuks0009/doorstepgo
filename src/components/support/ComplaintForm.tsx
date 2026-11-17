import { useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck, Hash, MessageSquareText, SearchCheck, TriangleAlert } from 'lucide-react';
import { bookingService, deliveryService, supportService } from '@/services/api';
import { Button, DemoNotice, Input, Select, Textarea } from '@/components/ui';
import { CopyChipLight } from './CopyChipLight';
import { useForm } from '@/hooks';
import { maxLen, minLen, required } from '@/utils/validation';
import { findTier, findDeliveryCategory } from '@/data/services';
import { formatDate } from '@/utils';

export const complaintCategories = [
  'Late or delayed delivery',
  'Missing or wrong item',
  'Damaged item',
  'Rider / driver conduct',
  'Overcharged or payment issue',
  'Safety concern',
  'App or website problem',
  'Other',
];

const refRule = (v: unknown) => (String(v ?? '').trim() && !/^DSG-(RD|DL|PY|QT)-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(String(v).trim()) ? 'Use the format DSG-RD-XXXX-XXXX or DSG-DL-XXXX-XXXX' : undefined);

const schema = {
  reference: [required('Enter the booking or delivery reference'), refRule],
  category: [required('Choose what went wrong')],
  details: [required('Tell us what happened'), minLen(20, 'Please add a little more detail (20+ characters)'), maxLen(1500)],
};

export function ComplaintForm({ initialRef = '' }: { initialRef?: string }) {
  const initial = useMemo(() => ({ reference: initialRef.toUpperCase(), category: '', details: '' }), [initialRef]);
  const f = useForm(initial, schema);
  const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState<{ ticket: string; reference: string } | null>(null);

  const ref = f.values.reference.trim().toUpperCase();
  const match = useMemo(() => {
    if (!/^DSG-(RD|DL)-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(ref)) return null;
    const b = bookingService.get(ref);
    if (b) return { ok: true as const, text: `${findTier(b.tierId)?.name ?? 'Ride'} · ${formatDate(b.date)}` };
    const d = deliveryService.get(ref);
    if (d) return { ok: true as const, text: `${findDeliveryCategory(d.categoryId)?.name ?? 'Delivery'} · ${d.packageDescription}` };
    return { ok: false as const, text: "We couldn't find this reference in this browser — you can still submit." };
  }, [ref]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.check()) return;
    setBusy(true);
    const t = await supportService.complaint({ reference: ref, category: f.values.category, details: f.values.details.trim() });
    setBusy(false);
    setTicket({ ticket: t.ticket, reference: ref });
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {ticket ? (
        <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center" role="status">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-ok-bg text-ok"><CircleCheck className="size-8" aria-hidden /></span>
          <h3 className="mt-5 text-2xl font-bold text-ink-900">Complaint received</h3>
          <p className="mx-auto mt-2 max-w-md text-text-2">We opened a ticket for <span className="font-mono font-semibold text-ink-900">{ticket.reference}</span>. A support lead reviews every complaint and replies with next steps.</p>
          <div className="mt-5 flex justify-center"><CopyChipLight text={ticket.ticket} label="Ticket reference" /></div>
          <DemoNotice compact className="mx-auto mt-6 max-w-md text-left">Demo: the ticket is stored in this browser and appears in your notifications. No email is sent.</DemoNotice>
          <Button variant="outline" className="mt-6" onClick={() => { f.reset(); setTicket(null); }}>Report another issue</Button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Input
                label="Booking reference"
                required
                placeholder="DSG-DL-XXXX-XXXX"
                icon={<Hash />}
                className="font-mono uppercase"
                autoComplete="off"
                {...f.field('reference')}
              />
              {match && !f.errors.reference && (
                <p className={`mt-1.5 flex items-center gap-1.5 text-[13px] font-medium ${match.ok ? 'text-ok' : 'text-warn'}`}>
                  {match.ok ? <SearchCheck className="size-3.5 shrink-0" aria-hidden /> : <TriangleAlert className="size-3.5 shrink-0" aria-hidden />} {match.text}
                </p>
              )}
            </div>
            <Select label="What went wrong?" required placeholder="Choose a category" options={complaintCategories.map((c) => ({ value: c, label: c }))} {...f.field('category')} />
          </div>
          <Textarea
            label="Details"
            required
            rows={5}
            placeholder="What happened, when, and what outcome would you like (refund, redelivery, apology…)?"
            hint={`${f.values.details.length}/1500 characters`}
            maxLength={1500}
            {...f.field('details')}
          />
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" variant="ink" size="lg" loading={busy} iconLeft={<MessageSquareText className="size-4" />}>Submit complaint</Button>
            <p className="text-xs text-muted">Typical first response: within 24 hours (demo target).</p>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
