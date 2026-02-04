
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
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

const USERS_COLLECTION = 'users';

// --- Helper to get refs ---
const getUserRef = (uid: string) => doc(db, USERS_COLLECTION, uid);
const getCollectionRef = (uid: string, sub: string) => collection(db, USERS_COLLECTION, uid, sub);

// --- AGENTS ---
export const syncAgents = (uid: string, onUpdate: (data: SovereignAgentManifest[]) => void) => {
  const q = query(getCollectionRef(uid, 'manifests'));
  return onSnapshot(q, (snapshot) => {
    const agents = snapshot.docs.map(d => d.data() as SovereignAgentManifest);
    onUpdate(agents);
  });
};

export const saveAgentToCloud = async (uid: string, agent: SovereignAgentManifest) => {
  // Use name as ID for simplicity in this version, or generate a UUID
  const agentId = agent.identity.name.toLowerCase().replace(/\s+/g, '-');
  await setDoc(doc(getCollectionRef(uid, 'manifests'), agentId), agent);
};

export const deleteAgentFromCloud = async (uid: string, agent: SovereignAgentManifest) => {
  const agentId = agent.identity.name.toLowerCase().replace(/\s+/g, '-');
  await deleteDoc(doc(getCollectionRef(uid, 'manifests'), agentId));
};

// --- CAPSULES ---
export const syncCapsules = (uid: string, onUpdate: (data: ContextCapsule[]) => void) => {
  const q = query(getCollectionRef(uid, 'capsules'));
  return onSnapshot(q, (snapshot) => {
    const capsules = snapshot.docs.map(d => d.data() as ContextCapsule);
    onUpdate(capsules);
  });
};

export const saveCapsuleToCloud = async (uid: string, capsule: ContextCapsule) => {
  await setDoc(doc(getCollectionRef(uid, 'capsules'), capsule.meta.id), capsule);
};

export const deleteCapsuleFromCloud = async (uid: string, capsuleId: string) => {
  await deleteDoc(doc(getCollectionRef(uid, 'capsules'), capsuleId));
};

// --- PROMPTS ---
export const syncPrompts = (uid: string, onUpdate: (data: SovereignPrompt[]) => void) => {
  const q = query(getCollectionRef(uid, 'prompts'));
  return onSnapshot(q, (snapshot) => {
    const prompts = snapshot.docs.map(d => d.data() as SovereignPrompt);
    onUpdate(prompts);
  });
};

export const savePromptToCloud = async (uid: string, prompt: SovereignPrompt) => {
  await setDoc(doc(getCollectionRef(uid, 'prompts'), prompt.id), prompt);
};

export const deletePromptFromCloud = async (uid: string, promptId: string) => {
  await deleteDoc(doc(getCollectionRef(uid, 'prompts'), promptId));
};

// --- CONTRACTS ---
export const syncContracts = (uid: string, onUpdate: (data: CognitiveContract[]) => void) => {
  const q = query(getCollectionRef(uid, 'contracts'));
  return onSnapshot(q, (snapshot) => {
    const contracts = snapshot.docs.map(d => d.data() as CognitiveContract);
    onUpdate(contracts);
  });
};

export const saveContractToCloud = async (uid: string, contract: CognitiveContract) => {
  await setDoc(doc(getCollectionRef(uid, 'contracts'), contract.id), contract);
};

export const deleteContractFromCloud = async (uid: string, contractId: string) => {
  await deleteDoc(doc(getCollectionRef(uid, 'contracts'), contractId));
};

// --- PROVENANCE ---
export const saveProvenanceToCloud = async (uid: string, entry: ProvenanceIndexEntry) => {
  // We use a separate subcollection for the provenance log
  const id = `${entry.timestamp}-${entry.hash.substring(0,8)}`;
  await setDoc(doc(getCollectionRef(uid, 'provenance'), id), entry);
};

export const syncProvenance = (uid: string, onUpdate: (data: ProvenanceIndexEntry[]) => void) => {
  // Limit to recent 100 for dashboard performance
  const q = query(getCollectionRef(uid, 'provenance'), orderBy('timestamp', 'desc')); 
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(d => d.data() as ProvenanceIndexEntry);
    onUpdate(entries);
  });
};
