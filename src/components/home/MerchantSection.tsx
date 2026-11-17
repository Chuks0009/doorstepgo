import { ArrowRight, BarChart3, CalendarClock, Check, FileSpreadsheet, MapPinned, PackageCheck, Store } from 'lucide-react';
import { ButtonLink, Reveal, SmartImage } from '@/components/ui';
import { images, img } from '@/data/images';
import { cn } from '@/utils';

const features = [
  { Icon: PackageCheck, title: 'Bulk & multi-drop deliveries', body: 'One booking, many recipients — each with their own delivery code.' },
  { Icon: CalendarClock, title: 'Scheduled pickups', body: 'Daily or weekly collection windows from your shop or warehouse.' },
  { Icon: MapPinned, title: 'Multiple locations', body: 'Manage branches and pickup points from a single account.' },
  { Icon: FileSpreadsheet, title: 'Monthly invoicing', body: 'Consolidated statements and proof-of-delivery records.' },
];

const drops = [
  { name: 'Order #1042 · Ifite', status: 'Delivered', tone: 'bg-ok' },
  { name: 'Order #1043 · UNIZIK hostels', status: 'In transit', tone: 'bg-go-500' },
  { name: 'Order #1044 · Temp Site', status: 'Collected', tone: 'bg-brand-500' },
  { name: 'Order #1045 · Aroma', status: 'Queued', tone: 'bg-line-strong' },
];

/** Merchant solutions — split layout with a mock merchant console. */
export function MerchantSection() {
  return (
    <section aria-labelledby="merchant-title" className="relative overflow-hidden py-24 sm:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        {/* Visual */}
        <div className="relative order-2 lg:order-1">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] shadow-lift">
              <SmartImage src={img(images.people[1].src, 1100)} alt={images.people[1].alt} className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink-900 backdrop-blur">
                <Store className="size-4 text-go-600" aria-hidden /> Built for shops & online sellers
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2} className="absolute -right-2 -bottom-10 w-[78%] max-w-sm sm:-right-6">
            <div aria-label="Example merchant console (illustration)" role="img" className="rounded-3xl bg-ink-900 p-4 text-white shadow-[0_40px_80px_-30px_rgb(5_11_34/0.8)] ring-1 ring-white/10">
              <div aria-hidden>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">Today's bulk drop</p>
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold"><BarChart3 className="size-3" /> Sample</span>
                </div>
                <div className="mt-3 flex h-1.5 gap-1 overflow-hidden rounded-full">
                  <span className="w-1/4 bg-ok" /><span className="w-1/4 bg-go-500" /><span className="w-1/4 bg-brand-500" /><span className="w-1/4 bg-white/15" />
                </div>
                <ul className="mt-3 space-y-1.5">
                  {drops.map((d) => (
                    <li key={d.name} className="flex items-center gap-2.5 rounded-xl bg-white/[0.05] px-3 py-2 text-[12px]">
                      <span className={cn('size-2 rounded-full', d.tone)} />
                      <span className="flex-1 truncate">{d.name}</span>
                      <span className="text-white/60">{d.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <Reveal><span className="eyebrow">Merchant solutions</span></Reveal>
          <Reveal delay={0.05}>
            <h2 id="merchant-title" className="mt-5 text-3xl leading-[1.1] font-bold text-balance text-ink-900 sm:text-4xl lg:text-[2.75rem]">
              Your delivery team, <span className="text-gradient-go">without the overhead.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg leading-relaxed text-text-2">From the provisions store down the road to fast-growing online brands — fulfil orders, restock branches and keep customers updated automatically.</p>
          </Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map(({ Icon, title, body }, i) => (
              <Reveal as="li" key={title} delay={0.1 + i * 0.05} className="flex gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink-900 text-white"><Icon className="size-5" aria-hidden /></span>
                <span>
                  <span className="block font-semibold text-ink-900">{title}</span>
                  <span className="mt-0.5 block text-[14px] leading-snug text-text-2">{body}</span>
                </span>
              </Reveal>
            ))}
          </ul>
          <p className="mt-6 flex items-center gap-2 text-[13px] text-muted"><Check className="size-4 text-ok" aria-hidden /> Cash-on-delivery support is simulated in this demo.</p>
          <Reveal delay={0.3} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/customers/merchants" variant="ink" size="lg" iconRight={<ArrowRight className="size-4" />}>Explore merchant solutions</ButtonLink>
            <ButtonLink to="/request-quote" variant="outline" size="lg">Request a business quote</ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
