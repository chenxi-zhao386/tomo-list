import React, { useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useStore, TaskRecord } from '../store';

export function FirebaseSync({ children }: { children: React.ReactNode }) {
  const { user, setUser, setRecords, setSettings, setUnlockedAchievements, settings, unlockedAchievements, records } = useStore();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [setUser]);

  // Sync from Firebase
  useEffect(() => {
    if (!isAuthReady) return;

    if (user) {
      setIsSyncing(true);
      // Listen to User Profile (Settings & Achievements)
      const userRef = doc(db, 'users', user.uid);
      const unsubUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.settings) setSettings(data.settings);
          if (data.unlockedAchievements) setUnlockedAchievements(data.unlockedAchievements);
        } else {
          // Initialize user document
          setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            settings,
            unlockedAchievements,
            createdAt: Date.now()
          }).catch(console.error);
        }
      });

      // Listen to Records
      const recordsRef = collection(db, 'records');
      const q = query(recordsRef, where('uid', '==', user.uid));
      const unsubRecords = onSnapshot(q, (snapshot) => {
        const fetchedRecords: TaskRecord[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedRecords.push({
            id: doc.id,
            name: data.name,
            mode: data.mode,
            duration: data.duration,
            startTime: data.startTime,
            endTime: data.endTime,
            pomodorosCompleted: data.pomodorosCompleted,
            priority: data.priority || 'None'
          });
        });
        setRecords(fetchedRecords);
        setIsSyncing(false);
      });

      return () => {
        unsubUser();
        unsubRecords();
      };
    } else {
      setIsSyncing(false);
    }
  }, [user, isAuthReady]);

  // We don't automatically sync local changes UP to Firebase here to avoid infinite loops with onSnapshot.
  // Instead, we'll intercept the store actions or just update Firebase directly when actions occur.
  // Let's modify the store to update Firebase, or do it here by comparing.
  // Actually, it's better to update Firebase directly in the UI components or wrap the store actions.

  return <>{children}</>;
}

// Helper to handle Firestore errors
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
