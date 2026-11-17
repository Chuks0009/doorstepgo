import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, AtSign, CircleAlert, KeyRound, LayoutDashboard, LogOut, MailCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { AuthShell, OrDivider, PasswordField, rememberedEmail, safeNext, setRememberedEmail } from '@/components/support/AuthShell';
import { Avatar, Button, Checkbox, DemoNotice, Input, Modal } from '@/components/ui';
import { authService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useForm, usePageMeta } from '@/hooks';
import { email, required } from '@/utils/validation';
import { demoUser } from '@/data/seed';

const schema = {
  email: [required('Enter your email address'), email()],
  password: [required('Enter your password')],
};

export default function LoginPage() {
  usePageMeta('Sign in', 'Sign in to DoorstepGo to manage rides, deliveries, payments and rewards.');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const toast = useToast();
  const { user, logout } = useAuth();
  const [initial] = useState(() => ({ email: rememberedEmail(), password: '' }));
  const f = useForm(initial, schema);
  const [remember, setRemember] = useState(() => !!initial.email);
  const [busy, setBusy] = useState<'form' | 'demo' | 'admin' | null>(null);
  const [error, setError] = useState<string>();
  const [forgotOpen, setForgotOpen] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!f.check()) return;
    setBusy('form');
    const res = await authService.login(f.values.email, f.values.password);
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setRememberedEmail(remember ? f.values.email.trim() : null);
    toast({ title: `Welcome back, ${res.data.name.split(' ')[0]}!`, body: 'You are signed in (demo session).' });
    navigate(next, { replace: true });
  };

  const demo = async (role: 'customer' | 'admin') => {
    setError(undefined);
    setBusy(role === 'admin' ? 'admin' : 'demo');
    const u = await authService.loginDemo(role);
    setBusy(null);
    toast({ title: role === 'admin' ? 'Admin demo unlocked' : `Signed in as ${u.name}`, body: role === 'admin' ? 'You are viewing the operations console with demo data.' : 'Exploring with the demo customer account.' });
    navigate(role === 'admin' ? '/admin' : next, { replace: true });
  };

  return (
    <AuthShell switchPrompt="New to DoorstepGo?" switchTo={`/register${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} switchLabel="Create an account">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <span className="eyebrow"><Sparkles className="size-3.5" aria-hidden /> Welcome back</span>
        <h1 className="mt-4 text-3xl font-extrabold text-ink-900 sm:text-4xl">Sign in to your account</h1>
        <p className="mt-2 text-text-2">Manage rides, deliveries, payments and rewards in one place.</p>

        {user && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-3">
            <Avatar src={user.avatar} name={user.name} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">Signed in as {user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <Button size="sm" variant="ink" onClick={() => navigate(user.role === 'admin' ? '/admin' : next)} iconRight={<LayoutDashboard className="size-4" />}>Continue</Button>
            <Button size="icon" variant="ghost" onClick={logout} aria-label="Sign out"><LogOut className="size-4" /></Button>
          </div>
        )}

        <Button block size="lg" variant="ink" className="mt-8" loading={busy === 'demo'} onClick={() => demo('customer')} iconLeft={<Sparkles className="size-4 text-go-400" />}>
          Use demo account
        </Button>
        <p className="mt-2 text-center text-xs text-muted">Instantly explore as {demoUser.name} — no sign-up needed.</p>

        <div className="my-7"><OrDivider label="or sign in with email" /></div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <p role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-crit-bg px-4 py-3 text-sm font-medium text-crit">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={submit} noValidate className="space-y-5">
          <Input label="Email" type="email" required autoComplete="email" icon={<AtSign />} placeholder="you@example.com" {...f.field('email')} />
          <div>
            <PasswordField label="Password" required autoComplete="current-password" placeholder="Your password" {...f.field('password')} />
            <div className="mt-3 flex items-center justify-between gap-3">
              <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
              <button type="button" onClick={() => setForgotOpen(true)} className="rounded-lg px-1 py-1 text-sm font-semibold text-brand-700 hover:underline">Forgot password?</button>
            </div>
          </div>
          <Button type="submit" block size="lg" loading={busy === 'form'} iconRight={<ArrowRight className="size-4" />}>Sign in</Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-2 lg:hidden">
          New here? <Link to="/register" className="font-semibold text-brand-700 hover:underline">Create an account</Link>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-line-strong px-4 py-3">
          <p className="flex items-center gap-2 text-xs text-text-2"><ShieldCheck className="size-4 text-brand-600" aria-hidden /> Exploring operations?</p>
          <button type="button" onClick={() => demo('admin')} disabled={!!busy} className="text-xs font-semibold text-ink-900 underline-offset-4 hover:underline disabled:opacity-50">
            {busy === 'admin' ? 'Opening…' : 'Admin demo →'}
          </button>
        </div>
      </motion.div>

      <ForgotPassword open={forgotOpen} onClose={() => setForgotOpen(false)} initialEmail={f.values.email} />
    </AuthShell>
  );
}

function ForgotPassword({ open, onClose, initialEmail }: { open: boolean; onClose: () => void; initialEmail: string }) {
  const [value, setValue] = useState(initialEmail);
  const [err, setErr] = useState<string>();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) setValue(initialEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    onClose();
    setTimeout(() => {
      setSent(false);
      setErr(undefined);
    }, 300);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const msg = required('Enter your email address')(value, {}) ?? email()(value, {});
    if (msg) return setErr(msg);
    setErr(undefined);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    setSent(true);
  };

  return (
    <Modal open={open} onClose={close} title={sent ? 'Check your inbox' : 'Reset your password'} description={sent ? undefined : "Enter your account email and we'll send a reset link."} size="sm">
      {sent ? (
        <div className="text-center" role="status">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ok-bg text-ok"><MailCheck className="size-7" aria-hidden /></span>
          <p className="mt-4 text-text-2">If an account exists for <span className="font-semibold text-ink-900">{value}</span>, a reset link would be on its way.</p>
          <DemoNotice compact className="mt-5 text-left">
            Demo: no email is sent. Sign in with <strong>{demoUser.email}</strong> / <strong>demo1234</strong>, or use the demo account button.
          </DemoNotice>
          <Button block className="mt-5" variant="ink" onClick={close}>Back to sign in</Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Input label="Email" type="email" required autoComplete="email" icon={<KeyRound />} value={value} onChange={(e) => setValue(e.target.value)} error={err} placeholder="you@example.com" />
          <Button type="submit" block loading={busy}>Send reset link</Button>
        </form>
      )}
    </Modal>
  );
}
