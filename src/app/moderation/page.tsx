import ModerationTool from '@/components/moderation-tool';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';

export default function ModerationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-20 md:py-32">
            <div className="max-w-2xl mx-auto text-center mb-12">
                <h1 className="font-headline text-4xl font-bold">Community Content Moderation</h1>
                <p className="mt-4 text-muted-foreground">
                    Test our AI-powered moderation tool. Enter some text below to see if it's flagged as toxic. This demonstrates how Kyozo helps keep communities safe.
                </p>
            </div>
            <ModerationTool />
        </div>
      </main>
      <Footer />
    </div>
  );
}
