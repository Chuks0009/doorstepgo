import { CircleCheck, Headset, IdCard, Receipt, Share2, ShieldCheck } from 'lucide-react';
import { Avatar, ExternalButton, Reveal, SmartImage, Stars, WhatsappGlyph } from '@/components/ui';
import { images, img } from '@/data/images';
import { site, whatsappLink } from '@/config/site';

const items = [
  { Icon: IdCard, title: 'Rider details shown', body: 'Name, photo and vehicle details appear in your trip before pickup.' },
  { Icon: Share2, title: 'Live trip sharing', body: 'Send a trip link so family can follow along in real time.' },
  { Icon: Headset, title: 'Human support', body: 'Real people on WhatsApp, phone and email during operating hours.' },
  { Icon: Receipt, title: 'Transparent pricing', body: 'Itemised estimates before you book and a receipt after.' },
];

/** Safety & trust band with a mock in-app rider identity card. */
export function SafetyStrip() {
  return (
    <section aria-labelledby="safety-title" className="relative pb-24 sm:pb-32">
      <div className="container-x">
        <div className="noise relative isolate overflow-hidden rounded-[2.25rem] bg-ink-900 text-white">
          <div aria-hidden className="absolute inset-0 -z-10 bg-ink-radial" />
          <div aria-hidden className="absolute inset-y-0 right-[38%] -z-10 hidden w-40 -skew-x-[24deg] bg-white/[0.03] lg:block" />
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:p-14">
            <div>
              <span className="eyebrow-dark"><ShieldCheck className="size-3.5" aria-hidden /> Safety & trust</span>
              <h2 id="safety-title" className="mt-5 text-3xl leading-tight font-bold sm:text-4xl">Peace of mind, designed into every trip.</h2>
              <p className="mt-4 max-w-lg text-white/65">Safety features are built into the booking flow — not bolted on. Here's what every journey includes.</p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {items.map(({ Icon, title, body }, i) => (
                  <Reveal as="li" key={title} delay={i * 0.06} className="flex gap-3.5 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-go-500/15 text-go-300"><Icon className="size-5" aria-hidden /></span>
                    <span>
                      <span className="block font-semibold">{title}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-white/60">{body}</span>
                    </span>
                  </Reveal>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ExternalButton href={whatsappLink()} target="_blank" rel="noopener noreferrer" variant="white" iconLeft={<WhatsappGlyph className="size-4 text-[#25D366]" />}>
                  Chat with support
                </ExternalButton>
                <a href={`tel:${site.contact.phoneHref}`} className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline">
                  or call {site.contact.phone}
                </a>
              </div>
            </div>

            {/* Mock rider identity card */}
            <div className="relative mx-auto w-full max-w-sm self-center" aria-label="Example of the rider details shown in a trip (illustration)" role="img">
              <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-brand-500/20 blur-3xl" />
              <div aria-hidden className="relative rotate-[-2deg] overflow-hidden rounded-[1.75rem] bg-white text-ink-900 shadow-lift">
                <div className="relative h-32">
                  <SmartImage src={img(images.motorcycle[3].src, 700)} alt="" className="size-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wider text-ink-900 uppercase">Your rider</span>
                </div>
                <div className="-mt-8 px-5 pb-5">
                  <Avatar name="Chidi Okeke" size={64} ring className="shadow-lift" />
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold">Chidi O.</p>
                      <p className="text-xs text-muted">Premium Motorcycle · Red helmet</p>
                    </div>
                    <div className="text-right">
                      <Stars value={4.9} />
                      <p className="mt-0.5 text-[11px] text-muted">Sample profile</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
                    <div className="rounded-xl bg-surface-2 px-3 py-2"><span className="block text-muted">Plate</span><span className="font-mono font-bold">LND 482 XY</span></div>
                    <div className="rounded-xl bg-surface-2 px-3 py-2"><span className="block text-muted">PIN code</span><span className="font-mono font-bold">4 8 2 1</span></div>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-[12px]">
                    <li className="flex items-center gap-2"><CircleCheck className="size-4 text-ok" /> Spare helmet & hairnet on board</li>
                    <li className="flex items-center gap-2"><CircleCheck className="size-4 text-ok" /> Trip shared with 2 contacts</li>
                    <li className="flex items-center gap-2 text-muted"><span className="size-4 rounded-full border-2 border-dashed border-line-strong" /> ID verification — launching soon</li>
                  </ul>
                </div>
              </div>
              <p className="relative mt-4 text-center text-[11px] text-white/50">Illustration · demonstration profile</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
