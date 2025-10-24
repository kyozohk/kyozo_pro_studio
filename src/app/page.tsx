import Header from '@/components/landing/header';
import HeroSection from '@/components/landing/hero-section';
import FeatureCard from '@/components/landing/feature-card';
import FeaturesSection from '@/components/landing/features-section';
import PricingSection from '@/components/landing/pricing-section';
import ScrollRevealText from '@/components/landing/scroll-reveal-text';
import SlidingCards from '@/components/landing/sliding-cards';
import SlidingCardItem from '@/components/landing/sliding-card-item';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeatureCard />
        <section className="container py-20 md:py-32 text-center">
            <ScrollRevealText text="Where creative minds converge" />
        </section>
        <SlidingCards>
          <SlidingCardItem 
            title="Insider Access"
            text="Experience the creative world through an insider's lens. Kyozo is an eco-system of creative communities - that gives you exclusive access to updates and insights from the creative luminaries driving cultural evolution."
            buttonText="Join the waitlist"
            color="blue"
          />
          <SlidingCardItem 
            title="Community Access"
            text="Join and interact with diverse communities, from niche artistic circles to industry-leading collectives. Engage with passionate individuals who share your creative interests."
            buttonText="Join the waitlist"
            color="green"
          />
          <SlidingCardItem 
            title="Creator Tools"
            text="Are you a creative professional, community organizer, or small business owner working within the creative industries? We understand the challenges of nurturing and growing a dedicated audience, so we built KyozoPro, a comprehensive platform that enhances genuine connections and unlocks new opportunities."
            buttonText="Join the waitlist"
            color="purple"
          />
        </SlidingCards>
        <FeaturesSection />
        <PricingSection />
      </main>
    </div>
  );
}
