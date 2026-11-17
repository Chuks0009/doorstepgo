import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Link2, MessagesSquare, Phone, Search, SearchX, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { AccordionItem, Badge, Button, ButtonLink, ExternalButton, Reveal, WhatsappGlyph } from '@/components/ui';
import { HelpPanel } from '@/components/support/HelpPanel';
import { Highlight, searchTerms } from '@/components/support/Highlight';
import { useCopy } from '@/components/tracking/TrackingParts';
import { faqCategories, faqs } from '@/data/content';
import { site, whatsappLink } from '@/config/site';
import { useDebounced, usePageMeta } from '@/hooks';
import { cn } from '@/utils';
import type { FaqItem } from '@/types';

const POPULAR = ['track', 'refund', 'market pickup', 'cancel', 'payment', 'rider'];
const ALL = 'all';

export default function FaqPage() {
  usePageMeta('FAQ & help centre', 'Answers about booking rides, scheduling deliveries, market pickup, tracking, payments, cancellations, refunds and partnering with DoorstepGo.');
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const cat = params.get('cat') ?? ALL;
  const debounced = useDebounced(query, 180);
  const terms = useMemo(() => searchTerms(debounced), [debounced]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Record<string, 'yes' | 'no'>>({});
  const { copy } = useCopy();

  // Keep URL in sync (deep-linkable ?q= & ?cat=)
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debounced.trim()) next.set('q', debounced.trim());
    else next.delete('q');
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // "/" focuses search
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !/input|textarea|select/i.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  // Scroll to a deep-linked question (#f6)
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
  }, [hash]);

  const matches = (f: FaqItem) => {
    if (!terms.length) return true;
    const hay = `${f.question} ${f.answer} ${f.category}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  };

  const searched = useMemo(() => faqs.filter(matches), [terms]); // eslint-disable-line react-hooks/exhaustive-deps
  const results = cat === ALL ? searched : searched.filter((f) => f.category === cat);
  const counts = useMemo(() => Object.fromEntries(faqCategories.map((c) => [c, searched.filter((f) => f.category === c).length])), [searched]);
  const searching = terms.length > 0;

  const setCat = (c: string) => {
    const next = new URLSearchParams(params);
    if (c === ALL) next.delete('cat');
    else next.set('cat', c);
    setParams(next, { replace: true });
  };
  const clearAll = () => {
    setQuery('');
    setParams(new URLSearchParams(), { replace: true });
    inputRef.current?.focus();
  };

  const grouped = !searching && cat === ALL;
  const groups = grouped ? faqCategories.map((c) => ({ c, items: results.filter((f) => f.category === c) })).filter((g) => g.items.length) : [{ c: '', items: results }];

  const renderItem = (f: FaqItem, i: number) => (
    <motion.div key={f.id} layout="position" id={f.id} className="scroll-mt-28" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <AccordionItem key={`${f.id}-${terms.join('|')}`} defaultOpen={(searching && i < 2) || hash === `#${f.id}`} question={<Highlight text={f.question} terms={terms} />}>
        <p><Highlight text={f.answer} terms={terms} /></p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <div className="flex items-center gap-2">
            <Badge tone="brand">{f.category}</Badge>
            <button type="button" onClick={() => copy(`${window.location.origin}/faq#${f.id}`, 'Link to answer copied')} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted transition hover:bg-surface-2 hover:text-ink-900">
              <Link2 className="size-3.5" aria-hidden /> Copy link
            </button>
          </div>
          {feedback[f.id] ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ok" role="status"><Check className="size-3.5" aria-hidden /> Thanks for the feedback{feedback[f.id] === 'no' ? ' — we will improve this answer.' : '!'}</p>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted" role="group" aria-label="Was this answer helpful?">
              <span className="mr-1">Helpful?</span>
              <button type="button" onClick={() => setFeedback((p) => ({ ...p, [f.id]: 'yes' }))} className="grid size-9 place-items-center rounded-lg transition hover:bg-ok-bg hover:text-ok" aria-label="Yes, helpful"><ThumbsUp className="size-4" /></button>
              <button type="button" onClick={() => setFeedback((p) => ({ ...p, [f.id]: 'no' }))} className="grid size-9 place-items-center rounded-lg transition hover:bg-crit-bg hover:text-crit" aria-label="No, not helpful"><ThumbsDown className="size-4" /></button>
            </div>
          )}
        </div>
      </AccordionItem>
    </motion.div>
  );

  return (
    <>
      <PageHero
        compact
        crumbs={[{ label: 'FAQ' }]}
        eyebrow="Help centre"
        title={<>Answers, <span className="text-gradient-go">fast.</span></>}
        subtitle="Search everything about rides, deliveries, market pickup, payments, cancellations and partnering with us."
      >
        <div className="mt-8 max-w-3xl">
          <div className="glass-dark rounded-3xl p-2.5" role="search">
            <label htmlFor="faq-search" className="sr-only">Search frequently asked questions</label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" aria-hidden />
              <input
                ref={inputRef}
                id="faq-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
                placeholder="Search e.g. “refund”, “market pickup”, “track”"
                autoComplete="off"
                aria-controls="faq-results"
                className="field-input h-14 pr-24 pl-12 text-base [&::-webkit-search-cancel-button]:hidden"
              />
              <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
                {query ? (
                  <button type="button" onClick={clearAll} className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink-900" aria-label="Clear search">
                    <X className="size-4" />
                  </button>
                ) : (
                  <kbd className="hidden rounded-md border border-line-strong bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted sm:block" aria-hidden>/</kbd>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-white/55">Popular:</span>
            {POPULAR.map((p) => (
              <button key={p} type="button" onClick={() => setQuery(p)} className="min-h-9 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white/80 transition hover:border-go-400/60 hover:bg-white/10 hover:text-white">
                {p}
              </button>
            ))}
          </div>
        </div>
      </PageHero>

      <section className="bg-canvas py-12 lg:py-16">
        <div className="container-x grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 hidden text-xs font-bold tracking-[0.14em] text-muted uppercase lg:block">Categories</p>
            <div role="group" aria-label="Filter by category" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
              {[ALL, ...faqCategories].map((c) => {
                const active = c === cat;
                const n = c === ALL ? searched.length : counts[c] ?? 0;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCat(c)}
                    className={cn(
                      'relative flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-xl px-4 text-sm font-semibold whitespace-nowrap transition-colors',
                      active ? 'text-white' : 'border border-line bg-white text-text-2 hover:border-brand-300 hover:text-ink-900 lg:border-transparent lg:bg-transparent lg:hover:bg-white',
                    )}
                  >
                    {active && <motion.span layoutId="faq-cat" className="absolute inset-0 -z-0 rounded-xl bg-ink-900 shadow-soft" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                    <span className="relative">{c === ALL ? 'All questions' : c}</span>
                    <span className={cn('relative rounded-full px-2 py-0.5 text-[11px] tabular-nums', active ? 'bg-go-500 text-white' : 'bg-surface-2 text-muted')}>{n}</span>
                  </button>
                );
              })}
            </div>
            <HelpPanel className="mt-8 hidden lg:block" message="Hello DoorstepGo, I couldn't find my answer in the FAQ." />
          </aside>

          {/* Results */}
          <div id="faq-results" className="min-w-0">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-text-2" aria-live="polite" aria-atomic="true">
                <span className="font-display text-lg font-bold text-ink-900">{results.length}</span> {results.length === 1 ? 'answer' : 'answers'}
                {searching && <> for “<span className="font-semibold text-ink-900">{debounced.trim()}</span>”</>}
                {cat !== ALL && <> in <span className="font-semibold text-ink-900">{cat}</span></>}
              </p>
              {(searching || cat !== ALL) && (
                <Button variant="ghost" size="sm" onClick={clearAll} iconLeft={<X className="size-4" />}>Clear filters</Button>
              )}
            </div>

            {results.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line-strong bg-white px-6 py-14 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-go-50 text-go-600"><SearchX className="size-6" aria-hidden /></span>
                <p className="font-display text-xl font-bold text-ink-900">No answers match that yet</p>
                <p className="max-w-md text-sm text-text-2">Try fewer or different words{cat !== ALL ? ', or search all categories' : ''}. Our support team can answer anything the FAQ doesn't.</p>
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  <ButtonLink to={`/contact?topic=support${searching ? `&subject=${encodeURIComponent(debounced.trim())}` : ''}`} iconRight={<ArrowRight className="size-4" />}>Ask support</ButtonLink>
                  <Button variant="outline" onClick={clearAll}>Show all questions</Button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-10">
                {groups.map((g) => (
                  <div key={g.c || 'flat'}>
                    {g.c && (
                      <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-ink-900">
                        <span className="h-[3px] w-6 rounded-full bg-gradient-to-r from-go-500 to-amber-glow" aria-hidden />
                        {g.c}
                        <span className="text-sm font-medium text-muted">({g.items.length})</span>
                      </h2>
                    )}
                    <div className="space-y-3">
                      <AnimatePresence initial={false} mode="popLayout">{g.items.map(renderItem)}</AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <HelpPanel className="mt-10 lg:hidden" message="Hello DoorstepGo, I couldn't find my answer in the FAQ." />
          </div>
        </div>
      </section>

      {/* Still need help band */}
      <section className="border-t border-line bg-white py-14 lg:py-20">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Still need help?</span>
            <h2 className="mt-4 text-3xl font-bold text-ink-900 sm:text-4xl">Talk to a real person</h2>
            <p className="mt-3 text-text-2">{site.supportNote}</p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: <WhatsappGlyph className="size-6" />, title: 'WhatsApp', body: 'Fastest for booking help — send your reference.', action: <ExternalButton href={whatsappLink()} target="_blank" rel="noopener noreferrer" variant="go" block>Start chat</ExternalButton> },
              { icon: <Phone className="size-6" />, title: 'Call us', body: `${site.hours[0].days}, ${site.hours[0].time}.`, action: <ExternalButton href={`tel:${site.contact.phoneHref}`} variant="ink" block>{site.contact.phone}</ExternalButton> },
              { icon: <MessagesSquare className="size-6" />, title: 'Send a message', body: 'Get a ticket reference and a reply by email.', action: <ButtonLink to="/contact" variant="outline" block>Contact form</ButtonLink> },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.06} className="card flex flex-col p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">{c.icon}</span>
                <p className="mt-4 font-display text-lg font-bold text-ink-900">{c.title}</p>
                <p className="mt-1 flex-1 text-sm text-text-2">{c.body}</p>
                <div className="mt-5">{c.action}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
