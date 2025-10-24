'use client';

import React from 'react';
import { pricingData } from '@/lib/pricing-data';
import PricingCard from '@/components/ui/pricing-card';
import styles from './PricingSection.module.css';
import { Button } from "@/components/ui/button";

const PricingSection = () => {
  return (
    <section className={styles.pricingSection}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2>Flexible Pricing for Every Creator</h2>
          <p>
            Choose the plan that fits your community's scale and ambition. Start for free.
          </p>
        </div>
        <div className={styles.pricingGrid}>
          {pricingData.map((data) => (
            <div key={data.title} className={styles.pricingCardWrapper}>
              <PricingCard 
                {...data} 
                features={data.features}
              />
            </div>
          ))}
        </div>
        <Button variant="outline" asChild>
          <a href="#">Join the waitlist</a>
        </Button>
      </div>
    </section>
  );
};

export default PricingSection;
