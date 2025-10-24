import Header from '@/components/landing/header';
import HeroSection from '@/components/landing/hero-section';
import FeatureCard from '@/components/landing/feature-card';
import FeaturesSection from '@/components/landing/features-section';
import PricingSection from '@/components/landing/pricing-section';
import ScrollRevealText from '@/components/landing/scroll-reveal-text';

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
        <FeaturesSection />
        <PricingSection />
      </main>
    </div>
  );
}
