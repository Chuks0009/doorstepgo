# DoorstepGo — Frontend Architecture & Design Guide

Premium mobility & logistics booking platform (React 19 · TypeScript · Vite 6 · Tailwind CSS v4 · React Router 7 · Framer Motion · lucide-react).
Everything is **frontend-only with mock services** — bookings, payments, tracking and notifications are simulated in the browser (localStorage) and clearly labelled as demo.

```
npm run dev      # start dev server
npm run build    # type-check + production build
```

## Folder map

| Path | Purpose |
|---|---|
| `src/config/site.ts` | **Central brand & business config** — name, logos, colours, emails, phone, WhatsApp number/message, address, hours, socials, feature flags, demo notice. Never hard-code these elsewhere. |
| `src/config/pricing.ts` | Illustrative pricing rules, surcharges, delivery multipliers, promo codes, payment methods, loyalty. |
| `src/config/locations.ts` | Cities → areas → junctions (+ helpers `findCity`, `findJunction`, `junctionLabel`, `cityName`). |
| `src/config/navigation.ts` | Header dropdown menus, footer columns, legal links. |
| `src/types/index.ts` | Domain types (RideBooking, DeliveryBooking, QuoteRequest, FareEstimate, User, AppNotification, …). |
| `src/data/images.ts` | Verified Unsplash imagery by category (`images.motorcycle[0..6]`, `tricycle[0..4]`, `shuttle[0..5]`, `delivery[0..7]`, `market[0..2]`, `city[0..4]`, `people[0..3]`, `hero[0..1]`). Each has `src`, `alt`. Use `img(src, width)` to resize. |
| `src/data/services.ts` | Service tiers (`motorcycleTiers`, `tricycleTiers`, `shuttleTiers`, `tiersByKind`, `findTier`), `deliveryCategories`, `packageCategories`, `serviceOverview`, `pic(cat, i)`. |
| `src/data/content.ts` | Testimonials (fictional, `demo: true`), FAQs + categories, team, values, stats, howItWorks, whyUs. |
| `src/data/seed.ts` | Demo customer, drivers, seeded bookings/deliveries/notifications/payments/quotes/merchants, `deliveryStages`. |
| `src/services/storage.ts` | Namespaced localStorage with change subscriptions (`KEYS`). |
| `src/services/pricingService.ts` | `estimateRide`, `estimateDelivery`, `estimateDistance`, `lookupPromo`, `applyPromo`. |
| `src/services/api.ts` | Mock API: `bookingService`, `deliveryService`, `quoteService`, `paymentService` (simulated), `notificationService`, `authService` (mock), `merchantService`, `supportService`, `resetDemo`. All async-shaped so real HTTP can drop in. |
| `src/hooks/index.ts` | `useForm` (values/errors/field()/check()), `usePageMeta`, `useScrolled`, `useCountUp`, `useTilt`, `useInterval`, `useDismiss`, `useLockBody`, `useMediaQuery`, `usePrefersReducedMotion`, `useDebounced`. |
| `src/hooks/useData.ts` | Reactive collections: `useBookings`, `useDeliveries`, `useNotifications`, `usePayments`, `useQuotes`, `useMerchants`, `useMessages`, `useUnreadCount`. |
| `src/context` | `AuthProvider/useAuth` (mock session), `ToastProvider/useToast`. |
| `src/components/ui` | Design-system primitives (barrel `@/components/ui`). |
| `src/components/layout` | Header (mega-menus), Footer, WhatsAppButton, PageHero, PageLoader. |
| `src/components/booking` | `LocationPicker` (+ `locationErrors`, `isLocationValid`, `rememberLocation`), `FareBreakdown`. |
| `src/layouts` | `MainLayout` (public), `AppShell` → `DashboardLayout`, `AdminLayout`. |
| `src/routes/AppRoutes.tsx` | All routes, lazy-loaded. |
| `src/utils` | `cn`, `naira`, `formatDate/Time/DateTime`, `timeAgo`, `makeReference`, `todayISO`, `addDays`, `initials`, …; `utils/validation.ts` rule builders (`required`, `email`, `phone`, `minLen`, `notPastDate`, `afterField`, `when`, …). |

