import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="text-2xl font-bold font-headline text-white transition-colors hover:text-primary">
      Kyozo
    </Link>
  );
}
