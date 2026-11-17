/* Marketing & editorial content.
   ALL testimonials, names and team members are FICTIONAL demonstration
   content (`demo: true`) and must be replaced before launch. */
import type { FaqItem, TeamMember, Testimonial } from '@/types';

const avatar = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffd5b8,c8dcff,ffe8a3,d7f0e3`;

export const testimonials: Testimonial[] = [
  { id: 't1', name: 'Adaeze O.', location: 'Ifite-Awka · UNIZIK 300L', avatar: avatar('Adaeze'), service: 'Market Pickup', rating: 5, date: '2026-10-28', quote: 'I sent a rider to Eke Awka for fabric I had already paid for. Live updates the whole way and the delivery code made handover at my lodge painless. I did not miss a single lecture.', demo: true },
  { id: 't2', name: 'Tobenna B.', location: 'Temp Site, Awka', avatar: avatar('Tobenna'), service: 'Express Motorcycle', rating: 5, date: '2026-10-19', quote: 'Booked an express bike at 7:40 for an 8:00 exam at UNIZIK. The fare shown upfront was what I paid. The rider even had a spare hairnet.', demo: true },
  { id: 't3', name: 'Mrs. Ifeoma K.', location: 'Okpuno, Awka', avatar: avatar('IfeomaK'), service: 'Scheduled Tricycle', rating: 4, date: '2026-10-11', quote: 'The school-run schedule changed our mornings. Same keke man most days and the kids know him now. I would love more evening slots.', demo: true },
  { id: 't4', name: 'Chinedu E.', location: 'Eke Awka Market', avatar: avatar('Chinedu'), service: 'Business Deliveries', rating: 5, date: '2026-09-30', quote: 'We now send customer orders from our shop at Eke Awka straight to Ifite lodges. Proof-of-delivery photos saved my boys hours every week.', demo: true },
  { id: 't5', name: 'Chioma A.', location: 'Miracle Junction, Ifite', avatar: avatar('ChiomaA'), service: 'Food & Grocery', rating: 5, date: '2026-09-22', quote: 'Foodstuff from Temp Site arrived upright, nothing spilled. The tracking timeline is honestly better than what I get from big online stores.', demo: true },
  { id: 't6', name: 'NAAS UNIZIK Chapter', location: 'UNIZIK Campus', avatar: avatar('Naas'), service: 'Event Shuttle', rating: 5, date: '2026-09-07', quote: 'Two shuttles looping between the main gate and Ekwueme Square for our departmental week. One coordinator, zero stress. The quote came back the same afternoon.', demo: true },
  { id: 't7', name: 'Ifeoma N.', location: 'Yahoo Junction, Ifite', avatar: avatar('Ifeoma'), service: 'Parcel Delivery', rating: 4, date: '2026-08-29', quote: 'I sell perfumes to students and the bulk drop tool is a lifesaver. Ten customers across Ifite, one booking, every buyer got their own code.', demo: true },
  { id: 't8', name: 'Kelechi D.', location: 'Regina Caeli, Awka', avatar: avatar('Kelechi'), service: 'Intercity Shuttle', rating: 5, date: '2026-08-14', quote: 'Five of us going home to Enugu after exams shared one shuttle from Ifite. Cheaper than the park, door to door, and the driver waited for our luggage.', demo: true },
];

export const faqCategories = ['Booking', 'Delivery', 'Payments', 'Cancellations & refunds', 'Partners', 'Support'] as const;

export const faqs: FaqItem[] = [
  { id: 'f0', category: 'Booking', question: 'I’m a UNIZIK student — is there anything for me?', answer: 'Yes. DoorstepGo was built around Ifite and UNIZIK. Use code UNIZIK10 for 10% off rides, schedule lecture-day keke trips from your lodge, send a rider to Eke Awka market, or book a shared shuttle with course mates for excursions and trips home.' },
  { id: 'f1', category: 'Booking', question: 'How do I book a ride?', answer: 'Choose Book a Ride, pick motorcycle, tricycle or shuttle, then enter your pickup city, junction and address, your destination, date, time and passengers. You will see an estimated fare before you confirm. Once confirmed, you get a booking reference and live status updates.' },
  { id: 'f2', category: 'Booking', question: 'How do I book a motorcycle?', answer: 'Go to Services → Motorcycle, compare Standard, Premium, Express, Scheduled and Business options, then tap Book this ride. The 4-step booking flow walks you through route, schedule, review and confirmation. Riders carry a spare helmet for passengers.' },
  { id: 'f3', category: 'Booking', question: 'How do I book a tricycle?', answer: 'Go to Services → Tricycle. Use the comparison table to choose Standard, Premium, Commercial (cargo), Group or Scheduled, then book. Tricycles seat up to three passengers; Group bookings dispatch several tricycles together.' },
  { id: 'f4', category: 'Delivery', question: 'How do I schedule a delivery?', answer: 'Open Schedule a Delivery, choose a category, add sender and recipient details, pickup and drop-off locations, package size and weight, then pick Immediate or Scheduled pickup and Standard or Express speed. Your recipient receives a 4-digit delivery code.' },
  { id: 'f5', category: 'Delivery', question: 'How does market pickup work?', answer: 'Tell us the market name, seller details, stall location and what to collect. Choose whether the goods are already paid for, the rider should collect from a seller, the rider should buy listed items, or you need general assistance. Payment to sellers for goods is arranged separately from your delivery fee — riders never pay sellers on your behalf without a confirmed arrangement.' },
  { id: 'f6', category: 'Delivery', question: 'How do I track a delivery?', answer: 'Use Track a Delivery with your reference (e.g. DSG-DL-XXXX-XXXX). You will see each stage — booking received, rider assigned, heading to pickup, collected, in transit, approaching and delivered — on a timeline with a map view.' },
  { id: 'f7', category: 'Payments', question: 'What payment methods are available?', answer: 'We are designed to accept debit and credit cards, bank transfer, USSD, mobile money, a DoorstepGo wallet and cash on completion. In this demonstration build, payments are simulated and no money is charged.' },
  { id: 'f8', category: 'Cancellations & refunds', question: 'What is the cancellation policy?', answer: 'You can cancel free of charge within 5 minutes of booking, or any time before a rider is assigned. After a rider is on the way, a small late-cancellation fee may apply. Scheduled bookings can be cancelled free up to 1 hour before pickup.' },
  { id: 'f9', category: 'Cancellations & refunds', question: 'How do refunds work?', answer: 'Eligible refunds go back to the original payment method, usually within 3–7 working days depending on your bank. Wallet refunds are instant. You will receive a notification and a refund reference.' },
  { id: 'f10', category: 'Partners', question: 'How do I become a rider or driver?', answer: 'Register your interest through Become a Partner on the About page. You will need a valid licence, vehicle papers and a guarantor. Partner onboarding (including document checks) will be introduced in a later release.' },
  { id: 'f11', category: 'Partners', question: 'How do I become a merchant?', answer: 'Visit Customers → Merchants and complete the business interest form. A business specialist will contact you to set up bulk deliveries, scheduled pickups, multiple locations and monthly invoicing.' },
  { id: 'f12', category: 'Booking', question: 'How do I request a business quote?', answer: 'Use Request a Quote from the header. Choose Business, describe your transportation or logistics needs — staff shuttles, events, recurring deliveries — and our team replies with a tailored quote. You get a reference number immediately.' },
  { id: 'f13', category: 'Support', question: 'How do I contact customer support?', answer: 'Tap the WhatsApp button on any page, call our support line, email support, or use the Contact page form. Signed-in customers can also raise a ticket from the dashboard.' },
  { id: 'f14', category: 'Support', question: 'What if my delivery is missing or delayed?', answer: 'Check the live tracking page first. If the delivery is past its estimated window, report it from your dashboard or via WhatsApp with your reference number. We investigate with the rider immediately and keep you updated until it is resolved.' },
  { id: 'f15', category: 'Booking', question: 'Can I book for someone else?', answer: 'Yes. Add the passenger’s name and phone number in the special instructions, and share the trip link with them so they can follow the ride.' },
  { id: 'f16', category: 'Payments', question: 'Is the fare I see final?', answer: 'Fares shown before booking are estimates based on distance, time, service tier and demand. Your confirmed fare is shown on your receipt. Significant route changes or waiting time can change the final amount.' },
  { id: 'f17', category: 'Delivery', question: 'What items can’t be delivered?', answer: 'We do not carry illegal items, weapons, hazardous chemicals, cash, live animals or items exceeding our size and weight limits. Riders may decline packages that look unsafe.' },
  { id: 'f18', category: 'Booking', question: 'Which areas do you cover?', answer: 'We are launching in Awka, Anambra State — starting with Ifite-Awka and the UNIZIK campus, plus Temp Site / UNIZIK Junction, Okpuno, Aroma, Regina Caeli, Awka town (Eke Awka, Zik’s Avenue), Agu-Awka, Amawbia, Amansea and Mgbakwu. Onitsha, Nnewi and Enugu are coming soon; trips out of Awka are available as shuttles by quote.' },
];

export const team: TeamMember[] = [
  { id: 'tm1', name: 'Amara Okafor', role: 'Chief Executive Officer', bio: 'Former operations lead at a pan-African logistics firm. Obsessed with making every trip predictable.', avatarSeed: 'Amara', skin: '#8d5524', hair: '#1b1b1b', accent: '#ff6a13' },
  { id: 'tm2', name: 'Seun Adebayo', role: 'Chief Technology Officer', bio: 'Built dispatch and routing systems for fintech and mobility start-ups across West Africa.', avatarSeed: 'Seun', skin: '#a0662f', hair: '#111111', accent: '#2f7bff' },
  { id: 'tm3', name: 'Ngozi Eze', role: 'Operations Manager', bio: 'Runs rider onboarding, fleet quality and city launches with a stopwatch and a spreadsheet.', avatarSeed: 'Ngozi', skin: '#6b3e1f', hair: '#2a1a12', accent: '#0f9d58' },
  { id: 'tm4', name: 'Kemi Lawal', role: 'Head of Customer Experience', bio: 'Leads our support desk and makes sure every complaint turns into a better product.', avatarSeed: 'Kemi', skin: '#9a5b2c', hair: '#3b2416', accent: '#e85508' },
  { id: 'tm5', name: 'Ibrahim Musa', role: 'Head of Logistics', bio: 'Designs delivery zones, market pickup playbooks and same-day routing for merchants.', avatarSeed: 'Ibrahim', skin: '#7a4a24', hair: '#0e0e0e', accent: '#1747c9' },
  { id: 'tm6', name: 'Tobi Williams', role: 'Business Development Manager', bio: 'Partners with merchants, schools and corporates to move their people and products.', avatarSeed: 'Tobi', skin: '#b07440', hair: '#20140c', accent: '#ff9a2e' },
  { id: 'tm7', name: 'The Product Crew', role: 'Technology & Product Team', bio: 'Engineers, designers and UNIZIK alumni shipping the platform from Awka.', avatarSeed: 'Crew', skin: '#8a5a33', hair: '#1a1a1a', accent: '#5b8eff' },
];

export const values = [
  { title: 'Reliability', body: 'We show up when we say we will — and tell you early when something changes.', icon: 'ShieldCheck' },
  { title: 'Innovation', body: 'Technology that removes friction from every pickup, ride and drop-off.', icon: 'Sparkles' },
  { title: 'Accessibility', body: 'Fair prices, simple booking and support in the channels people already use.', icon: 'Heart' },
  { title: 'Safety', body: 'Helmets, trip sharing and clear identification designed into every journey.', icon: 'BadgeCheck' },
  { title: 'Customer satisfaction', body: 'Every complaint is a product lesson. We close the loop, every time.', icon: 'Star' },
  { title: 'Transparency', body: 'Estimated fares upfront, itemised receipts and honest status updates.', icon: 'Eye' },
  { title: 'Efficiency', body: 'Smart dispatch and routing so riders earn more and customers wait less.', icon: 'Gauge' },
];

/** Illustrative platform statistics for the demo — not real business figures. */
export const stats = [
  { value: 18000, suffix: '+', label: 'Trips & deliveries (demo)', decimals: 0 },
  { value: 10, suffix: '', label: 'Awka areas covered', decimals: 0 },
  { value: 350, suffix: '+', label: 'Partner riders (demo)', decimals: 0 },
  { value: 4.8, suffix: '★', label: 'Average rating (demo)', decimals: 1 },
];

export const howItWorks = [
  { step: 1, title: 'Choose a service', body: 'Motorcycle, tricycle, shuttle or delivery — pick what fits the trip or the package.', icon: 'LayoutGrid' },
  { step: 2, title: 'Set pickup & destination', body: 'Select city, junction and exact address. Save favourites for one-tap rebooking.', icon: 'MapPin' },
  { step: 3, title: 'See your fare upfront', body: 'A transparent estimate with every charge itemised before you confirm.', icon: 'Receipt' },
  { step: 4, title: 'Track to the doorstep', body: 'Follow your rider live, share your trip and confirm with a delivery code.', icon: 'Navigation' },
];

export const whyUs = [
  { title: 'Doorstep convenience', body: 'No more walking to Miracle or Yahoo Junction to haggle. Your keke or rider comes to your lodge.', icon: 'Home' },
  { title: 'Upfront estimates', body: 'See the itemised fare before booking — no surprises on arrival.', icon: 'Receipt' },
  { title: 'Safety by design', body: 'Rider ID details, trip sharing and an in-app support line on every trip.', icon: 'ShieldCheck' },
  { title: 'One app, many moves', body: 'Rides, shuttles, parcels and market runs in one account and one history.', icon: 'Layers' },
  { title: 'Built for business', body: 'Bulk drops, scheduled logistics and monthly invoicing for merchants.', icon: 'Building2' },
  { title: 'Human support', body: 'Real people on WhatsApp, phone and email during operating hours.', icon: 'Headset' },
];
