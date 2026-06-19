import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, getDocs, doc, setDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface WarRoomSession {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  lastActiveAt: number;
  analysisData?: any; // Stores the AI structured data from n8n documents
}

interface SessionContextType {
  activeSession: WarRoomSession | null;
  sessions: WarRoomSession[];
  loading: boolean;
  createSession: (name?: string) => Promise<WarRoomSession>;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionAnalysis: (sessionId: string, data: any) => Promise<void>;
  ingestionLogs: string[];
  isIngesting: boolean;
  setIngestionLogs: React.Dispatch<React.SetStateAction<string[]>>;
  setIsIngesting: React.Dispatch<React.SetStateAction<boolean>>;
}

const SessionContext = createContext<SessionContextType>({
  activeSession: null,
  sessions: [],
  loading: true,
  createSession: async () => ({ id: '', userId: '', name: '', createdAt: 0, lastActiveAt: 0 }),
  switchSession: () => {},
  deleteSession: async () => {},
  updateSessionAnalysis: async () => {},
  ingestionLogs: [],
  isIngesting: false,
  setIngestionLogs: () => {},
  setIsIngesting: () => {},
});

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => localStorage.getItem('valence_active_session'));
  const [sessions, setSessions] = useState<WarRoomSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingestionLogs, setIngestionLogs] = useState<string[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);

  // Load sessions for the current user (or guest fallback)
  useEffect(() => {
    // If not authenticated, we could just rely on local state but let's wait for auth state.
    // Auth context handles auth changes. We can just query.
    const userId = auth.currentUser?.uid || 'guest';
    const q = query(collection(db, 'sessions'), orderBy('lastActiveAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedSessions: WarRoomSession[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<WarRoomSession, 'id'>;
        // Basic filtering to current user if auth is used, or all guest sessions
        if (data.userId === userId || (!auth.currentUser && data.userId === 'guest')) {
          loadedSessions.push({ id: docSnap.id, ...data });
        }
      });
      setSessions(loadedSessions);
      setLoading(false);

      if (loadedSessions.length > 0) {
        if (!activeSessionId || !loadedSessions.find(s => s.id === activeSessionId)) {
          setActiveSessionId(loadedSessions[0].id);
          localStorage.setItem('valence_active_session', loadedSessions[0].id);
        }
      } else {
        if (activeSessionId) {
          setActiveSessionId(null);
          localStorage.removeItem('valence_active_session');
        }
      }
    }, (error) => {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  // Update active session locally
  const switchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    localStorage.setItem('valence_active_session', sessionId);
    
    // Update lastActiveAt in firestore
    const sessionDoc = doc(db, 'sessions', sessionId);
    updateDoc(sessionDoc, {
      lastActiveAt: Date.now()
    }).catch(e => console.error("Could not update session activity", e));
  };

  const createSession = async (name?: string) => {
    const userId = auth.currentUser?.uid || 'guest';
    const now = Date.now();
    const sessionName = name || `Session - ${new Date().toLocaleString()}`;
    const newSessionData: Omit<WarRoomSession, 'id'> = {
      userId,
      name: sessionName,
      createdAt: now,
      lastActiveAt: now,
    };
    
    try {
      const docRef = await addDoc(collection(db, 'sessions'), newSessionData);
      switchSession(docRef.id);
      return { id: docRef.id, ...newSessionData };
    } catch (e) {
      console.error("Error creating session:", e);
      throw e;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await deleteDoc(doc(db, 'sessions', sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        localStorage.removeItem('valence_active_session');
      }
    } catch (e) {
      console.error("Error deleting session:", e);
      throw e;
    }
  };

  const updateSessionAnalysis = async (sessionId: string, data: any) => {
    try {
      const sessionDoc = doc(db, 'sessions', sessionId);
      await updateDoc(sessionDoc, {
        analysisData: data,
        lastActiveAt: Date.now()
      });
    } catch (e) {
      console.error("Error updating session analysis:", e);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return (
    <SessionContext.Provider value={{ 
      activeSession, sessions, loading, createSession, switchSession, deleteSession, updateSessionAnalysis,
      ingestionLogs, isIngesting, setIngestionLogs, setIsIngesting
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessions = () => useContext(SessionContext);
