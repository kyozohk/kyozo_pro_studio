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
            <h2 className="text-3xl font-bold font-headline md:text-4xl text-primary">This is Kyozo</h2>
            <ScrollRevealText text="The eco-system for creative luminaries" />
        </section>
        <SlidingCards>
          <SlidingCardItem 
            title="Build Your World"
            text="Create vibrant, multi-faceted communities tailored to your vision."
            buttonText="Explore Features"
            color="blue"
          />
          <SlidingCardItem 
            title="Engage & Inspire"
            text="Connect with your members through omnichannel communication tools."
            buttonText="Learn More"
            color="green"
          />
          <SlidingCardItem 
            title="Host & Monetize"
            text="Seamlessly manage events and ticketing with integrated payment solutions."
            buttonText="See Pricing"
            color="purple"
          />
           <SlidingCardItem 
            title="Secure & Moderate"
            text="Keep your community safe with powerful, AI-driven content moderation."
            buttonText="Request a Demo"
            color="rose"
          />
        </SlidingCards>
        <FeaturesSection />
        <PricingSection />
      </main>
    </div>
  );
}
