import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import { CommanderKeyPair } from '../services/cryptoService';
import { useToast } from './ToastContext';
import { OperationType, handleFirestoreError } from '../services/firestoreErrorHandler';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncSovereignProfile: (keys: CommanderKeyPair) => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  syncSovereignProfile: async () => {},
  isConfigured: false
});

/** Custom hook: useAuth. */
export const useAuth = () => useContext(AuthContext);

/**
 * The AuthProvider function.
 * @param { children } - The { children } parameter.
 * @returns The resulting value.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isFirebaseConfigured();
  const { addToast } = useToast();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isConfigured]);

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      addToast("Firebase is not configured in this environment.", 'error');
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  /**
   * The "Sovereign Handshake"
   * Links the ephemeral Cloud Identity (Firebase) with the Sovereign Identity (Local Keys).
   * This allows the backend to verify that a Manifest uploaded by 'user_123' was actually 
   * signed by the Key Pair that 'user_123' claims to own.
   */
  const syncSovereignProfile = async (keys: CommanderKeyPair) => {
    if (!user || !isConfigured) return;

    const userRef = doc(db, 'users', user.uid);
    
    // We only perform the handshake if it hasn't happened or if keys changed
    // In a production app, we might handle key rotation more strictly.
    try {
      await setDoc(userRef, {
        commanderName: user.displayName || "Anonymous Architect",
        email: user.email,
        sovereignPublicKey: JSON.stringify(keys.publicKey), // Storing PEM/JWK
        lastHandshake: Date.now(),
        keyId: keys.keyId
      }, { merge: true });
    } catch (e) {
      console.error("Failed to sync sovereign profile", e);
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, syncSovereignProfile, isConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};
