import { ArrowRight } from 'lucide-react';
import { AccordionItem, ButtonLink, Reveal, SectionHeading } from '@/components/ui';
import { faqs } from '@/data/content';

/** FAQ snippet filtered by id list or keyword match on the question. */
export function ServiceFaq({ ids, keywords = [], title = 'Questions, answered', limit = 5, subtitle }: { ids?: string[]; keywords?: string[]; title?: string; limit?: number; subtitle?: string }) {
  const kw = keywords.map((k) => k.toLowerCase());
  const list = faqs
    .filter((f) => ids?.includes(f.id) || kw.some((k) => f.question.toLowerCase().includes(k) || f.answer.toLowerCase().includes(k)))
    .slice(0, limit);
  if (!list.length) return null;
  return (
    <section className="container-x grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_1.4fr]">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <SectionHeading eyebrow="FAQ" title={title} subtitle={subtitle ?? 'Quick answers to what customers ask most. Still unsure? Our support team is a message away.'} />
        <Reveal delay={0.2} className="mt-8">
          <ButtonLink to="/faq" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden />}>All FAQs</ButtonLink>
        </Reveal>
      </div>
      <div className="space-y-3">
        {list.map((f, i) => (
          <Reveal key={f.id} delay={i * 0.05}>
            <AccordionItem question={f.question} defaultOpen={i === 0}>{f.answer}</AccordionItem>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
