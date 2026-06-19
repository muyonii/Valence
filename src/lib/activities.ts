import { collection, addDoc, onSnapshot, query, orderBy, limit, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useState, useEffect } from 'react';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userEmail?: string;
  category: 'ingestion' | 'valuation' | 'auth' | 'risk' | 'manual';
  action: string;
  details: string;
  timestamp: number;
}

const SEED_ACTIVITIES: Omit<ActivityLog, 'id'>[] = [
  {
    category: 'auth',
    action: 'Lead Auditor Cleared',
    details: 'M&A Professional initialized War Room. Security token validated for Project Phoenix.',
    timestamp: Date.now() - 3600000 * 24 * 3, // 3 days ago
    userEmail: 'audit-lead@valence.cap'
  },
  {
    category: 'ingestion',
    action: 'Virtual Data Room Connected',
    details: 'Established secure tunnel to Intralinks VDR. Synchronized 1,482 documents.',
    timestamp: Date.now() - 3600000 * 24 * 2.8,
    userEmail: 'system-agent@valence.cap'
  },
  {
    category: 'ingestion',
    action: 'Documents Triaged & Categorized',
    details: 'Agent 1 (Triager) processed 412 legal contracts, 280 tax filings, and 312 financial ledgers.',
    timestamp: Date.now() - 3600000 * 24 * 2.5,
    userEmail: 'system-agent@valence.cap'
  },
  {
    category: 'risk',
    action: 'ASC 606 Deviation Discovered',
    details: 'Agent 2 (Financial Forensic) flagged $4.2M premature Q3 revenue recognition on Acme Corp contract.',
    timestamp: Date.now() - 3600000 * 24 * 1.5,
    userEmail: 'system-agent@valence.cap'
  },
  {
    category: 'risk',
    action: 'Key-Man Dependency Flagged',
    details: 'Agent 5 (HR Risk) identified critical vulnerability in Core Dev retention with immediate vesting upon sale.',
    timestamp: Date.now() - 3600000 * 24 * 1.2,
    userEmail: 'system-agent@valence.cap'
  },
  {
    category: 'valuation',
    action: 'Implied Enterprise Value Re-Calculated',
    details: 'Adjusted target valuation to $138,000,000 based on compound financial and risk adjustments.',
    timestamp: Date.now() - 3600000 * 18,
    userEmail: 'system-agent@valence.cap'
  }
];

export const addActivity = async (
  category: ActivityLog['category'],
  action: string,
  details: string
) => {
  const path = 'activities';
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, path), {
      userId: user?.uid || 'guest',
      userEmail: user?.email || 'guest@valence.cap',
      category,
      action,
      details,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error adding activity log to audit trail:', error);
    try {
      handleFirestoreError(error, OperationType.CREATE, path);
    } catch (e) {
      // Allow soft fallback after logging
    }
  }
};

export const useActivities = (maxCount = 20) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = 'activities';
    const colRef = collection(db, path);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(maxCount));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial data if Firestore activities collection is deserted
        try {
          const batch = writeBatch(db);
          SEED_ACTIVITIES.forEach((activity) => {
            const docRef = doc(collection(db, path));
            batch.set(docRef, activity);
          });
          await batch.commit();
        } catch (e) {
          console.error('Error seeding activities:', e);
          try {
            handleFirestoreError(e, OperationType.WRITE, path);
          } catch (err) {}
        }
        setLoading(false);
      } else {
        const list: ActivityLog[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as ActivityLog);
        });
        setActivities(list);
        setLoading(false);
      }
    }, (error) => {
      console.error('Snapshot listener failed, checking local fallback:', error);
      // Fallback local simulation in case of Firebase configuration mismatch
      setActivities(SEED_ACTIVITIES.map((act, index) => ({ id: `fallback-${index}`, ...act })));
      setLoading(false);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        // Allow soft fallback after logged in console
      }
    });

    return () => unsubscribe();
  }, [maxCount]);

  return { activities, loading };
};
