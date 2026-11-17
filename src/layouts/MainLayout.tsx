import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { PageLoader } from '@/components/layout/PageLoader';
import { useScrollToTop } from '@/hooks';

/** Public site shell: header + animated page outlet + footer + WhatsApp support. */
export default function MainLayout() {
  useScrollToTop();
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      {/* Pull content under the transparent sticky header; every page starts with a dark hero. */}
      <main id="main" tabIndex={-1} className="-mt-[72px] flex-1 outline-none">
        <Suspense fallback={<PageLoader />}>
          <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
