import { ArrowRight, Mail, Phone } from 'lucide-react';
import { AccordionItem, ButtonLink, ExternalButton, Reveal, SmartImage, WhatsappGlyph } from '@/components/ui';
import { faqs } from '@/data/content';
import { images, img } from '@/data/images';
import { site, whatsappLink } from '@/config/site';

/** FAQ preview — first five questions plus a support card. */
export function FaqPreview() {
  return (
    <section aria-labelledby="faq-title" className="relative bg-surface py-24 sm:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal><span className="eyebrow">FAQ</span></Reveal>
          <Reveal delay={0.05}>
            <h2 id="faq-title" className="mt-5 text-3xl leading-[1.1] font-bold text-ink-900 sm:text-4xl">Questions, answered.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-text-2">The essentials on booking, deliveries and market pickups. Still curious? Our team is a message away.</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-8 overflow-hidden rounded-3xl bg-ink-900 text-white shadow-lift">
            <div className="relative h-36">
              <SmartImage src={img(images.people[2].src, 800)} alt={images.people[2].alt} className="size-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent" />
            </div>
            <div className="-mt-6 p-6 pt-0">
              <p className="relative font-display text-xl font-bold">Talk to a human</p>
              <p className="mt-1 text-sm text-white/60">{site.hours[0].days}, {site.hours[0].time}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ExternalButton href={whatsappLink()} target="_blank" rel="noopener noreferrer" variant="white" size="sm" iconLeft={<WhatsappGlyph className="size-4 text-[#25D366]" />}>WhatsApp</ExternalButton>
                <ExternalButton href={`tel:${site.contact.phoneHref}`} variant="glass" size="sm" iconLeft={<Phone className="size-4" />}>Call</ExternalButton>
                <ExternalButton href={`mailto:${site.contact.supportEmail}`} variant="glass" size="sm" iconLeft={<Mail className="size-4" />}>Email</ExternalButton>
              </div>
            </div>
          </Reveal>
        </div>

        <div>
          <div className="space-y-3">
            {faqs.slice(0, 5).map((f, i) => (
              <Reveal key={f.id} delay={i * 0.05}>
                <AccordionItem question={f.question} defaultOpen={i === 0}>{f.answer}</AccordionItem>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3} className="mt-8">
            <ButtonLink to="/faq" variant="outline" size="lg" iconRight={<ArrowRight className="size-4" />}>View all FAQs</ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
