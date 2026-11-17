/* PLACEHOLDER legal copy — sensible starting points only. Must be reviewed and
   replaced by qualified counsel (incl. NDPA 2023 compliance) before launch. */
import { site } from '@/config/site';

export interface LegalSection { id: string; heading: string; body: string[]; list?: string[] }
export interface LegalDoc { slug: 'privacy' | 'terms' | 'cookies'; title: string; short: string; updated: string; summary: string; sections: LegalSection[] }

const company = site.legalName;
const addr = `${site.contact.address.line1}, ${site.contact.address.line2}, ${site.contact.address.city}, ${site.contact.address.country}`;

export const legalDocs: LegalDoc[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    short: 'Privacy',
    updated: '2026-11-01',
    summary: `How ${site.name} collects, uses, shares and protects your personal information when you book rides, send deliveries or use our website.`,
    sections: [
      { id: 'who-we-are', heading: 'Who we are', body: [`${company} (“${site.name}”, “we”, “us”) operates the ${site.name} website and booking services. We are the data controller for the personal information described in this policy.`, `You can contact us about privacy at ${site.contact.email} or by post at ${addr}.`] },
      { id: 'data-we-collect', heading: 'Information we collect', body: ['We collect information you give us and information generated when you use our services.'], list: ['Account details — name, email address, phone number and password.', 'Booking details — pickup and drop-off locations, dates, times, passengers, package descriptions and special instructions.', 'Recipient details you provide for deliveries.', 'Payment information — processed by our payment partners; we do not store full card numbers.', 'Support conversations, reviews and feedback.', 'Device and usage information — browser type, pages visited and approximate location derived from your IP address.'] },
      { id: 'how-we-use', heading: 'How we use your information', body: ['We use personal information only where we have a lawful basis to do so, including to perform our contract with you, comply with law, and pursue legitimate interests such as keeping our platform safe.'], list: ['To provide, schedule and complete rides and deliveries.', 'To calculate fare estimates and process payments.', 'To send booking status updates, receipts and service notifications.', 'To provide customer support and resolve disputes.', 'To prevent fraud, misuse and safety incidents.', 'To improve our services and, with your consent, send marketing.'] },
      { id: 'sharing', heading: 'How we share information', body: ['We share only what is needed for each purpose:'], list: ['With riders and drivers — your name, pickup and destination, and contact number for the trip.', 'With delivery recipients — status updates and delivery codes.', 'With service providers — hosting, payments, messaging and analytics, under contract.', 'With authorities — where required by law or to protect safety.'] },
      { id: 'retention', heading: 'How long we keep it', body: ['We keep booking and payment records for as long as needed to provide the service and meet legal, tax and accounting obligations, then delete or anonymise them.'] },
      { id: 'your-rights', heading: 'Your rights', body: ['Subject to applicable law, you may request access to, correction of, or deletion of your personal information, object to or restrict certain processing, withdraw consent and request data portability. Contact us to exercise these rights. You may also complain to the relevant data protection authority.'] },
      { id: 'security', heading: 'Security', body: ['We use administrative, technical and physical safeguards appropriate to the risk. No system is perfectly secure; please keep your account credentials private.'] },
      { id: 'changes', heading: 'Changes to this policy', body: ['We may update this policy from time to time. We will post the new version here and update the “last updated” date, and notify you of material changes.'] },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    short: 'Terms',
    updated: '2026-11-01',
    summary: `The rules for using ${site.name} to book rides, shuttles and deliveries — including fares, cancellations, prohibited items and liability.`,
    sections: [
      { id: 'agreement', heading: 'Agreement to these terms', body: [`By creating an account or making a booking you agree to these Terms with ${company}. If you do not agree, please do not use our services.`] },
      { id: 'services', heading: 'Our services', body: [`${site.name} is a technology platform that connects customers with independent riders, drivers and transport operators for rides, shuttles, parcel delivery and market pickup.`] },
      { id: 'accounts', heading: 'Your account', body: ['You must provide accurate information and keep your login secure. You are responsible for activity on your account. You must be at least 18 years old to hold an account.'] },
      { id: 'fares', heading: 'Fares, estimates & payment', body: ['Fares shown before booking are estimates based on distance, time, service tier and demand. The final fare appears on your receipt and may differ where the route, waiting time or stops change.'], list: ['Promotional codes are subject to their own conditions and may be withdrawn.', 'Payment for goods bought at markets is separate from your delivery fee.', 'Refunds are returned to the original payment method where eligible.'] },
      { id: 'cancellations', heading: 'Cancellations', body: ['You may cancel free of charge within the free cancellation window or before a rider is assigned. A late-cancellation fee may apply after a rider is on the way.'] },
      { id: 'prohibited', heading: 'Prohibited items & conduct', body: ['You must not use the services for unlawful purposes.'], list: ['No illegal items, weapons, hazardous materials, cash or live animals.', 'No abusive, discriminatory or unsafe behaviour toward riders, drivers or staff.', 'Riders may decline packages that appear unsafe or misdescribed.'] },
      { id: 'liability', heading: 'Liability', body: ['To the extent permitted by law, our liability for any claim is limited to the amount you paid for the relevant booking. Nothing in these Terms limits liability that cannot be limited by law.'] },
      { id: 'law', heading: 'Governing law', body: ['These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes will first be addressed through our support process before any formal proceedings.'] },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookie Policy',
    short: 'Cookies',
    updated: '2026-11-01',
    summary: `How ${site.name} uses cookies and similar storage technologies on this website, and how you can control them.`,
    sections: [
      { id: 'what', heading: 'What are cookies?', body: ['Cookies are small text files stored on your device by your browser. Similar technologies include local storage, which this website uses to remember your session and demo data.'] },
      { id: 'types', heading: 'How we use them', body: ['We group the technologies we use into the following categories:'], list: ['Strictly necessary — keep you signed in and remember booking progress.', 'Preferences — remember settings such as saved places and notification choices.', 'Analytics — help us understand how pages are used so we can improve them (only with consent).', 'Marketing — measure campaigns (only with consent).'] },
      { id: 'demo-storage', heading: 'Demonstration data', body: ['In this demonstration build, bookings, payments and notifications are stored only in your browser’s local storage. Clearing your browser data removes them.'] },
      { id: 'control', heading: 'Managing cookies', body: ['You can block or delete cookies in your browser settings. Blocking strictly necessary storage may stop parts of the site from working.'] },
      { id: 'contact', heading: 'Contact', body: [`Questions about this policy? Email ${site.contact.email}.`] },
    ],
  },
];

export const findLegalDoc = (slug?: string) => legalDocs.find((d) => d.slug === slug);
