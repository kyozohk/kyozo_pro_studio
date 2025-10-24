'use client';
import Header from '@/components/landing/header';
import HeroSection from '@/components/landing/hero-section';
import FeatureCard from '@/components/landing/feature-card';
import ScrollRevealText from '@/components/landing/scroll-reveal-text';
import SlidingCards from '@/components/landing/sliding-cards';
import SlidingCardItem from '@/components/landing/sliding-card-item';
import Toolkit from '@/components/landing/toolkit';
import Marquee from '@/components/landing/marquee';
import PricingSection from '@/components/landing/pricing-section';

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
        <Toolkit />
        <Marquee 
          categories={[
            {
              category: 'music',
              items: [
                { text: 'Rediscovering your creative passion' },
                { text: 'Prompts to Turbocharge Your Creative Process' },
                { text: 'BPM heartrate and running' },
                { text: 'The creative paradox' },
              ]
            },
            {
                category: 'artMovements',
                items: [
                  { text: 'Exploring Abstract Expressionism' },
                  { text: 'The Impact of Surrealism on Modern Art' },
                  { text: 'Understanding the Bauhaus Movement' },
                  { text: 'Pop Art and Consumer Culture' },
                ]
            },
            {
                category: 'fashion',
                items: [
                  { text: 'Sustainable Fashion Trends' },
                  { text: 'The History of Streetwear' },
                  { text: 'Vintage Fashion Revival' },
                  { text: 'The Art of Accessorizing' },
                ]
            }       
          ]}
        />
        <PricingSection />
      </main>
    </div>
  );
}
