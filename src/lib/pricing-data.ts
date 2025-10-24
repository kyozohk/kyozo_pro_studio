import type { PricingCardData } from './types';

export const pricingData: PricingCardData[] = [
  {
    title: 'Freemium',
    subtitle: 'For individuals starting their creative journey.',
    price: '$0',
    priceDescription: '/ month',
    features: [
      '1 Community',
      'Up to 100 members',
      'Basic analytics',
      'In-app chat only',
    ],
    gradient: 'from-blue-500 to-cyan-500',
    subtitleColor: 'text-blue-500',
  },
  {
    title: 'Pro',
    subtitle: 'For pro members building visionary communities.',
    price: '$29',
    priceDescription: '/ month',
    features: [
      '10 Communities',
      'Up to 10,000 members',
      'Advanced analytics dashboard',
      'Omnichannel communication',
      'Event ticketing with Stripe',
      'AI content moderation',
    ],
    gradient: 'from-purple-500 to-pink-500',
    subtitleColor: 'text-purple-500',
  },
  {
    title: 'Enterprise',
    subtitle: 'For large-scale organizations and cultural institutions.',
    price: 'Custom',
    priceDescription: '',
    features: [
      'Unlimited Communities & Members',
      'Dedicated support & SLAs',
      'Custom integrations',
      'White-labeling options',
    ],
    gradient: 'from-amber-500 to-orange-500',
    subtitleColor: 'text-amber-500',
  },
];
