/* =====================================================================
   CENTRAL BRAND & BUSINESS CONFIGURATION
   ---------------------------------------------------------------------
   Every piece of business information shown on the site comes from here.
   Update values in this file (not in components) when real details exist.
   Items marked PLACEHOLDER are fictional demonstration values.
   ===================================================================== */
import logo from '@/assets/brand/logo.png';
import logoLight from '@/assets/brand/logo-light.png';
import logoMark from '@/assets/brand/logo-mark.png';

export const site = {
  name: 'DoorstepGo',
  legalName: 'DoorstepGo Mobility & Logistics Ltd (PLACEHOLDER)',
  tagline: 'Moving People. Connecting Places. Delivering Possibilities.',
  shortPitch: 'Awka’s everyday mobility and delivery partner — built for Ifite and UNIZIK.',
  description:
    'Book a ride, schedule a pickup or get your goods delivered right to your doorstep with convenience, reliability and confidence.',
  /** Launch market — used in marketing copy. */
  market: { city: 'Awka', state: 'Anambra State', focus: 'Ifite-Awka', campus: 'Nnamdi Azikiwe University (UNIZIK)', campusShort: 'UNIZIK' },
  url: 'https://doorstepgo.example.com', // PLACEHOLDER

  logo: { full: logo, light: logoLight, mark: logoMark, alt: 'DoorstepGo' },

  /** Brand colours — mirrored as CSS tokens in src/index.css (@theme). */
  colors: {
    ink: '#0A1640',
    brand: '#1747C9',
    brandBright: '#2F7BFF',
    go: '#FF6A13',
    amber: '#FF9A2E',
  },

  contact: {
    email: 'hello@example.com', // PLACEHOLDER
    supportEmail: 'support@example.com', // PLACEHOLDER
    businessEmail: 'business@example.com', // PLACEHOLDER
    partnersEmail: 'partners@example.com', // PLACEHOLDER
    careersEmail: 'careers@example.com', // PLACEHOLDER
    phone: '+234 800 000 0000', // PLACEHOLDER
    phoneHref: '+2348000000000',
    emergencyLine: '+234 800 000 0911', // PLACEHOLDER — not connected to emergency services
    address: {
      line1: '12 Sample Street (PLACEHOLDER), off Ifite Road',
      line2: 'Ifite-Awka',
      city: 'Awka, Anambra State',
      country: 'Nigeria',
    },
    mapQuery: 'Ifite, Awka, Anambra State',
  },

  whatsapp: {
    /** International format, digits only — PLACEHOLDER number. */
    number: '2348000000000',
    displayNumber: '+234 800 000 0000',
    defaultMessage: "Hello DoorstepGo 👋 I'm in Awka and I'd like some help with a booking.",
    tooltip: 'Chat with Support',
  },

  hours: [
    { days: 'Monday – Friday', time: '6:00 AM – 10:00 PM' },
    { days: 'Saturday', time: '7:00 AM – 10:00 PM' },
    { days: 'Sunday & public holidays', time: '9:00 AM – 8:00 PM' },
  ],
  supportNote: 'Ride & delivery support is staffed during operating hours. (Demonstration schedule)',

  social: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    linkedin: 'https://linkedin.com/',
    x: 'https://x.com/',
    tiktok: 'https://tiktok.com/',
    youtube: 'https://youtube.com/',
  },

  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },

  /** Feature flags — flip as real integrations come online. */
  features: {
    realPayments: false,
    realAuth: false,
    liveTracking: false,
    realNotifications: false,
    driverVerification: false,
    emergencyIntegration: false,
  },

  demoNotice:
    'Demonstration build — bookings, payments, tracking and notifications are simulated in your browser. No real money is charged and no real driver is dispatched.',
} as const;

export const whatsappLink = (message: string = site.whatsapp.defaultMessage) =>
  `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;

export type SocialKey = keyof typeof site.social;
