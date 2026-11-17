import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Building2, CircleCheck, Mail, Phone, Send, User } from 'lucide-react';
import { Button, ButtonLink, ChoiceCard, DemoNotice, Input, Select, Textarea } from '@/components/ui';
import { useForm } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { merchantService } from '@/services/api';
import { activeCities } from '@/config/locations';
import { site } from '@/config/site';
import { email, minLen, phone, required } from '@/utils/validation';
import { CopyButton } from './shared';

const industries = ['Fashion & apparel', 'Food & restaurants', 'Groceries & FMCG', 'Pharmacy & health', 'Electronics & gadgets', 'Beauty & cosmetics', 'E-commerce marketplace', 'Documents & services', 'Other'];
const volumes = ['Under 50 deliveries / month', '50–200 deliveries / month', '200–1,000 deliveries / month', '1,000+ deliveries / month'];

const initial = {
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  industry: '',
  cityId: '',
  monthlyVolume: '',
  requirements: '',
  multiplePickups: '' as '' | 'yes' | 'no',
};

export function MerchantForm() {
  const toast = useToast();
  const schema = useMemo(
    () => ({
      businessName: [required('Enter your business name'), minLen(2)],
      contactName: [required('Who should we contact?'), minLen(2)],
      email: [required('Enter a business email'), email()],
      phone: [required('Enter a phone number'), phone()],
      industry: [required('Choose your industry')],
      cityId: [required('Choose your main city')],
      monthlyVolume: [required('Estimate your monthly volume')],
      requirements: [required('Tell us a little about your deliveries'), minLen(10, 'A sentence or two helps us prepare')],
      multiplePickups: [required('Let us know if you ship from more than one location')],
    }),
    [],
  );
  const form = useForm(initial, schema);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ reference: string; business: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.check()) {
      toast({ title: 'Please complete the highlighted fields', tone: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const v = form.values;
      // Requirements and multi-pickup answers are not yet part of the Merchant record type.
      const res = await merchantService.register({
        businessName: v.businessName.trim(),
        contactName: v.contactName.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        industry: v.industry,
        cityId: v.cityId,
        monthlyVolume: v.monthlyVolume,
      });
      setDone({ reference: res.reference, business: res.businessName });
      toast({ title: 'Merchant interest registered', body: `Reference ${res.reference}` });
    } catch {
      toast({ title: 'Something went wrong', body: 'Please try again in a moment.', tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {done ? (
        <motion.div key="done" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
          <span className="relative grid size-16 place-items-center rounded-2xl bg-ok text-white">
            <CircleCheck className="size-8" aria-hidden />
            <span className="absolute inset-0 animate-pulse-ring rounded-2xl ring-2 ring-ok" aria-hidden />
          </span>
          <div>
            <h3 className="text-2xl font-bold text-ink-900">{done.business} is on the list 🎉</h3>
            <p className="mt-2 text-text-2">A business specialist will reach out to set up pickup locations, delivery rules and invoicing. Questions? Email {site.contact.businessEmail}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface-2 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-wider text-muted uppercase">Merchant reference</p>
              <p className="font-display text-xl font-bold tracking-wide text-ink-900">{done.reference}</p>
            </div>
            <CopyButton value={done.reference} />
          </div>
          <DemoNotice compact>Demo — your registration is stored only in this browser. No one will actually contact you yet.</DemoNotice>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/delivery" iconRight={<ArrowRight className="size-4" />}>Book a delivery now</ButtonLink>
            <ButtonLink to="/request-quote?type=business" variant="outline">Request a bulk quote</ButtonLink>
            <Button variant="ghost" onClick={() => { form.reset(); setDone(null); }}>Register another business</Button>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={submit} noValidate className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Business name" required icon={<Building2 />} autoComplete="organization" placeholder="e.g. Ada’s Kitchen" {...form.field('businessName')} />
            <Input label="Contact name" required icon={<User />} autoComplete="name" placeholder="Full name" {...form.field('contactName')} />
            <Input label="Business email" required type="email" icon={<Mail />} autoComplete="email" placeholder="orders@yourbusiness.com" {...form.field('email')} />
            <Input label="Phone number" required type="tel" icon={<Phone />} autoComplete="tel" placeholder="0803 123 4567" {...form.field('phone')} />
            <Select label="Industry" required placeholder="Select industry" options={industries.map((i) => ({ value: i, label: i }))} {...form.field('industry')} />
            <Select label="Main city" required placeholder="Select city" options={activeCities.map((c) => ({ value: c.id, label: c.name }))} {...form.field('cityId')} />
            <Select label="Monthly delivery volume" required wrapperClassName="sm:col-span-2" placeholder="Estimate your volume" options={volumes.map((v) => ({ value: v, label: v }))} {...form.field('monthlyVolume')} />
            <Textarea label="Delivery requirements" required wrapperClassName="sm:col-span-2" placeholder="What do you ship, typical sizes, delivery windows, fragile or perishable items, cash-on-delivery needs…" {...form.field('requirements')} />
          </div>
          <fieldset data-field="multiplePickups">
            <legend className="text-sm font-semibold text-text">Do you ship from multiple pickup locations?<span className="ml-0.5 text-go-600" aria-hidden>*</span></legend>
            <div role="radiogroup" aria-label="Multiple pickup locations" className="mt-2 grid gap-2.5 sm:grid-cols-2">
              <ChoiceCard selected={form.values.multiplePickups === 'yes'} onSelect={() => form.set('multiplePickups', 'yes')} title="Yes" description="Stores, warehouses or branches" />
              <ChoiceCard selected={form.values.multiplePickups === 'no'} onSelect={() => form.set('multiplePickups', 'no')} title="No" description="One pickup location" />
            </div>
            {form.errors.multiplePickups && <p role="alert" className="mt-1.5 text-[13px] font-medium text-crit">{form.errors.multiplePickups}</p>}
          </fieldset>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">By registering you agree to our <Link to="/legal/terms" className="font-semibold text-brand-700 hover:underline">Terms</Link> and <Link to="/legal/privacy" className="font-semibold text-brand-700 hover:underline">Privacy Policy</Link>.</p>
            <Button type="submit" size="lg" loading={submitting} iconRight={<Send className="size-4" />}>Register my business</Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
