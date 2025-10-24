import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline text-white transition-colors hover:text-primary">
       <svg
        width="32"
        height="32"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 34C26.8366 34 34 26.8366 34 18C34 9.16344 26.8366 2 18 2C9.16344 2 2 9.16344 2 18C2 26.8366 9.16344 34 18 34Z"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
        />
        <path
          d="M12.4 20.3c.8.8 1.8 1.2 2.8 1.2s1.9-.4 2.6-1.2c.7-.8 1.1-1.8 1.1-2.8s-.4-1.9-1.1-2.7c-.7-.8-1.7-1.2-2.6-1.2s-2 .4-2.8 1.2c-.8.8-1.2 1.8-1.2 2.8s.4 2 .9 2.8z"
          fill="hsl(var(--primary))"
        />
      </svg>
      <span>Kyozo</span>
    </Link>
  );
}
