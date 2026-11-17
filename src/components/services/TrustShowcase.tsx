import { motion } from 'framer-motion';
import { BadgeCheck, Copy, Headset, Link2, MessageCircle, Receipt, Share2, ShieldCheck, Star } from 'lucide-react';
import { Avatar, Reveal, SectionHeading } from '@/components/ui';
import { site } from '@/config/site';
import { naira } from '@/utils';
import { GlowOrbs } from './Motifs';

/**
 * Bento of safety & trust features rendered as small product-UI demos.
 * All examples are SAMPLE interface previews — no real verification claims.
 */
export function TrustShowcase({ title = 'Safety & trust, designed in', subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="noise relative isolate overflow-hidden bg-ink-950 py-20 text-white sm:py-28">
      <GlowOrbs />
      <div className="container-x">
        <SectionHeading
          dark
          eyebrow="Safety & trust"
          title={title}
          subtitle={subtitle ?? 'Every booking carries the details you need to ride and send with confidence. The previews below are sample interface screens from this demonstration build.'}
        />

        <div className="mt-12 grid gap-4 md:grid-cols-6 lg:grid-rows-[auto_auto]">
          {/* Rider details */}
          <Reveal className="glass-dark relative overflow-hidden rounded-3xl p-6 md:col-span-3 lg:col-span-2 lg:row-span-2">
            <p className="flex items-center gap-2 text-sm font-bold text-go-300"><BadgeCheck className="size-4" aria-hidden /> Rider & vehicle details</p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">See who is coming before they arrive — name, photo, rating, vehicle and plate are attached to your booking.</p>
            <motion.div whileHover={{ y: -4 }} className="mt-6 rounded-2xl bg-white p-4 text-ink-900 shadow-lift">
              <div className="flex items-center gap-3">
                <Avatar name="Sample Rider" size={52} />
                <div className="min-w-0">
                  <p className="font-bold">Sample Rider</p>
                  <p className="flex items-center gap-1 text-xs text-muted"><Star className="size-3 fill-go-500 text-go-500" aria-hidden /> 4.9 · 1,240 trips</p>
                </div>
                <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase">Sample</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-surface-2 p-2.5"><dt className="text-muted">Vehicle</dt><dd className="font-bold">Red commuter bike</dd></div>
                <div className="rounded-xl bg-surface-2 p-2.5"><dt className="text-muted">Plate</dt><dd className="font-mono font-bold">ABC-123-XY</dd></div>
              </dl>
              <p className="mt-3 rounded-xl border border-dashed border-line-strong px-3 py-2 text-[11px] text-muted">Interface preview. Partner document checks are planned for a later release.</p>
            </motion.div>
          </Reveal>

          {/* Trip sharing */}
          <Reveal delay={0.05} className="glass-dark rounded-3xl p-6 md:col-span-3 lg:col-span-2">
            <p className="flex items-center gap-2 text-sm font-bold text-go-300"><Share2 className="size-4" aria-hidden /> Trip sharing</p>
            <p className="mt-2 text-sm text-white/65">Send a live status link to family or colleagues.</p>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/10 p-2 pl-3 text-sm">
              <Link2 className="size-4 shrink-0 text-white/50" aria-hidden />
              <span className="truncate font-mono text-white/80">track/DSG-RD-7KQ4…</span>
              <span className="ml-auto flex shrink-0 items-center gap-1 rounded-lg bg-go-500 px-2.5 py-1.5 text-xs font-bold"><Copy className="size-3" aria-hidden /> Copy</span>
            </div>
          </Reveal>

          {/* Booking reference */}
          <Reveal delay={0.1} className="glass-dark rounded-3xl p-6 md:col-span-3 lg:col-span-2">
            <p className="flex items-center gap-2 text-sm font-bold text-go-300"><Receipt className="size-4" aria-hidden /> Booking references</p>
            <p className="mt-2 text-sm text-white/65">Every trip and delivery gets a unique reference for tracking and support.</p>
            <p className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 font-mono text-base font-bold tracking-wider">DSG-RD-XXXX-XXXX</p>
          </Reveal>

          {/* Transparent pricing */}
          <Reveal delay={0.15} className="glass-dark rounded-3xl p-6 md:col-span-3 lg:col-span-2">
            <p className="flex items-center gap-2 text-sm font-bold text-go-300"><ShieldCheck className="size-4" aria-hidden /> Transparent pricing</p>
            <div className="mt-4 space-y-1.5 text-sm">
              {[['Base fare', 400], ['Distance (6.2 km)', 682], ['Service & booking', 220]].map(([k, v]) => (
                <div key={k as string} className="flex justify-between text-white/70"><span>{k}</span><span className="font-semibold text-white tabular-nums">{naira(v as number)}</span></div>
              ))}
              <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold"><span>Estimated total</span><span className="text-go-300">{naira(1300)}</span></div>
            </div>
          </Reveal>

          {/* Support */}
          <Reveal delay={0.2} className="glass-dark rounded-3xl p-6 md:col-span-6 lg:col-span-2">
            <p className="flex items-center gap-2 text-sm font-bold text-go-300"><Headset className="size-4" aria-hidden /> Real people on support</p>
            <p className="mt-2 text-sm text-white/65">WhatsApp, phone and email during operating hours — {site.hours[0].days}, {site.hours[0].time}.</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 px-3 py-2">My rider is at the wrong gate 🙈</p>
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-go-500 px-3 py-2">On it — we’ve messaged your rider with the right gate.</p>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/40"><MessageCircle className="size-3" aria-hidden /> Sample conversation</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
