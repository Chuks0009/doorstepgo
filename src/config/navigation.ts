import type { NavLink } from '@/types';

export const servicesMenu: NavLink[] = [
  { label: 'Motorcycle Services', to: '/services/motorcycle', description: 'Standard, premium & express bike rides', icon: 'Bike' },
  { label: 'Tricycle Services', to: '/services/tricycle', description: 'Covered keke, group & cargo trips', icon: 'CarTaxiFront' },
  { label: 'Shuttle Services', to: '/services/shuttle', description: 'Vans, airport runs, events & intercity', icon: 'Bus' },
  { label: 'Delivery & Logistics', to: '/services/delivery', description: 'Parcels, market pickup, same-day', icon: 'Package' },
  { label: 'Business Transportation', to: '/request-quote?type=business', description: 'Staff movement & scheduled logistics', icon: 'Briefcase', badge: 'Quote' },
];

export const customersMenu: NavLink[] = [
  { label: 'Individual Riders', to: '/customers/riders', description: 'Everyday rides, saved places, rewards', icon: 'Users' },
  { label: 'Merchants', to: '/customers/merchants', description: 'Bulk & scheduled deliveries for sellers', icon: 'Store' },
  { label: 'Business Customers', to: '/customers#business', description: 'Corporate accounts & invoicing', icon: 'Building2' },
  { label: 'Customer Support', to: '/contact', description: 'WhatsApp, phone, email & FAQs', icon: 'Headset' },
];

export const footerNav = {
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Our Team', to: '/about#team' },
    { label: 'Careers', to: '/about#careers' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Our Mission', to: '/about#mission' },
  ],
  Services: [
    { label: 'Motorcycle Services', to: '/services/motorcycle' },
    { label: 'Tricycle Services', to: '/services/tricycle' },
    { label: 'Shuttle Services', to: '/services/shuttle' },
    { label: 'Delivery Services', to: '/services/delivery' },
    { label: 'Business Logistics', to: '/request-quote?type=business' },
  ],
  Customers: [
    { label: 'Individual Customers', to: '/customers/riders' },
    { label: 'Merchants', to: '/customers/merchants' },
    { label: 'Business Customers', to: '/customers#business' },
    { label: 'Customer Support', to: '/contact' },
  ],
  'Useful Links': [
    { label: 'Book a Ride', to: '/booking' },
    { label: 'Schedule a Delivery', to: '/delivery' },
    { label: 'Track Booking', to: '/track-booking' },
    { label: 'Request a Quote', to: '/request-quote' },
    { label: 'FAQs', to: '/faq' },
  ],
} satisfies Record<string, NavLink[]>;

export const legalLinks: NavLink[] = [
  { label: 'Privacy Policy', to: '/legal/privacy' },
  { label: 'Terms & Conditions', to: '/legal/terms' },
  { label: 'Cookie Policy', to: '/legal/cookies' },
];
