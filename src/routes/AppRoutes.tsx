import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { PageLoader } from '@/components/layout/PageLoader';

const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));

/* Public */
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const ServicesOverview = lazy(() => import('@/pages/services/ServicesOverview'));
const Motorcycle = lazy(() => import('@/pages/services/Motorcycle'));
const Tricycle = lazy(() => import('@/pages/services/Tricycle'));
const Shuttle = lazy(() => import('@/pages/services/Shuttle'));
const DeliveryServices = lazy(() => import('@/pages/services/DeliveryServices'));
const RideBooking = lazy(() => import('@/pages/booking/RideBooking'));
const DeliveryBooking = lazy(() => import('@/pages/booking/DeliveryBooking'));
const Checkout = lazy(() => import('@/pages/booking/Checkout'));
const RequestQuote = lazy(() => import('@/pages/RequestQuote'));
const Customers = lazy(() => import('@/pages/customers/Customers'));
const Riders = lazy(() => import('@/pages/customers/Riders'));
const Merchants = lazy(() => import('@/pages/customers/Merchants'));
const Contact = lazy(() => import('@/pages/Contact'));
const Faq = lazy(() => import('@/pages/Faq'));
const TrackBooking = lazy(() => import('@/pages/tracking/TrackBooking'));
const TrackDelivery = lazy(() => import('@/pages/tracking/TrackDelivery'));
const Legal = lazy(() => import('@/pages/Legal'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/* Auth */
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));

/* Customer dashboard */
const DashOverview = lazy(() => import('@/pages/dashboard/Overview'));
const DashBookings = lazy(() => import('@/pages/dashboard/Bookings'));
const DashBookingDetail = lazy(() => import('@/pages/dashboard/BookingDetail'));
const DashDeliveries = lazy(() => import('@/pages/dashboard/Deliveries'));
const DashDeliveryDetail = lazy(() => import('@/pages/dashboard/DeliveryDetail'));
const DashPayments = lazy(() => import('@/pages/dashboard/Payments'));
const DashNotifications = lazy(() => import('@/pages/dashboard/Notifications'));
const DashAddresses = lazy(() => import('@/pages/dashboard/Addresses'));
const DashRewards = lazy(() => import('@/pages/dashboard/Rewards'));
const DashSupport = lazy(() => import('@/pages/dashboard/Support'));
const DashProfile = lazy(() => import('@/pages/dashboard/Profile'));

/* Admin console */
const AdminOverview = lazy(() => import('@/pages/admin/Overview'));
const AdminBookings = lazy(() => import('@/pages/admin/Bookings'));
const AdminDispatch = lazy(() => import('@/pages/admin/Dispatch'));
const AdminQuotes = lazy(() => import('@/pages/admin/Quotes'));
const AdminMerchants = lazy(() => import('@/pages/admin/Merchants'));
const AdminFleet = lazy(() => import('@/pages/admin/Fleet'));
const AdminSupport = lazy(() => import('@/pages/admin/Support'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<ServicesOverview />} />
          <Route path="services/motorcycle" element={<Motorcycle />} />
          <Route path="services/tricycle" element={<Tricycle />} />
          <Route path="services/shuttle" element={<Shuttle />} />
          <Route path="services/delivery" element={<DeliveryServices />} />
          <Route path="booking" element={<RideBooking />} />
          <Route path="delivery" element={<DeliveryBooking />} />
          <Route path="checkout/:reference" element={<Checkout />} />
          <Route path="request-quote" element={<RequestQuote />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/riders" element={<Riders />} />
          <Route path="customers/merchants" element={<Merchants />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="track-booking" element={<TrackBooking />} />
          <Route path="track-delivery" element={<TrackDelivery />} />
          <Route path="legal/:doc" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashOverview />} />
          <Route path="bookings" element={<DashBookings />} />
          <Route path="bookings/:id" element={<DashBookingDetail />} />
          <Route path="deliveries" element={<DashDeliveries />} />
          <Route path="deliveries/:id" element={<DashDeliveryDetail />} />
          <Route path="payments" element={<DashPayments />} />
          <Route path="notifications" element={<DashNotifications />} />
          <Route path="addresses" element={<DashAddresses />} />
          <Route path="rewards" element={<DashRewards />} />
          <Route path="support" element={<DashSupport />} />
          <Route path="profile" element={<DashProfile />} />
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="dispatch" element={<AdminDispatch />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="merchants" element={<AdminMerchants />} />
          <Route path="fleet" element={<AdminFleet />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
