import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Freemium',
    price: '$0',
    period: '/ month',
    description: 'For individuals starting their creative journey.',
    features: [
      '1 Community',
      'Up to 100 members',
      'Basic analytics',
      'In-app chat only',
    ],
    isPopular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/ month',
    description: 'For pro members building visionary communities.',
    features: [
      '10 Communities',
      'Up to 10,000 members',
      'Advanced analytics dashboard',
      'Omnichannel communication',
      'Event ticketing with Stripe',
      'AI content moderation',
    ],
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large-scale organizations and cultural institutions.',
    features: [
      'Unlimited Communities & Members',
      'Dedicated support & SLAs',
      'Custom integrations',
      'White-labeling options',
    ],
    isPopular: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#A020F033_1px,transparent_1px)] [background-size:32px_32px]"></div>

      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold font-headline md:text-4xl">Flexible Pricing for Every Creator</h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Choose the plan that fits your community's scale and ambition. Start for free.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'flex flex-col border-border/50 shadow-lg',
                plan.isPopular && 'gradient-border shadow-primary/30'
              )}
            >
              <CardHeader>
                {plan.isPopular && (
                  <div className="text-center">
                    <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full mb-2">POPULAR</span>
                  </div>
                )}
                <CardTitle className="text-2xl font-headline text-center">{plan.name}</CardTitle>
                <CardDescription className="text-center">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-5xl font-bold font-headline">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full font-bold uppercase" variant={plan.isPopular ? 'default' : 'outline'}>
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
