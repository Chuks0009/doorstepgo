import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bike, Building2, CarTaxiFront, CircleCheck, Mail, Phone, Send, Store, Truck, User } from 'lucide-react';
import { Button, ButtonLink, ChoiceCard, DemoNotice, Input, Select, Textarea } from '@/components/ui';
import { useForm } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { activeCities } from '@/config/locations';
import { site } from '@/config/site';
import { email, minLen, phone, required } from '@/utils/validation';
import { makeReference, sleep } from '@/utils';
import { CopyButton } from './shared';

type PartnerType = 'rider' | 'driver' | 'fleet' | 'merchant';

const partnerTypes: { value: PartnerType; title: string; description: string; icon: typeof Bike }[] = [
  { value: 'rider', title: 'Motorcycle rider', description: 'Ride with us on bikes & deliveries', icon: Bike },
  { value: 'driver', title: 'Tricycle / shuttle driver', description: 'Keke, minibus & van operators', icon: CarTaxiFront },
  { value: 'fleet', title: 'Fleet owner', description: 'Put multiple vehicles on the platform', icon: Truck },
  { value: 'merchant', title: 'Merchant', description: 'Ship your products with DoorstepGo', icon: Store },
];

const initial = { partnerType: 'rider' as PartnerType, name: '', phone: '', email: '', city: '', fleetSize: '', message: '' };

export function PartnerForm() {
  const toast = useToast();
  const schema = useMemo(
    () => ({
      name: [required('Tell us your name'), minLen(2)],
      phone: [required('A phone number helps us reach you'), phone()],
      email: [required('Enter your email address'), email()],
      city: [required('Choose the city you operate in')],
    }),
    [],
  );
  const form = useForm(initial, schema);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ reference: string; name: string; type: PartnerType } | null>(null);
  const type = form.values.partnerType;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.check()) {
      toast({ title: 'Please check the highlighted fields', tone: 'error' });
      return;
    }
    setSubmitting(true);
    await sleep(900); // simulated request — no partner backend yet
    const reference = makeReference('TK');
    setDone({ reference, name: form.values.name.split(' ')[0], type });
    setSubmitting(false);
    toast({ title: 'Partner interest received (demo)', body: `Reference ${reference}` });
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-start gap-5 py-4" role="status">
            <span className="relative grid size-16 place-items-center rounded-2xl bg-ok text-white shadow-[0_12px_30px_-10px_rgb(15_157_88/0.6)]">
              <CircleCheck className="size-8" aria-hidden />
              <span className="absolute inset-0 animate-pulse-ring rounded-2xl ring-2 ring-ok" aria-hidden />
            </span>
            <div>
              <h3 className="text-2xl font-bold text-ink-900">Thanks, {done.name} — we’ll be in touch.</h3>
              <p className="mt-2 max-w-md text-text-2">
                Our partnerships team reviews new interest weekly. Keep your reference handy if you contact {site.contact.partnersEmail}.
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface-2 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tracking-wider text-muted uppercase">Your reference</p>
                <p className="font-display text-xl font-bold tracking-wide text-ink-900">{done.reference}</p>
              </div>
              <CopyButton value={done.reference} />
            </div>
            <DemoNotice compact>Demo only — this interest form is not sent anywhere yet. Partner onboarding and document checks will arrive in a later release.</DemoNotice>
            <div className="flex flex-wrap gap-3">
              {done.type === 'merchant' && <ButtonLink to="/customers/merchants" variant="brand" iconRight={<ArrowRight className="size-4" />}>Explore merchant tools</ButtonLink>}
              <Button variant="outline" onClick={() => { form.reset(); setDone(null); }}>Submit another</Button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={submit} noValidate className="flex flex-col gap-5">
            <fieldset>
              <legend className="text-sm font-semibold text-text">I want to partner as a…</legend>
              <div role="radiogroup" aria-label="Partner type" className="mt-2 grid gap-2.5 sm:grid-cols-2">
                {partnerTypes.map((p) => (
                  <ChoiceCard
                    key={p.value}
                    selected={type === p.value}
                    onSelect={() => form.set('partnerType', p.value)}
                    title={p.title}
                    description={p.description}
                    icon={<p.icon />}
                  />
                ))}
              </div>
            </fieldset>

            <AnimatePresence initial={false}>
              {type === 'merchant' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
                    <p className="flex items-center gap-2 font-medium"><Building2 className="size-4 shrink-0" aria-hidden /> Merchants get a dedicated onboarding form with bulk & scheduled delivery options.</p>
                    <Link to="/customers/merchants#register" className="inline-flex min-h-11 items-center gap-1 font-bold text-brand-700 underline-offset-4 hover:underline">
                      Go to merchant sign-up <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" required autoComplete="name" icon={<User />} placeholder="e.g. Chukwudi Obi" {...form.field('name')} />
              <Input label="Phone number" required type="tel" autoComplete="tel" icon={<Phone />} placeholder="0803 123 4567" {...form.field('phone')} />
              <Input label="Email" required type="email" autoComplete="email" icon={<Mail />} placeholder="you@example.com" {...form.field('email')} />
              <Select label="City" required placeholder="Select a city" options={activeCities.map((c) => ({ value: c.id, label: c.name }))} {...form.field('city')} />
              {type === 'fleet' && (
                <Select
                  label="Fleet size"
                  optional
                  wrapperClassName="sm:col-span-2"
                  placeholder="How many vehicles?"
                  options={['2–5', '6–15', '16–50', '50+'].map((v) => ({ value: v, label: `${v} vehicles` }))}
                  {...form.field('fleetSize')}
                />
              )}
              <Textarea label="Anything else?" optional wrapperClassName="sm:col-span-2" placeholder="Vehicle type, years of experience, areas you know well…" {...form.field('message')} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">By submitting you agree to be contacted about partnering. See our <Link to="/legal/privacy" className="font-semibold text-brand-700 hover:underline">Privacy Policy</Link>.</p>
              <Button type="submit" size="lg" loading={submitting} iconRight={<Send className="size-4" />}>Register interest</Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
