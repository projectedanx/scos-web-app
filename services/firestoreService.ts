
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  writeBatch,
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
import { OperationType, handleFirestoreError } from './firestoreErrorHandler';

const USERS_COLLECTION = 'users';

// --- Helper to get refs ---
const getUserRef = (uid: string) => doc(db, USERS_COLLECTION, uid);
const getCollectionRef = (uid: string, sub: string) => collection(db, USERS_COLLECTION, uid, sub);

// --- AGENTS ---
/**
 * The syncAgents function.
 * @param uid - The uid parameter.
 * @param onUpdate - The onUpdate parameter.
 * @returns The resulting value.
 */
export const syncAgents = (uid: string, onUpdate: (data: SovereignAgentManifest[]) => void) => {
  const q = query(getCollectionRef(uid, 'manifests'));
  return onSnapshot(q, (snapshot) => {
    const agents = snapshot.docs.map(d => d.data() as SovereignAgentManifest);
    onUpdate(agents);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/manifests`);
  });
};

/**
 * The saveAgentToCloud function.
 * @param uid - The uid parameter.
 * @param agent - The agent parameter.
 */
export const saveAgentToCloud = async (uid: string, agent: SovereignAgentManifest) => {
  // Use name as ID for simplicity in this version, or generate a UUID
  const agentId = agent.identity.name.toLowerCase().replace(/\s+/g, '-');
  try {
    await setDoc(doc(getCollectionRef(uid, 'manifests'), agentId), agent);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/manifests/${agentId}`);
  }
};

/**
 * The deleteAgentFromCloud function.
 * @param uid - The uid parameter.
 * @param agent - The agent parameter.
 */
export const deleteAgentFromCloud = async (uid: string, agent: SovereignAgentManifest) => {
  const agentId = agent.identity.name.toLowerCase().replace(/\s+/g, '-');
  try {
    await deleteDoc(doc(getCollectionRef(uid, 'manifests'), agentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/manifests/${agentId}`);
  }
};

// --- CAPSULES ---
/**
 * The syncCapsules function.
 * @param uid - The uid parameter.
 * @param onUpdate - The onUpdate parameter.
 * @returns The resulting value.
 */
export const syncCapsules = (uid: string, onUpdate: (data: ContextCapsule[]) => void) => {
  const q = query(getCollectionRef(uid, 'capsules'));
  return onSnapshot(q, (snapshot) => {
    const capsules = snapshot.docs.map(d => d.data() as ContextCapsule);
    onUpdate(capsules);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/capsules`);
  });
};

/**
 * The saveCapsuleToCloud function.
 * @param uid - The uid parameter.
 * @param capsule - The capsule parameter.
 */
export const saveCapsuleToCloud = async (uid: string, capsule: ContextCapsule) => {
  try {
    await setDoc(doc(getCollectionRef(uid, 'capsules'), capsule.meta.id), capsule);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/capsules/${capsule.meta.id}`);
  }
};

/**
 * The deleteCapsuleFromCloud function.
 * @param uid - The uid parameter.
 * @param capsuleId - The capsuleId parameter.
 */
export const deleteCapsuleFromCloud = async (uid: string, capsuleId: string) => {
  try {
    await deleteDoc(doc(getCollectionRef(uid, 'capsules'), capsuleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/capsules/${capsuleId}`);
  }
};

// --- PROMPTS ---
/**
 * The syncPrompts function.
 * @param uid - The uid parameter.
 * @param onUpdate - The onUpdate parameter.
 * @returns The resulting value.
 */
export const syncPrompts = (uid: string, onUpdate: (data: SovereignPrompt[]) => void) => {
  const q = query(getCollectionRef(uid, 'prompts'));
  return onSnapshot(q, (snapshot) => {
    const prompts = snapshot.docs.map(d => d.data() as SovereignPrompt);
    onUpdate(prompts);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/prompts`);
  });
};

/**
 * The savePromptToCloud function.
 * @param uid - The uid parameter.
 * @param prompt - The prompt parameter.
 */
export const savePromptToCloud = async (uid: string, prompt: SovereignPrompt) => {
  try {
    await setDoc(doc(getCollectionRef(uid, 'prompts'), prompt.id), prompt);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/prompts/${prompt.id}`);
  }
};

/**
 * The deletePromptFromCloud function.
 * @param uid - The uid parameter.
 * @param promptId - The promptId parameter.
 */
