import type { ReactNode } from 'react';
import { MessageCircle } from 'lucide-react';
import { ExternalButton, Reveal, SmartImage } from '@/components/ui';
import { whatsappLink } from '@/config/site';
import { img } from '@/data/images';
import { GlowOrbs, RoutePath, SpeedLines } from './Motifs';

/** Closing call-to-action band: dark ink panel, image, route motif and actions. */
export function ServiceCTA({
  eyebrow = 'Ready when you are',
  title,
  body,
  actions,
  image,
  imageAlt = '',
  whatsappMessage,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  actions: ReactNode;
  image?: string;
  imageAlt?: string;
  whatsappMessage?: string;
}) {
  return (
    <section className="container-x py-16 sm:py-24">
      <Reveal>
        <div className="noise relative isolate overflow-hidden rounded-[2rem] bg-ink-950 text-white shadow-lift">
          <GlowOrbs />
          <div className="grid items-stretch lg:grid-cols-[1.3fr_1fr]">
            <div className="relative p-8 sm:p-12 lg:p-14">
              <span className="eyebrow-dark">{eyebrow}</span>
              <h2 className="mt-5 max-w-xl text-3xl leading-[1.08] font-extrabold text-balance sm:text-4xl lg:text-5xl">{title}</h2>
              {body && <p className="mt-4 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">{body}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                {actions}
                <ExternalButton href={whatsappLink(whatsappMessage)} target="_blank" rel="noopener noreferrer" variant="glass" size="lg" iconLeft={<MessageCircle className="size-5" aria-hidden />}>
                  Ask on WhatsApp
                </ExternalButton>
              </div>
              <SpeedLines className="absolute right-0 bottom-10 hidden w-1/3 opacity-50 lg:flex" />
            </div>
            {image && (
              <div className="relative min-h-60 lg:min-h-full">
                <SmartImage src={img(image, 1000)} alt={imageAlt} className="absolute inset-0" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent lg:bg-gradient-to-r" />
                <RoutePath className="absolute inset-x-6 bottom-6 h-24 w-[calc(100%-3rem)]" />
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
