import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bot, RotateCcw, SendHorizontal } from 'lucide-react';
import { bookingService, deliveryService } from '@/services/api';
import { deliveryStages } from '@/data/seed';
import { site, whatsappLink } from '@/config/site';
import { pricing } from '@/config/pricing';
import { usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/utils';
import { WhatsappGlyph } from '@/components/ui';

interface Msg {
  id: number;
  from: 'bot' | 'me';
  text: string;
  link?: { to: string; label: string; external?: boolean };
  at: Date;
}

const QUICK = ['Track my delivery', 'Cancel a booking', 'Payment methods', 'Business account', 'Talk to a human'];

let seq = 0;
const bot = (text: string, link?: Msg['link']): Msg => ({ id: ++seq, from: 'bot', text, link, at: new Date() });

/** Scripted reply engine — keyword matching, no network calls. */
function reply(input: string): Msg {
  const q = input.toLowerCase();
  const ref = input.toUpperCase().match(/DSG-(RD|DL)-[A-Z0-9]{4}-[A-Z0-9]{4}/)?.[0];
  if (ref) {
    if (ref.includes('-DL-')) {
      const d = deliveryService.get(ref);
      if (!d) return bot(`I couldn't find ${ref} in this browser. Double-check the reference — it's in your confirmation SMS.`);
      const stage = deliveryStages.find((s) => s.key === d.stage)?.label ?? d.stage;
      return bot(`${ref} is currently at “${stage}”${d.rider ? ` with ${d.rider.name.split(' ')[0]} (${d.rider.plate})` : ''}. Open live tracking for the full timeline.`, { to: `/track-delivery?ref=${ref}`, label: 'Open delivery tracking' });
    }
    const b = bookingService.get(ref);
    if (!b) return bot(`I couldn't find ride ${ref} in this browser. Check the reference and try again.`);
    return bot(`Ride ${ref} is ${b.status.replace(/_/g, ' ')}${b.driver ? ` — driver ${b.driver.name.split(' ')[0]}, plate ${b.driver.plate}` : ''}.`, { to: `/track-booking?ref=${ref}`, label: 'Open ride tracking' });
  }
  if (/\b(hi|hello|hey|good (morning|afternoon|evening))\b/.test(q)) return bot('Hello! 👋 Ask me about tracking, bookings, payments or refunds — or paste a booking reference.');
  if (/track|where|status|package|parcel/.test(q)) return bot('Sure — paste your reference (e.g. DSG-DL-4XKP-7RT2) and I will check it, or open the tracking page.', { to: '/track-delivery', label: 'Track a delivery' });
  if (/cancel/.test(q)) return bot(`You can cancel free within ${pricing.cancellation.freeWindowMinutes} minutes of booking, or before a driver is assigned. Manage it from your dashboard.`, { to: '/dashboard/bookings', label: 'Go to my bookings' });
  if (/refund/.test(q)) return bot('Eligible refunds go back to your original payment method. Card refunds usually show within 3–7 working days (simulated in this demo).', { to: '/faq?q=refund', label: 'Read refund FAQs' });
  if (/pay|card|transfer|ussd|cash|wallet/.test(q)) return bot('We are designed to accept cards, bank transfer, USSD, mobile money, wallet and cash on selected services. Payments in this demo are simulated.', { to: '/faq?q=payment', label: 'Payment FAQs' });
  if (/price|fare|cost|how much|estimate/.test(q)) return bot('Fares are estimated upfront from distance, time and service tier. Start a booking to see an itemised estimate.', { to: '/booking', label: 'Get a fare estimate' });
  if (/business|corporate|bulk|merchant|company/.test(q)) return bot(`For business accounts, bulk deliveries or staff shuttles, request a quote or email ${site.contact.businessEmail}.`, { to: '/request-quote', label: 'Request a business quote' });
  if (/rider|driver|partner|join|job/.test(q)) return bot('Want to ride with us? Register your interest and our partner team will reach out.', { to: '/customers/riders', label: 'Become a rider' });
  if (/market/.test(q)) return bot('Market pickup: tell us the market, seller and stall — a rider collects already-paid items or shops from your list.', { to: '/delivery', label: 'Book a market pickup' });
  if (/human|agent|person|someone|call|complain/.test(q)) return bot(`I'll hand you over. Our team is on WhatsApp and on ${site.contact.phone} during operating hours.`, { to: whatsappLink(), label: 'Continue on WhatsApp', external: true });
  if (/thank/.test(q)) return bot('You are welcome! Anything else I can help with?');
  return bot("I'm a demo assistant with scripted answers, so I may not get that one. Try a quick reply below, or talk to a human on WhatsApp.", { to: whatsappLink(), label: 'Chat on WhatsApp', external: true });
}

const time = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export function LiveChatDemo({ className }: { className?: string }) {
  const inputId = useId();
  const reduced = usePrefersReducedMotion();
  const initial = () => [bot(`Hi, I'm Go — ${site.name}'s virtual assistant. How can I help today?`), bot('Tip: paste a booking reference like DSG-RD-7KQ4-2M9P and I will look it up.')];
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [msgs, typing, reduced]);

  const send = (value: string) => {
    const v = value.trim();
    if (!v || typing) return;
    setMsgs((m) => [...m, { id: ++seq, from: 'me', text: v, at: new Date() }]);
    setText('');
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMsgs((m) => [...m, reply(v)]);
      setTyping(false);
    }, reduced ? 300 : 900 + Math.random() * 500);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(text);
  };

  return (
    <div className={cn('flex h-[560px] max-h-[80dvh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-900 text-white shadow-lift', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="relative grid size-11 place-items-center rounded-full bg-go-sheen shadow-glow-go">
          <Bot className="size-5" aria-hidden />
          <span className="absolute right-0 bottom-0 size-3 rounded-full bg-emerald-400 ring-2 ring-ink-900" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold">Go · Support assistant</p>
          <p className="text-xs text-white/55">Scripted replies · usually instant</p>
        </div>
        <span className="rounded-full border border-go-400/40 bg-go-500/15 px-2.5 py-1 text-[11px] font-bold tracking-wide text-go-300 uppercase">Demo</span>
        <button type="button" onClick={() => { clearTimeout(timer.current); setTyping(false); setMsgs(initial()); }} className="grid size-10 place-items-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Restart conversation">
          <RotateCcw className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5" role="log" aria-live="polite" aria-label="Chat messages">
        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed', m.from === 'me' ? 'rounded-br-md bg-brand-sheen text-white' : 'rounded-bl-md bg-white/[0.08] text-white/90')}>
                <span className="sr-only">{m.from === 'me' ? 'You said: ' : 'Assistant: '}</span>
                {m.text}
                {m.link && (
                  m.link.external ? (
                    <a href={m.link.to} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1.5 font-semibold text-go-300 hover:text-go-200">
                      <WhatsappGlyph className="size-4" /> {m.link.label}
                    </a>
                  ) : (
                    <Link to={m.link.to} className="mt-2 flex items-center gap-1.5 font-semibold text-go-300 hover:text-go-200">
                      {m.link.label} <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  )
                )}
                <span className={cn('mt-1 block text-[10px]', m.from === 'me' ? 'text-white/60' : 'text-white/40')}>{time(m.at)}</span>
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex">
              <span className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white/[0.08] px-4 py-3" aria-label="Assistant is typing">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="size-1.5 rounded-full bg-white/70" animate={reduced ? undefined : { y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick replies */}
      <div className="scrollbar-none flex gap-2 overflow-x-auto border-t border-white/10 px-4 pt-3 pb-1" role="group" aria-label="Quick replies">
        {QUICK.map((q) => (
          <button key={q} type="button" disabled={typing} onClick={() => send(q)} className="min-h-9 shrink-0 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white/85 transition hover:border-go-400/60 hover:bg-white/10 disabled:opacity-50">
            {q}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form onSubmit={onSubmit} className="flex items-center gap-2 p-3">
        <label htmlFor={inputId} className="sr-only">Type a message</label>
        <input
          id={inputId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message or paste a reference…"
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20"
        />
        <button type="submit" disabled={!text.trim() || typing} className="grid size-12 shrink-0 place-items-center rounded-xl bg-go-sheen text-white shadow-glow-go transition hover:brightness-110 disabled:opacity-40" aria-label="Send message">
          <SendHorizontal className="size-5" />
        </button>
      </form>
      <p className="px-4 pb-3 text-center text-[11px] text-white/40">Live chat interface demonstration — answers are pre-scripted, no agent is connected.</p>
    </div>
  );
}
