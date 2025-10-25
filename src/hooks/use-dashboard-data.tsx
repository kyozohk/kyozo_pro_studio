
'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';

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

  const fetchData = useCallback(async () => {
    if (!user || !firestore) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // It's possible the user doc doesn't exist yet for a new user
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);


      if (!userDocSnap.exists()) {
        setData({ communities: [] });
        setLoading(false);
        return;
      }

      const userData = userDocSnap.data() as UserDoc;
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
    } finally {
      setLoading(false);
    }
  }, [user, firestore]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCommunity = (newCommunity: Community) => {
    setData(prevData => ({
      communities: [...prevData.communities, newCommunity]
    }));
  }

  return { data, loading, refetch: fetchData, addCommunity };
}
