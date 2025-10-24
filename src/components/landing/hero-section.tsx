import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { WaitlistForm } from './waitlist-form';
import { cn } from '@/lib/utils';

const images = PlaceHolderImages.filter(img => img.id.startsWith('hero-'));

const ImageCard = ({ id, className, width, height }: { id: string; className?: string; width: number; height: number; }) => {
  const image = images.find(img => img.id === id);
  if (!image) return null;
  return (
    <div className={cn("relative overflow-hidden rounded-2xl shadow-lg", className)}>
      <Image
        src={image.imageUrl}
        alt={image.description}
        width={width}
        height={height}
        className="object-cover w-full h-full"
        data-ai-hint={image.imageHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}


export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(160,32,240,0.3),rgba(255,255,255,0))]"></div>
      </div>
      <div className="container relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20 md:py-32">
        <div className="text-center lg:text-left">
          <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl tracking-tighter">
            The Eco-system for <br />
            <span className="text-primary">Creative Luminaries</span>
          </h1>
          <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-muted-foreground">
            Discover exclusive content, manage visionary communities, and engage your audience like never before. Kyozo is where creativity thrives.
          </p>
        </div>
        <div>
          <WaitlistForm />
        </div>
      </div>
       <div className="relative container pb-20 md:pb-32">
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto h-[400px]">
          <ImageCard id="hero-2" className="col-span-1 row-span-2" width={600} height={800} />
          <ImageCard id="hero-1" className="col-span-1 row-span-1" width={800} height={600} />
          <ImageCard id="hero-3" className="col-span-1 row-span-1" width={700} height={700} />
          <ImageCard id="hero-4" className="col-span-2 row-span-2 md:row-span-1 md:col-span-2" width={800} height={800} />
        </div>
      </div>
    </section>
  );
}
