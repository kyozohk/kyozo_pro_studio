'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// As per the schema, this represents the structure of a community document.
interface Community {
  id: string;
  name: string;
  description: string;
  memberCount?: number;
  profile?: {
    bannerUrl?: string;
  };
}

// As per the schema, this represents the structure of the user document.
interface UserDoc {
  tenants?: string[];
}

export function useDashboardData() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [data, setData] = useState<{ communities: Community[] }>({ communities: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const userDocRef = collection(firestore, 'users');
        const userQuery = query(userDocRef, where('userId', '==', user.uid));
        const userDocSnap = await getDocs(userQuery);

        if (userDocSnap.empty) {
          setData({ communities: [] });
          setLoading(false);
          return;
        }

        const userData = userDocSnap.docs[0].data() as UserDoc;
        const tenantIds = userData.tenants || [];

        if (tenantIds.length === 0) {
          setData({ communities: [] });
          setLoading(false);
          return;
        }

        const communities: Community[] = [];
        for (const tenantId of tenantIds) {
          const communitiesRef = collection(firestore, 'tenants', tenantId, 'communities');
          const communitiesSnap = await getDocs(communitiesRef);
          communitiesSnap.forEach(doc => {
            communities.push({ id: doc.id, ...doc.data() } as Community);
          });
        }
        
        setData({ communities });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Optionally set an error state here
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, firestore]);

  return { data, loading };
}
