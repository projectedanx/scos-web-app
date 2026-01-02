
import { db } from './firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { SovereignAgentManifest } from '../types';

export const migrateVaultToFirestore = async (userId: string, vault: SovereignAgentManifest[]) => {
  if (!userId || vault.length === 0) return;

  const batch = writeBatch(db);
  const manifestsRef = collection(db, 'users', userId, 'manifests');

  vault.forEach((agent) => {
    // Create a safe ID from the agent name or timestamp
    const agentId = agent.identity.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now();
    const docRef = doc(manifestsRef, agentId);
    batch.set(docRef, agent);
  });

  try {
    await batch.commit();
    console.log(`Successfully migrated ${vault.length} agents to Firestore.`);
    return true;
  } catch (error) {
    console.error("Error migrating vault to Firestore:", error);
    return false;
  }
};
