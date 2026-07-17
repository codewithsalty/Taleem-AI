'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { getLevelInfo, type EnrichedUser } from '@/lib/gamification';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from './non-blocking-updates';
import { isEqual } from 'lodash';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: EnrichedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: EnrichedUser | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: EnrichedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { 
  user: EnrichedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
  firestore: Firestore | null; // Pass firestore for listener
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth || !firestore) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth or Firestore service not provided.") });
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null });

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          
          // Check or create user document with contextual error handling
          getDoc(userDocRef)
            .then((docSnap) => {
                if (!docSnap.exists()) {
                    const newUserDoc = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || 'New User',
                        createdAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString(),
                        points: 0,
                        level: 1,
                        streak: 1,
                    };
                    setDocumentNonBlocking(userDocRef, newUserDoc, { merge: true });
                } else {
                    const userData = docSnap.data();
                    const lastLoginDate = userData.lastLogin ? new Date(userData.lastLogin) : null;
                    const now = new Date();
                    
                    if (lastLoginDate && !isSameDay(lastLoginDate, now)) {
                        const yesterday = new Date();
                        yesterday.setDate(now.getDate() - 1);
                        const newStreak = isSameDay(lastLoginDate, yesterday) ? (userData.streak || 0) + 1 : 1;
                        updateDocumentNonBlocking(userDocRef, { lastLogin: now.toISOString(), streak: newStreak });
                    } else if (!lastLoginDate) {
                        updateDocumentNonBlocking(userDocRef, { lastLogin: now.toISOString(), streak: 1 });
                    }
                }
            })
            .catch(async (error) => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
            });

          // Listen for user document changes
          const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              const levelInfo = getLevelInfo(userData.points || 0);
              const enrichedUser: EnrichedUser = {
                ...(firebaseUser as User),
                points: userData.points || 0,
                level: levelInfo.level,
                levelTitle: levelInfo.title,
                progress: levelInfo.progress,
                streak: userData.streak || 0,
              };

              setUserAuthState(prevState => {
                if (isEqual(prevState.user, enrichedUser)) {
                    return prevState;
                }
                return { user: enrichedUser, isUserLoading: false, userError: null };
              });

            } else {
               setUserAuthState({ user: null, isUserLoading: false, userError: null });
            }
          }, async (error) => {
             const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'get',
             });
             errorEmitter.emit('permission-error', permissionError);
             setUserAuthState(prev => ({ ...prev, isUserLoading: false }));
          });
          
          return () => unsubscribeFirestore();

        } else {
          setUserAuthState({ user: null, isUserLoading: false, userError: null });
        }
      }
    );
    return () => unsubscribeAuth();
  }, [auth, firestore]);

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError, firestore } = useFirebase();
  return { user, isUserLoading, userError, firestore };
};