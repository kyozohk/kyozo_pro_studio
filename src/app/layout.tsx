import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/firebase/auth-provider';
import FixedFooter from '@/components/landing/footer';
import FirebaseErrorListener from '@/components/firebase-error-listener';

export const metadata: Metadata = {
  title: 'Kyozo',
  description: 'The eco-system for creative luminaries.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.png" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <FirebaseErrorListener />
          {children}
          <FixedFooter />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
