# DoorstepGo

**Moving People. Connecting Places. Delivering Possibilities.**

DoorstepGo is a mobility and logistics booking platform for **Awka, Anambra State**, starting with **Ifite-Awka** and students of **Nnamdi Azikiwe University (UNIZIK)**. Customers book motorcycles, tricycles (keke) and shuttles, schedule deliveries and send riders on market pickups, all from their doorstep.

> **Status: frontend demo.** Bookings, payments, tracking and notifications are simulated in the browser using local storage. No real money is charged and no driver is dispatched.

## Features

- **Public site:** homepage with a 3D hero and quick-booking widget, service pages (motorcycle, tricycle, shuttle, delivery), customers, merchants, about, contact and FAQ
- **Booking:** step-by-step ride and delivery forms with live fare estimates, market-pickup mode, multiple stops and drop-offs, and recurring trips
- **Checkout:** simulated payment, promo codes (try `UNIZIK10`), payment confirmation and a printable receipt
- **Request a Quote** for groups, events and business transport
- **Tracking:** live booking and delivery timelines on a route map, with proof of delivery
- **Customer dashboard:** bookings, deliveries, payments, notifications, saved places, rewards, support and profile
- **Admin console:** operations charts, bookings kanban, table and calendar, dispatch map, quotes inbox with invoice preview, merchants, fleet and support inbox

## Getting started

Requires **Node.js 20+**.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

**Demo accounts** (on `/login`):
- Customer: `ada.demo@example.com` / `demo1234`, or click **Use demo account**
- Admin: click **Admin demo →**

## Configuration

All business details live in `src/config/`, so you never need to edit components:

| File | What to change |
|---|---|
| `site.ts` | Company name, logos, colours, email, phone, **WhatsApp number**, address, hours, social links |
| `locations.ts` | Awka areas, junctions and streets; cities shown as "coming soon" |
| `pricing.ts` | Fares, surcharges, delivery fees, promo codes, payment methods, loyalty |
| `navigation.ts` | Header menus and footer links |

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the folder map, design system and component guide.

## Tech stack

React 19 · TypeScript · Vite 6 · Tailwind CSS v4 · React Router 7 · Framer Motion · lucide-react

## Deployment

Static site and SPA. Build with `npm run build` and deploy `dist/` to Netlify or Vercel. `public/_redirects` handles client-side routes on Netlify.
