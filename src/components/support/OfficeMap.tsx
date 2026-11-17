import { Building, MapPin, Navigation } from 'lucide-react';
import { site } from '@/config/site';
import { ExternalButton } from '@/components/ui';

/** Stylised office location placeholder — pure SVG, no map API. */
export function OfficeMap() {
  const a = site.contact.address;
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
      <div className="relative">
        <svg viewBox="0 0 400 220" className="block h-auto w-full" role="img" aria-label={`Illustrative map of ${a.line2}, ${a.city}`}>
          <rect width="400" height="220" fill="#eef1f8" />
          {/* green belt */}
          <path d="M 0 170 C 80 150, 140 196, 220 182 S 340 150, 400 168 L 400 220 L 0 220 Z" fill="#e5f6ec" />
          <path d="M 0 178 C 80 158, 140 204, 220 190 S 340 158, 400 176" fill="none" stroke="#c9ecd6" strokeWidth="2" />
          {/* blocks */}
          {[
            [16, 14, 70, 44], [100, 14, 54, 30], [170, 10, 80, 46], [266, 16, 56, 36], [336, 12, 52, 48],
            [16, 76, 46, 52], [78, 62, 80, 40], [182, 74, 50, 50], [250, 66, 72, 34], [338, 76, 50, 46],
            [78, 116, 70, 30], [250, 114, 60, 28],
          ].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill="#ffffff" stroke="#e3e8f2" />)}
          {/* park */}
          <rect x="160" y="128" width="72" height="26" rx="8" fill="#e5f6ec" />
          {/* roads */}
          <g fill="none" stroke="#cdd5e4" strokeLinecap="round">
            <path d="M 0 64 L 400 58" strokeWidth="7" />
            <path d="M 0 108 C 120 112, 260 104, 400 108" strokeWidth="9" stroke="#ffffff" />
            <path d="M 0 108 C 120 112, 260 104, 400 108" strokeWidth="1.5" strokeDasharray="6 6" stroke="#cdd5e4" />
            <path d="M 166 0 L 172 160" strokeWidth="6" />
            <path d="M 330 0 L 326 160" strokeWidth="5" />
            <path d="M 92 0 L 66 160" strokeWidth="4" />
          </g>
          {/* speed accent */}
          <path d="M 60 140 C 120 136, 180 118, 240 106" fill="none" stroke="#FF6A13" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 8" className="animate-dash" />
          {/* pin */}
          <g transform="translate(240 102)">
            <ellipse cy="4" rx="12" ry="4" fill="#0a1640" opacity="0.15" />
            <circle r="26" fill="#FF6A13" opacity="0.12" className="animate-pulse-ring" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
            <path d="M 0 2 C -13 -12, -13 -32, 0 -34 C 13 -32, 13 -12, 0 2 Z" fill="#FF6A13" stroke="white" strokeWidth="2.5" />
            <circle cy="-21" r="5" fill="white" />
          </g>
        </svg>
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-text-2 shadow-soft backdrop-blur">Illustrative map</span>
      </div>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-go-50 text-go-600"><Building className="size-5" aria-hidden /></span>
          <address className="text-sm not-italic">
            <span className="block font-semibold text-ink-900">{site.name} HQ</span>
            <span className="block text-text-2">{a.line1}</span>
            <span className="block text-text-2">{a.line2}, {a.city}, {a.country}</span>
          </address>
        </div>
        <ExternalButton
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.contact.mapQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          size="sm"
          className="shrink-0"
          iconLeft={<Navigation className="size-4" />}
        >
          Get directions
        </ExternalButton>
      </div>
      <p className="flex items-center gap-1.5 border-t border-line px-5 py-3 text-xs text-muted"><MapPin className="size-3.5" aria-hidden /> Visits by appointment only. Address shown is a placeholder.</p>
    </div>
  );
}
