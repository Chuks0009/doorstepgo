import { useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AtSign, CircleCheck, Phone, SendHorizontal, User } from 'lucide-react';
import { supportService } from '@/services/api';
import { Button, ButtonLink, DemoNotice, Input, Textarea } from '@/components/ui';
import { CopyChipLight } from './CopyChipLight';
import { useForm } from '@/hooks';
import { email, maxLen, minLen, phone, required } from '@/utils/validation';
import { site } from '@/config/site';
import { cn } from '@/utils';

export const enquiryCategories = ['General', 'Business', 'Partnership', 'Customer support', 'Complaint/feedback'] as const;

const schema = {
  name: [required('Enter your full name'), minLen(2, 'Enter your full name')],
  email: [required('Enter your email address'), email()],
  phone: [phone()],
  subject: [required('Add a short subject'), minLen(3, 'Subject is too short'), maxLen(120)],
  category: [required('Choose an enquiry type')],
  message: [required('Write your message'), minLen(20, 'Please add a bit more detail (20+ characters)'), maxLen(2000)],
};

const replyTime: Record<string, string> = {
  General: 'within 1 working day',
  Business: 'within 1 working day from our business team',
  Partnership: 'within 2 working days from our partnerships team',
  'Customer support': 'within a few hours during operating hours',
  'Complaint/feedback': 'within 24 hours from a support lead',
};

export function ContactForm({ initialCategory = '', initialSubject = '' }: { initialCategory?: string; initialSubject?: string }) {
  const initial = useMemo(() => ({ name: '', email: '', phone: '', subject: initialSubject, category: initialCategory, message: '' }), [initialCategory, initialSubject]);
  const f = useForm(initial, schema);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ reference: string; category: string; email: string } | null>(null);
  const errorCount = Object.values(f.errors).filter(Boolean).length;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.check()) return;
    setBusy(true);
    const m = await supportService.contact({
      name: f.values.name.trim(),
      email: f.values.email.trim(),
      phone: f.values.phone.trim() || undefined,
      subject: f.values.subject.trim(),
      category: f.values.category,
      message: f.values.message.trim(),
    });
    setBusy(false);
    setDone({ reference: m.reference, category: m.category, email: m.email });
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {done ? (
        <motion.div key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-6 text-center" role="status" aria-live="polite">
          <motion.span initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }} className="mx-auto grid size-20 place-items-center rounded-3xl bg-ok text-white shadow-[0_18px_40px_-14px_rgb(15_157_88/0.7)]">
            <CircleCheck className="size-10" aria-hidden />
          </motion.span>
          <h3 className="mt-6 text-2xl font-bold text-ink-900 sm:text-3xl">Message sent — thank you!</h3>
          <p className="mx-auto mt-2 max-w-md text-text-2">
            Your <span className="font-semibold text-ink-900">{done.category.toLowerCase()}</span> enquiry is logged. We aim to reply to <span className="font-semibold text-ink-900">{done.email}</span> {replyTime[done.category] ?? 'soon'}.
          </p>
          <p className="mt-6 text-xs font-bold tracking-[0.14em] text-muted uppercase">Your ticket reference</p>
          <div className="mt-2 flex justify-center"><CopyChipLight text={done.reference} label="Ticket reference" /></div>
          <DemoNotice compact className="mx-auto mt-6 max-w-md text-left">Demo: your message is saved in this browser only — no email is sent and no one will reply.</DemoNotice>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => { f.reset(); setDone(null); }}>Send another message</Button>
            <ButtonLink to="/faq" variant="ghost">Browse FAQs</ButtonLink>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5" aria-describedby="contact-form-status">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-text">Enquiry type <span className="text-go-600" aria-hidden>*</span></legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Enquiry type" data-field="category">
              {enquiryCategories.map((c) => {
                const on = f.values.category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => f.set('category', c)}
                    className={cn(
                      'min-h-11 rounded-xl border-2 px-4 text-sm font-semibold transition',
                      on ? 'border-go-500 bg-go-50 text-go-800' : 'border-line bg-white text-text-2 hover:border-brand-300 hover:text-ink-900',
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            {f.errors.category && <p role="alert" className="mt-1.5 text-[13px] font-medium text-crit">{f.errors.category}</p>}
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Full name" required autoComplete="name" icon={<User />} placeholder="e.g. Ada Nwosu" {...f.field('name')} />
            <Input label="Email" required type="email" autoComplete="email" icon={<AtSign />} placeholder="you@example.com" {...f.field('email')} />
            <Input label="Phone" optional type="tel" autoComplete="tel" icon={<Phone />} placeholder="0803 123 4567" {...f.field('phone')} />
            <Input label="Subject" required placeholder="How can we help?" maxLength={120} {...f.field('subject')} />
          </div>
          <Textarea
            label="Message"
            required
            rows={6}
            maxLength={2000}
            placeholder="Share as much detail as you can — booking references, dates, locations…"
            hint={`${f.values.message.length}/2000 characters`}
            {...f.field('message')}
          />

          <p id="contact-form-status" className="sr-only" aria-live="assertive">{errorCount ? `${errorCount} field${errorCount > 1 ? 's need' : ' needs'} attention.` : ''}</p>

          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">By sending, you agree we may contact you about this enquiry. Fields marked * are required.</p>
            <Button type="submit" size="lg" loading={busy} iconRight={<SendHorizontal className="size-4" />} className="shrink-0">Send message</Button>
          </div>
          <p className="text-xs text-muted">Prefer email? <a className="font-semibold text-brand-700 hover:underline" href={`mailto:${site.contact.email}`}>{site.contact.email}</a></p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
