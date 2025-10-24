'use client';

import { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query, type Firestore, type DocumentData } from 'firebase/firestore';
import { oldFirebaseConfig } from '@/firebase/old-config';
import { Loader2, Database, Folder, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Schema = {
  [collectionName: string]: string[];
};

export default function MigratePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if(!user) return;

    const fetchSchema = async () => {
      try {
        let oldApp: FirebaseApp;
        const oldAppName = 'oldDB';
        if (!getApps().find(app => app.name === oldAppName)) {
          oldApp = initializeApp(oldFirebaseConfig, oldAppName);
        } else {
          oldApp = getApp(oldAppName);
        }
        const oldFirestore = getFirestore(oldApp);

        // IMPORTANT: Firestore's web SDK does not support listing collections directly.
        // In a real-world migration, you would need to know the names of the collections you want to migrate.
        // We are using a predefined list here for demonstration purposes.
        const collectionsToInspect = ['members', 'communities', 'events']; 
        
        const schemaData: Schema = {};

        for (const collectionName of collectionsToInspect) {
          const collectionRef = collection(oldFirestore, collectionName);
          const q = query(collectionRef, limit(1));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            schemaData[collectionName] = Object.keys(docData);
          } else {
            schemaData[collectionName] = [];
          }
        }
        setSchema(schemaData);
      } catch (e: any) {
        console.error("Failed to fetch old schema:", e);
        setError("Could not connect to the old database. Please check the configuration and security rules.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, [user]);

  if (userLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading schema from old database...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h1 className="font-headline text-4xl font-bold">Database Migration</h1>
                <p className="mt-4 text-muted-foreground">
                    Inspecting the schema from <code className="bg-muted px-2 py-1 rounded-md font-mono text-sm">kyozo-pro-webflow-fb6cc</code>. Below are the collections and their fields found in the first document of each.
                </p>
            </div>
            
            <Alert variant="destructive" className="max-w-4xl mx-auto mb-8 bg-amber-500/10 border-amber-500/50 text-amber-500 [&>svg]:text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Firestore SDK Limitation</AlertTitle>
              <AlertDescription>
                The Firestore web SDK cannot automatically list all collections. The collections below are common examples. To inspect other collections, you would need to manually add their names to the `collectionsToInspect` array in the code.
              </AlertDescription>
            </Alert>
            
            {error && <p className="text-destructive text-center">{error}</p>}

            {schema && !error && (
                 <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database />
                            Firestore Schema
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {Object.entries(schema).map(([collectionName, fields]) => (
                                <div key={collectionName}>
                                    <h3 className="font-semibold text-lg flex items-center gap-2"><Folder /> {collectionName}</h3>
                                    {fields.length > 0 ? (
                                        <ul className="mt-2 ml-8 space-y-1 list-disc list-inside bg-muted/50 p-4 rounded-md">
                                            {fields.map(field => <li key={field} className="font-mono text-sm flex items-center gap-2"><FileText size={16}/>{field}</li>)}
                                        </ul>
                                    ) : (
                                        <p className="ml-8 mt-2 text-muted-foreground text-sm">No documents found or collection is empty.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <Button disabled>Proceed to Data Mapping (Next Step)</Button>
                        </div>
                    </CardContent>
                 </Card>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
