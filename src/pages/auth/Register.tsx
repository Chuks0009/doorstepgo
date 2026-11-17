import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, AtSign, Check, CircleAlert, Gift, Phone, Sparkles, User } from 'lucide-react';
import { AuthShell, OrDivider, PasswordField, safeNext } from '@/components/support/AuthShell';
import { Button, Checkbox, Input } from '@/components/ui';
import { authService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useForm, usePageMeta } from '@/hooks';
import { email, matches, maxLen, phone, required, strongPassword, type Rule } from '@/utils/validation';
import { cn } from '@/utils';

const fullName: Rule = (v) => (String(v ?? '').trim().split(/\s+/).filter((p) => p.length > 1).length < 2 ? 'Enter your first and last name' : undefined);
const accepted: Rule = (v) => (v ? undefined : 'You need to accept the terms to continue');
const referral: Rule = (v) => (String(v ?? '').trim() && !/^[A-Z0-9-]{4,16}$/i.test(String(v).trim()) ? 'Referral codes use letters, numbers and dashes' : undefined);

const schema = {
  name: [required('Enter your full name'), fullName, maxLen(80)],
  email: [required('Enter your email address'), email()],
  phone: [required('Enter your phone number'), phone()],
  password: [required('Create a password'), strongPassword()],
  confirm: [required('Confirm your password'), matches('password', 'Passwords do not match')],
  terms: [accepted],
  referral: [referral],
};

function strength(pw: string) {
  const checks = [
    { label: '8+ characters', ok: pw.length >= 8 },
    { label: 'A number', ok: /\d/.test(pw) },
    { label: 'Upper & lower case', ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { label: 'A symbol', ok: /[^a-z0-9]/i.test(pw) },
  ];
  let score = checks.filter((c) => c.ok).length;
  if (pw.length >= 12 && score >= 3) score = 4;
  if (pw.length < 8) score = Math.min(score, 1);
  const label = !pw ? '' : ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const color = ['bg-crit', 'bg-crit', 'bg-warn', 'bg-brand-500', 'bg-ok'][score];
  return { score, label, color, checks };
}

export default function RegisterPage() {
  usePageMeta('Create an account', 'Create a DoorstepGo account to book rides, schedule deliveries, track trips and earn rewards.');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const next = safeNext(params.get('next'));
  const [initial] = useState(() => ({ name: '', email: '', phone: '', password: '', confirm: '', terms: false, referral: (params.get('ref') ?? '').toUpperCase() }));
  const f = useForm(initial, schema);
  const [busy, setBusy] = useState<'form' | 'demo' | null>(null);
  const [error, setError] = useState<string>();
  const s = useMemo(() => strength(f.values.password), [f.values.password]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!f.check()) return;
    setBusy('form');
    const res = await authService.register({ name: f.values.name.trim().replace(/\s+/g, ' '), email: f.values.email.trim(), phone: f.values.phone.trim(), password: f.values.password });
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast({
      title: `Welcome to DoorstepGo, ${res.data.name.split(' ')[0]}!`,
      body: `500 welcome points added${f.values.referral.trim() ? ` · referral ${f.values.referral.trim().toUpperCase()} noted (demo)` : ''}.`,
    });
    navigate(next, { replace: true });
  };

  const demo = async () => {
    setBusy('demo');
    const u = await authService.loginDemo('customer');
    setBusy(null);
    toast({ title: `Signed in as ${u.name}`, body: 'Exploring with the demo customer account.' });
    navigate(next, { replace: true });
  };

  return (
    <AuthShell switchPrompt="Already have an account?" switchTo={`/login${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} switchLabel="Sign in">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <span className="eyebrow"><Gift className="size-3.5" aria-hidden /> 500 welcome points</span>
        <h1 className="mt-4 text-3xl font-extrabold text-ink-900 sm:text-4xl">Create your account</h1>
        <p className="mt-2 text-text-2">Book rides, schedule deliveries and track everything — in under a minute.</p>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-crit-bg px-4 py-3 text-sm font-medium text-crit">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {error}{' '}
                  {/exists/i.test(error) && <Link to={`/login?next=${encodeURIComponent(next)}`} className="font-semibold underline">Sign in instead</Link>}
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
          <Input label="Full name" required autoComplete="name" icon={<User />} placeholder="e.g. Ada Nwosu" {...f.field('name')} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Email" type="email" required autoComplete="email" icon={<AtSign />} placeholder="you@example.com" {...f.field('email')} />
            <Input label="Phone" type="tel" required autoComplete="tel" icon={<Phone />} placeholder="0803 123 4567" {...f.field('phone')} />
          </div>

          <div>
            <PasswordField label="Password" required autoComplete="new-password" placeholder="Create a password" {...f.field('password')} />
            <div id="pw-strength" className="mt-3" aria-live="polite">
              <div className="flex gap-1.5" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <motion.span className={cn('block h-full rounded-full', s.color)} initial={false} animate={{ width: f.values.password && i < Math.max(1, s.score) ? '100%' : '0%' }} transition={{ duration: 0.35 }} />
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <p className="text-xs font-semibold text-text-2">{s.label ? <>Strength: <span className="text-ink-900">{s.label}</span></> : 'Use 8+ characters with a letter and a number.'}</p>
                <ul className="flex flex-wrap gap-x-3 gap-y-1">
                  {s.checks.map((c) => (
                    <li key={c.label} className={cn('flex items-center gap-1 text-[11px] font-medium transition-colors', c.ok ? 'text-ok' : 'text-muted')}>
                      <Check className={cn('size-3', !c.ok && 'opacity-30')} strokeWidth={3} aria-hidden />
                      {c.label}
                      <span className="sr-only">{c.ok ? '(met)' : '(not met)'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <PasswordField label="Confirm password" required autoComplete="new-password" placeholder="Repeat your password" {...f.field('confirm')} />

          <Input label="Referral code" optional icon={<Gift />} placeholder="e.g. ADA-GO-27" className="uppercase" autoComplete="off" {...f.field('referral')} />

          <div data-field="terms">
            <Checkbox
              name="terms"
              checked={!!f.values.terms}
              onChange={(v) => f.set('terms', v)}
              label={
                <>
                  I agree to the{' '}
                  <Link to="/legal/terms" target="_blank" className="font-semibold text-brand-700 underline-offset-4 hover:underline">Terms &amp; Conditions</Link>{' '}
                  and{' '}
                  <Link to="/legal/privacy" target="_blank" className="font-semibold text-brand-700 underline-offset-4 hover:underline">Privacy Policy</Link>
                </>
              }
            />
            {f.errors.terms && <p role="alert" className="mt-1 flex items-center gap-1.5 pl-1 text-[13px] font-medium text-crit"><CircleAlert className="size-3.5" aria-hidden /> {f.errors.terms}</p>}
          </div>

          <Button type="submit" block size="lg" loading={busy === 'form'} iconRight={<ArrowRight className="size-4" />}>Create account</Button>
        </form>

        <div className="my-7"><OrDivider /></div>
        <Button block variant="outline" size="lg" loading={busy === 'demo'} onClick={demo} iconLeft={<Sparkles className="size-4 text-go-500" />}>Explore with the demo account</Button>

        <p className="mt-6 text-center text-sm text-text-2 lg:hidden">
          Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
