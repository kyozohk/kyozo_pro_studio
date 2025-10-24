import Link from 'next/link';
import { Logo } from '@/components/landing/logo';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Logo />
        <nav className="ml-auto flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link href="/moderation">Moderation Tool</Link>
          </Button>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Login with Google
          </Button>
        </nav>
      </div>
    </header>
  );
}