export const deletePromptFromCloud = async (uid: string, promptId: string) => {
  try {
    await deleteDoc(doc(getCollectionRef(uid, 'prompts'), promptId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/prompts/${promptId}`);
  }
};

// --- CONTRACTS ---
/**
 * The syncContracts function.
 * @param uid - The uid parameter.
 * @param onUpdate - The onUpdate parameter.
 * @returns The resulting value.
 */
export const syncContracts = (uid: string, onUpdate: (data: CognitiveContract[]) => void) => {
  const q = query(getCollectionRef(uid, 'contracts'));
  return onSnapshot(q, (snapshot) => {
    const contracts = snapshot.docs.map(d => d.data() as CognitiveContract);
    onUpdate(contracts);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/contracts`);
  });
};

/**
 * The saveContractToCloud function.
 * @param uid - The uid parameter.
 * @param contract - The contract parameter.
 */
export const saveContractToCloud = async (uid: string, contract: CognitiveContract) => {
  try {
    await setDoc(doc(getCollectionRef(uid, 'contracts'), contract.id), contract);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/contracts/${contract.id}`);
  }
};

/**
 * The deleteContractFromCloud function.
 * @param uid - The uid parameter.
 * @param contractId - The contractId parameter.
 */
export const deleteContractFromCloud = async (uid: string, contractId: string) => {
  try {
    await deleteDoc(doc(getCollectionRef(uid, 'contracts'), contractId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/contracts/${contractId}`);
  }
};

// --- PROVENANCE ---
/**
 * The saveProvenanceToCloud function.
 * @param uid - The uid parameter.
 * @param entry - The entry parameter.
 */
export const saveProvenanceToCloud = async (uid: string, entry: ProvenanceIndexEntry) => {
  // We use a separate subcollection for the provenance log
  const id = `${entry.timestamp}-${entry.hash.substring(0,8)}`;
  try {
    await setDoc(doc(getCollectionRef(uid, 'provenance'), id), entry);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/provenance/${id}`);
  }
};

/**
 * The syncProvenance function.
 * @param uid - The uid parameter.
 * @param onUpdate - The onUpdate parameter.
 * @returns The resulting value.
 */
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



// --- BATCH OPERATIONS ---
/**
 * The batchSaveAgentsToCloud function.
 * @param uid - The uid parameter.
 * @param agents - The agents parameter.
 * @returns The resulting value.
 */
export const batchSaveAgentsToCloud = async (uid: string, agents: SovereignAgentManifest[]) => {
  if (agents.length === 0) return;
  const batch = writeBatch(db);
  const collectionRef = getCollectionRef(uid, 'manifests');

  agents.forEach(agent => {
    const agentId = agent.identity.name.toLowerCase().replace(/\s+/g, '-');
    batch.set(doc(collectionRef, agentId), agent);
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/manifests/batch`);
  }
};

/**
 * The batchSaveCapsulesToCloud function.
 * @param uid - The uid parameter.
 * @param capsules - The capsules parameter.
 * @returns The resulting value.
 */
export const batchSaveCapsulesToCloud = async (uid: string, capsules: ContextCapsule[]) => {
  if (capsules.length === 0) return;
  const batch = writeBatch(db);
  const collectionRef = getCollectionRef(uid, 'capsules');

  capsules.forEach(capsule => {
    batch.set(doc(collectionRef, capsule.meta.id), capsule);
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/capsules/batch`);
  }
};

/**
 * The batchSavePromptsToCloud function.
 * @param uid - The uid parameter.
 * @param prompts - The prompts parameter.
 * @returns The resulting value.
 */
export const batchSavePromptsToCloud = async (uid: string, prompts: SovereignPrompt[]) => {
  if (prompts.length === 0) return;
  const batch = writeBatch(db);
  const collectionRef = getCollectionRef(uid, 'prompts');

  prompts.forEach(prompt => {
    batch.set(doc(collectionRef, prompt.id), prompt);
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/prompts/batch`);
  }
};

/**
 * The batchSaveContractsToCloud function.
 * @param uid - The uid parameter.
 * @param contracts - The contracts parameter.
 * @returns The resulting value.
 */
export const batchSaveContractsToCloud = async (uid: string, contracts: CognitiveContract[]) => {
  if (contracts.length === 0) return;
  const batch = writeBatch(db);
  const collectionRef = getCollectionRef(uid, 'contracts');

  contracts.forEach(contract => {
    batch.set(doc(collectionRef, contract.id), contract);
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/contracts/batch`);
  }
};

/**
 * The batchSaveProvenanceToCloud function.
 * @param uid - The uid parameter.
 * @param entries - The entries parameter.
 * @returns The resulting value.
 */
export const batchSaveProvenanceToCloud = async (uid: string, entries: ProvenanceIndexEntry[]) => {
  if (entries.length === 0) return;
  const batch = writeBatch(db);
  const collectionRef = getCollectionRef(uid, 'provenance');

  entries.forEach(entry => {
    batch.set(doc(collectionRef, entry.hash), entry);
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/provenance/batch`);
  }
};
