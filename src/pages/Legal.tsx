import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Cookie, FileText, Lock, Mail, Printer, Scale, TriangleAlert } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { Button, ButtonLink } from '@/components/ui';
import { usePageMeta } from '@/hooks';
import { site } from '@/config/site';
import { cn, formatDate } from '@/utils';
import { findLegalDoc, legalDocs, type LegalDoc } from '@/components/company/legalContent';
import { useHashScroll } from '@/components/company/shared';

const docIcon = { privacy: Lock, terms: Scale, cookies: Cookie } as const;

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    setActive(ids[0]);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: '-100px 0px -60% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

function DocView({ doc }: { doc: LegalDoc }) {
  const active = useScrollSpy(doc.sections.map((s) => s.id));
  return (
    <section className="py-14 lg:py-20">
      <div className="container-x grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
        {/* TOC */}
        <aside className="no-print lg:sticky lg:top-28 lg:self-start">
          <nav aria-label="Legal documents" className="flex gap-2 overflow-x-auto lg:flex-col">
            {legalDocs.map((d) => {
              const I = docIcon[d.slug];
              const on = d.slug === doc.slug;
              return (
                <Link key={d.slug} to={`/legal/${d.slug}`} aria-current={on ? 'page' : undefined} className={cn('flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-3.5 text-sm font-semibold transition', on ? 'bg-ink-900 text-white' : 'bg-white text-text-2 ring-1 ring-line hover:text-ink-900')}>
                  <I className={cn('size-4', on && 'text-go-400')} aria-hidden />{d.title}
                </Link>
              );
            })}
          </nav>
          <nav aria-label="On this page" className="mt-8 hidden lg:block">
            <p className="text-xs font-bold tracking-wider text-muted uppercase">On this page</p>
            <ol className="mt-3 space-y-0.5 border-l-2 border-line">
              {doc.sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', `#${s.id}`); }} className={cn('-ml-0.5 block border-l-2 py-1.5 pl-4 text-sm transition', active === s.id ? 'border-go-500 font-semibold text-ink-900' : 'border-transparent text-text-2 hover:text-ink-900')}>
                    <span className="mr-1.5 text-muted tabular-nums">{i + 1}.</span>{s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0">
          <div role="note" className="flex items-start gap-3 rounded-2xl border border-warn/30 bg-warn-bg p-4 text-sm text-[#7a4a00]">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden />
            <p><strong>Placeholder document.</strong> This text is a sensible starting point for a demonstration and is <em>not</em> legal advice. It must be reviewed and replaced by qualified legal counsel before launch.</p>
          </div>

          <div className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-6">
              <p className="text-sm text-muted">Last updated <time dateTime={doc.updated} className="font-semibold text-ink-900">{formatDate(doc.updated)}</time></p>
              <Button variant="outline" size="sm" className="no-print" iconLeft={<Printer className="size-4" />} onClick={() => window.print()}>Print</Button>
            </div>
            <p className="mt-6 text-lg leading-relaxed text-text-2">{doc.summary}</p>

            {/* mobile TOC */}
            <details className="no-print mt-6 rounded-2xl bg-surface-2 p-4 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold text-ink-900">Contents ({doc.sections.length} sections)</summary>
              <ol className="mt-3 space-y-2 text-sm">
                {doc.sections.map((s, i) => <li key={s.id}><a href={`#${s.id}`} className="text-brand-700 hover:underline">{i + 1}. {s.heading}</a></li>)}
              </ol>
            </details>

            <div className="mt-4">
              {doc.sections.map((s, i) => (
                <div key={s.id}>
                  <section id={s.id} className={cn('scroll-mt-24', i > 0 && 'mt-8 border-t border-line pt-8')}>
                    <h2 className="flex items-baseline gap-3 text-xl font-bold text-ink-900 sm:text-2xl">
                      <span className="font-display text-sm font-bold text-go-500 tabular-nums">{String(i + 1).padStart(2, '0')}</span>{s.heading}
                    </h2>
                    {s.body.map((p, j) => <p key={j} className="mt-3 leading-relaxed text-text-2">{p}</p>)}
                    {s.list && (
                      <ul className="mt-4 space-y-2">
                        {s.list.map((li) => <li key={li} className="flex gap-3 leading-relaxed text-text-2"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-go-500" aria-hidden />{li}</li>)}
                      </ul>
                    )}
                  </section>
                </div>
              ))}
            </div>
          </div>

          <div className="no-print mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink-950 p-6 text-white">
            <p className="flex items-center gap-2"><Mail className="size-5 text-go-400" aria-hidden />Questions about this document?</p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink to="/contact" size="sm" variant="white">Contact us</ButtonLink>
              <ButtonLink to="/faq" size="sm" variant="glass">Read FAQs</ButtonLink>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function LegalPage() {
  const { doc: slug } = useParams();
  const doc = findLegalDoc(slug);
  usePageMeta(doc ? doc.title : 'Legal document not found', doc?.summary ?? `Legal documents for ${site.name}.`);
  useHashScroll();

  if (!doc) {
    return (
      <>
        <PageHero compact crumbs={[{ label: 'Home', to: '/' }, { label: 'Legal' }]} eyebrow="Legal" title="We couldn’t find that document" subtitle={`There’s no legal document called “${slug ?? ''}”. Choose one of ours below.`} />
        <section className="py-16">
          <div className="container-x grid gap-4 sm:grid-cols-3">
            {legalDocs.map((d) => {
              const I = docIcon[d.slug];
              return (
                <Link key={d.slug} to={`/legal/${d.slug}`} className="group card flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-lift">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700 group-hover:bg-ink-900 group-hover:text-white"><I className="size-5" aria-hidden /></span>
                  <h2 className="mt-4 text-lg font-bold text-ink-900">{d.title}</h2>
                  <p className="mt-1 flex-1 text-sm text-text-2">{d.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">Read <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
                </Link>
              );
            })}
          </div>
          <div className="container-x mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/" variant="ink">Back to home</ButtonLink>
            <ButtonLink to="/contact" variant="outline" iconLeft={<FileText className="size-4" />}>Ask our team</ButtonLink>
          </div>
        </section>
      </>
    );
  }

  const I = docIcon[doc.slug];
  return (
    <>
      <PageHero
        compact
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Legal' }, { label: doc.title }]}
        eyebrow={<><I className="size-3.5" aria-hidden /> Legal · {doc.short}</>}
        title={doc.title}
        subtitle={doc.summary}
      />
      <DocView key={doc.slug} doc={doc} />
    </>
  );
}
