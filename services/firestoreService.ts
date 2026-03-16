
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  writeBatch,
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { 
  SovereignAgentManifest, 
  ContextCapsule, 
  SovereignPrompt, 
  CognitiveContract,
  ProvenanceIndexEntry
} from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  const err = new Error(JSON.stringify(errInfo));
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  window.dispatchEvent(new CustomEvent('firestore-error', { detail: err }));
  throw err;
}

const USERS_COLLECTION = 'users';

// --- Helper to get refs ---
const getUserRef = (uid: string) => doc(db, USERS_COLLECTION, uid);
const getCollectionRef = (uid: string, sub: string) => collection(db, USERS_COLLECTION, uid, sub);

export const saveItemsToCloudBatch = async <T extends { id?: string }>(
  uid: string,
  collectionName: string,
  items: T[],
  getId: (item: T) => string
) => {
  if (items.length === 0) return;

  try {
    // Firestore limit is 500 writes per batch
    const CHUNK_SIZE = 500;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      const colRef = getCollectionRef(uid, collectionName);

      chunk.forEach(item => {
        const id = getId(item);
        const docRef = doc(colRef, id);
        batch.set(docRef, item);
      });

      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/${collectionName}/batch`);
  }
};


// --- AGENTS ---
export const syncAgents = (uid: string, onUpdate: (data: SovereignAgentManifest[]) => void) => {
  const q = query(getCollectionRef(uid, 'manifests'));
  return onSnapshot(q, (snapshot) => {
    const agents = snapshot.docs.map(d => d.data() as SovereignAgentManifest);
    onUpdate(agents);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/manifests`);
  });
};

export const saveAgentsToCloudBatch = async (uid: string, agents: SovereignAgentManifest[]) => {
  await saveItemsToCloudBatch(uid, 'manifests', agents, a => a.identity.name.toLowerCase().replace(/\s+/g, '-'));
};

export const saveAgentToCloud = async (uid: string, agent: SovereignAgentManifest) => {
  // Use name as ID for simplicity in this version, or generate a UUID
  const agentId = agent.identity.name.toLowerCase().replace(/\s+/g, '-');
  try {
    await setDoc(doc(getCollectionRef(uid, 'manifests'), agentId), agent);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/manifests/${agentId}`);
  }
};

export const deleteAgentFromCloud = async (uid: string, agent: SovereignAgentManifest) => {
  const agentId = agent.identity.name.toLowerCase().replace(/\s+/g, '-');
  try {
    await deleteDoc(doc(getCollectionRef(uid, 'manifests'), agentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/manifests/${agentId}`);
  }
};

// --- CAPSULES ---
export const syncCapsules = (uid: string, onUpdate: (data: ContextCapsule[]) => void) => {
  const q = query(getCollectionRef(uid, 'capsules'));
  return onSnapshot(q, (snapshot) => {
    const capsules = snapshot.docs.map(d => d.data() as ContextCapsule);
    onUpdate(capsules);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/capsules`);
  });
};

export const saveCapsulesToCloudBatch = async (uid: string, capsules: ContextCapsule[]) => {
  await saveItemsToCloudBatch(uid, 'capsules', capsules, c => c.meta.id);
};

export const saveCapsuleToCloud = async (uid: string, capsule: ContextCapsule) => {
  try {
    await setDoc(doc(getCollectionRef(uid, 'capsules'), capsule.meta.id), capsule);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/capsules/${capsule.meta.id}`);
  }
};

export const deleteCapsuleFromCloud = async (uid: string, capsuleId: string) => {
  try {
    await deleteDoc(doc(getCollectionRef(uid, 'capsules'), capsuleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/capsules/${capsuleId}`);
  }
};

// --- PROMPTS ---
export const syncPrompts = (uid: string, onUpdate: (data: SovereignPrompt[]) => void) => {
  const q = query(getCollectionRef(uid, 'prompts'));
  return onSnapshot(q, (snapshot) => {
    const prompts = snapshot.docs.map(d => d.data() as SovereignPrompt);
    onUpdate(prompts);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/prompts`);
  });
};

export const savePromptsToCloudBatch = async (uid: string, prompts: SovereignPrompt[]) => {
  await saveItemsToCloudBatch(uid, 'prompts', prompts, p => p.id);
};

export const savePromptToCloud = async (uid: string, prompt: SovereignPrompt) => {
  try {
    await setDoc(doc(getCollectionRef(uid, 'prompts'), prompt.id), prompt);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/prompts/${prompt.id}`);
  }
};

export const deletePromptFromCloud = async (uid: string, promptId: string) => {
  try {
    await deleteDoc(doc(getCollectionRef(uid, 'prompts'), promptId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/prompts/${promptId}`);
  }
};

// --- CONTRACTS ---
export const syncContracts = (uid: string, onUpdate: (data: CognitiveContract[]) => void) => {
  const q = query(getCollectionRef(uid, 'contracts'));
  return onSnapshot(q, (snapshot) => {
    const contracts = snapshot.docs.map(d => d.data() as CognitiveContract);
    onUpdate(contracts);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/contracts`);
  });
};

export const saveContractsToCloudBatch = async (uid: string, contracts: CognitiveContract[]) => {
  await saveItemsToCloudBatch(uid, 'contracts', contracts, c => c.id);
};

export const saveContractToCloud = async (uid: string, contract: CognitiveContract) => {
  try {
    await setDoc(doc(getCollectionRef(uid, 'contracts'), contract.id), contract);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/contracts/${contract.id}`);
  }
};

export const deleteContractFromCloud = async (uid: string, contractId: string) => {
  try {
    await deleteDoc(doc(getCollectionRef(uid, 'contracts'), contractId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/contracts/${contractId}`);
  }
};

// --- PROVENANCE ---
export const saveProvenanceToCloudBatch = async (uid: string, entries: ProvenanceIndexEntry[]) => {
  await saveItemsToCloudBatch(uid, 'provenance', entries, e => `${e.timestamp}-${e.hash.substring(0,8)}`);
};

export const saveProvenanceToCloud = async (uid: string, entry: ProvenanceIndexEntry) => {
  // We use a separate subcollection for the provenance log
  const id = `${entry.timestamp}-${entry.hash.substring(0,8)}`;
  try {
    await setDoc(doc(getCollectionRef(uid, 'provenance'), id), entry);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/provenance/${id}`);
  }
};

export const syncProvenance = (uid: string, onUpdate: (data: ProvenanceIndexEntry[]) => void) => {
  // Limit to recent 100 for dashboard performance
  const q = query(getCollectionRef(uid, 'provenance'), orderBy('timestamp', 'desc')); 
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(d => d.data() as ProvenanceIndexEntry);
    onUpdate(entries);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/provenance`);
  });
};
