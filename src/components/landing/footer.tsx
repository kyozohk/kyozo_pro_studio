import { Logo } from "./logo";

export default function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kyozo. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
            <Logo />
        </div>
      </div>
    </footer>
  );
}
