/* Reactive data hooks over the mock API. Components use these; when the
   backend arrives, re-implement them with React Query/SWR — same shapes. */
import { useStore } from './index';
import { KEYS } from '@/services/storage';
import { bookingService, deliveryService, merchantService, notificationService, paymentService, quoteService, supportService } from '@/services/api';

export const useBookings = () => useStore(KEYS.bookings, bookingService.list);
export const useDeliveries = () => useStore(KEYS.deliveries, deliveryService.list);
export const useNotifications = () => useStore(KEYS.notifications, notificationService.list);
export const usePayments = () => useStore(KEYS.payments, paymentService.list);
export const useQuotes = () => useStore(KEYS.quotes, quoteService.list);
export const useMerchants = () => useStore(KEYS.merchants, merchantService.list);
export const useMessages = () => useStore(KEYS.messages, supportService.messages);
export const useUnreadCount = () => useNotifications().filter((n) => !n.read).length;