## Design language

Derived from the logo: **ink navy** wordmark, **royal→electric blue** "D", **hot orange** "Go" + speed lines.

- Tokens (Tailwind classes): `ink-900/950`, `brand-50…900` (500 = electric `#2F7BFF`, 700 = royal `#1747C9`), `go-50…800` (500 = `#FF6A13`), `canvas`, `surface`, `surface-2`, `line`, `line-strong`, `text`, `text-2`, `muted`, status `ok/warn/crit/info` (+ `-bg`).
- Fonts: `font-display` (Sora) for headings, Plus Jakarta Sans for body.
- Utility classes in `index.css`: `container-x`, `eyebrow`, `eyebrow-dark`, `text-gradient-go`, `text-gradient-brand`, `bg-ink-radial`, `bg-brand-sheen`, `bg-go-sheen`, `glass`, `glass-dark`, `card`, `grid-lines`, `grid-lines-light`, `noise` (needs `relative`), `slash-go`, `skeleton`, `field-input`, `preserve-3d`, `perspective`.
- Shadows: `shadow-soft`, `shadow-lift`, `shadow-glow-go`, `shadow-glow-brand`. Animations: `animate-float`, `animate-float-slow`, `animate-marquee`, `animate-pulse-ring`, `animate-dash`, `animate-speed`, `animate-spin-slow`. Easing `ease-out-expo`.
- **Brand motif:** diagonal *speed lines* (orange→transparent bars/strokes), skewed shapes, route paths with animated dashes, glowing blue/orange orbs on ink backgrounds. Mix dark ink sections with light canvas sections; avoid pages that are just grids of identical rectangles — use bento layouts, overlapping layers, image-led cards, diagonal dividers, sticky side panels.
- **Every public page starts with a dark hero** (use `PageHero` or a custom dark hero with `pt-[calc(72px+…)]`) because the sticky header is transparent/light-text over the top of the page.
- Motion: Framer Motion (`Reveal` for scroll-in, `TiltCard` for 3D hover, `motion` with `whileInView`). `MotionConfig reducedMotion="user"` is global; CSS animations are disabled under reduced motion.

## UI primitives (`@/components/ui`)

`Button` / `ButtonLink` / `ExternalButton` (variants `go | brand | ink | outline | ghost | glass | white | danger | soft`, sizes `sm | md | lg | xl | icon`, `iconLeft/iconRight`, `loading`, `block`) ·
`Input`, `Textarea`, `Select` (options `{value,label,group?,disabled?}`), `Checkbox`, `Toggle`, `Segmented`, `ChoiceCard`, `Stepper` (number) ·
`Badge` (tones), `StatusBadge` (maps booking/delivery/payment/quote statuses) · `SectionHeading` · `Reveal` · `TiltCard` · `SmartImage` (skeleton + branded fallback) · `Breadcrumbs` · `DemoNotice` · `Stars` · `Avatar` · `EmptyState` · `ProgressSteps` (wizard indicator) · `Tabs` · `Card` · `Icon` (by name from `iconRegistry`) · `Logo` ·
`Modal`, `Drawer`, `AccordionItem` · `socialGlyphs`, `WhatsappGlyph`.

## Rules

1. No dead buttons/links — every action works (navigates, opens modal, triggers mock service, toasts).
2. Business info only from `site`/config. Prices via `naira()`. Always label estimates as estimates and simulated payments as demo.
3. Don't claim real verification, emergency integration, real payments or real customers. Testimonials are demo content.
4. Accessibility: labels on all inputs, `aria-*` on interactive widgets, visible focus, keyboard support, alt text, ≥44px touch targets, `usePageMeta(title, description)` on every page.
5. Responsive mobile-first; test layouts at 360px, 768px, 1280px mentally — no horizontal scroll.
6. Keep business logic in services/hooks, presentation in components.
