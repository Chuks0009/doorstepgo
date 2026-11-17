import { usePageMeta } from '@/hooks';
import { site } from '@/config/site';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickBookingWidget } from '@/components/home/QuickBookingWidget';
import { CityMarquee } from '@/components/home/CityMarquee';
import { WelcomeSection } from '@/components/home/WelcomeSection';
import { ServicesBento } from '@/components/home/ServicesBento';
import { StudentSection } from '@/components/home/StudentSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { WhyUs } from '@/components/home/WhyUs';
import { SafetyStrip } from '@/components/home/SafetyStrip';
import { FeaturedMotorcycles } from '@/components/home/FeaturedMotorcycles';
import { FeaturedTricycles } from '@/components/home/FeaturedTricycles';
import { ShuttleSection } from '@/components/home/ShuttleSection';
import { DeliverySection } from '@/components/home/DeliverySection';
import { HowToBook } from '@/components/home/HowToBook';
import { CoverageMap } from '@/components/home/CoverageMap';
import { StatsBand } from '@/components/home/StatsBand';
import { TestimonialSlider } from '@/components/home/TestimonialSlider';
import { MerchantSection } from '@/components/home/MerchantSection';
import { FaqPreview } from '@/components/home/FaqPreview';
import { AppBenefits } from '@/components/home/AppBenefits';
import { FinalCta, NewsletterBand } from '@/components/home/ClosingSections';

export default function HomePage() {
  usePageMeta('', `${site.shortPitch} ${site.description}`);
  return (
    <>
      <HeroSection />
      <div className="container-x relative z-20 -mt-40 sm:-mt-44 lg:-mt-52">
        <QuickBookingWidget />
      </div>
      <CityMarquee />
      <WelcomeSection />
      <ServicesBento />
      <StudentSection />
      <HowItWorks />
      <WhyUs />
      <SafetyStrip />
      <FeaturedMotorcycles />
      <FeaturedTricycles />
      <ShuttleSection />
      <DeliverySection />
      <HowToBook />
      <CoverageMap />
      <StatsBand />
      <TestimonialSlider />
      <MerchantSection />
      <FaqPreview />
      <AppBenefits />
      <NewsletterBand />
      <FinalCta />
    </>
  );
}
