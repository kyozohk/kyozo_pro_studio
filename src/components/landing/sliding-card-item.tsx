'use client';
import React from 'react';
import styles from './SlidingCards.module.css';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface SlidingCardItemProps {
  title: string;
  text: string;
  buttonText: string;
  color: 'blue' | 'green' | 'purple' | 'rose';
}

const SlidingCardItem: React.FC<SlidingCardItemProps> = ({ 
  title, 
  text, 
  buttonText,
  color
}) => {
  return (
    <div className={cn(styles.card, styles[color])}>
      <div className={styles.cardContent}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <p className={styles.cardText}>{text}</p>
        <Button variant="outline" size="lg">{buttonText}</Button>
      </div>
    </div>
  );
};

export default SlidingCardItem;
