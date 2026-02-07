import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import type { LayoutPreset, LayoutPresets } from '../types/state';
import { logError, logInfo, logWarn } from '../../nxt/runtime/engine/logging/framework-logger';

export interface FirestorePreset extends LayoutPreset {
  userId: string | null;
  updatedAt?: unknown;
}

const COLLECTION_NAME = 'presets';

let firestoreDb: Firestore | null = null;
let currentUserId: string | null = null;

export const firestorePersistence = {
  initialize(db: Firestore, userId?: string | null): void {
    firestoreDb = db;
    currentUserId = userId ?? null;
  },

  setUserId(userId: string | null): void {
    currentUserId = userId;
  },

  getUserId(): string | null {
    return currentUserId;
  },

  isInitialized(): boolean {
    return firestoreDb !== null;
  },

  async saveAll(presets: LayoutPresets): Promise<void> {
    if (!firestoreDb) {
      logWarn('Firestore not initialized, skipping saveAll');
      return;
    }

    try {
      const presetsCollection = collection(firestoreDb, COLLECTION_NAME);
      const savePromises = Object.entries(presets).map(([name, preset]) => {
        const docId = this.getDocId(name);
        const firestorePreset: FirestorePreset = {
          ...preset,
          userId: currentUserId,
          updatedAt: serverTimestamp(),
        };
        return setDoc(doc(presetsCollection, docId), firestorePreset);
      });
      await Promise.all(savePromises);
    } catch (error) {
      logWarn('Failed to save presets to Firestore.', { error });
    }
  },

  async loadAll(): Promise<LayoutPresets | null> {
    if (!firestoreDb) {
      logWarn('[FirestorePersistence] Firestore not initialized, skipping loadAll');
      return null;
    }

    try {
      logInfo('[FirestorePersistence] Loading presets from Firestore...', { currentUserId });
      const presetsCollection = collection(firestoreDb, COLLECTION_NAME);
      const userIds = currentUserId ? [null, currentUserId] : [null];
      const q = query(presetsCollection, where('userId', 'in', userIds));
      const snapshot = await getDocs(q);

      logInfo('[FirestorePersistence] Firestore snapshot received:', {
        docsCount: snapshot.docs.length,
        userIds,
      });

      const presets: LayoutPresets = {};
      snapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnap.data() as FirestorePreset;
        const { userId: _userId, updatedAt: _updatedAt, ...preset } = data;
        presets[preset.name] = preset;
        logInfo('[FirestorePersistence] Loaded preset.', { name: preset.name });
      });

      logInfo('[FirestorePersistence] Total presets loaded.', { count: Object.keys(presets).length });
      return Object.keys(presets).length > 0 ? presets : null;
    } catch (error: unknown) {
      logError(error, { message: '[FirestorePersistence] Failed to load presets from Firestore.' });
      return null;
    }
  },

  async loadSystemPresets(): Promise<LayoutPresets | null> {
    if (!firestoreDb) {
      logWarn('Firestore not initialized, skipping loadSystemPresets');
      return null;
    }

    try {
      const presetsCollection = collection(firestoreDb, COLLECTION_NAME);
      const q = query(presetsCollection, where('userId', '==', null));
      const snapshot = await getDocs(q);

      const presets: LayoutPresets = {};
      snapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnap.data() as FirestorePreset;
        const { userId: _userId, updatedAt: _updatedAt, ...preset } = data;
        presets[preset.name] = { ...preset, isSystemPreset: true };
      });

      return Object.keys(presets).length > 0 ? presets : null;
    } catch (error: unknown) {
      logWarn('Failed to load system presets from Firestore.', { error });
      return null;
    }
  },

  async savePreset(name: string, preset: LayoutPreset): Promise<void> {
    if (!firestoreDb) {
      logWarn('Firestore not initialized, skipping savePreset');
      return;
    }

    try {
      const docId = this.getDocId(name);
      const presetsCollection = collection(firestoreDb, COLLECTION_NAME);
      const firestorePreset: FirestorePreset = {
        ...preset,
        userId: currentUserId,
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(presetsCollection, docId), firestorePreset);
    } catch (error) {
      logWarn('Failed to save preset to Firestore.', { error });
    }
  },

  async deletePreset(name: string): Promise<void> {
    if (!firestoreDb) {
      logWarn('Firestore not initialized, skipping deletePreset');
      return;
    }

    try {
      const docId = this.getDocId(name);
      const presetsCollection = collection(firestoreDb, COLLECTION_NAME);
      await deleteDoc(doc(presetsCollection, docId));
    } catch (error) {
      logWarn('Failed to delete preset from Firestore.', { error });
    }
  },

  async renamePreset(oldName: string, newName: string): Promise<void> {
    if (!firestoreDb) {
      logWarn('Firestore not initialized, skipping renamePreset');
      return;
    }

    try {
      const presetsCollection = collection(firestoreDb, COLLECTION_NAME);
      const oldDocId = this.getDocId(oldName);
      const newDocId = this.getDocId(newName);

      const oldDoc = doc(presetsCollection, oldDocId);
      const newDoc = doc(presetsCollection, newDocId);

      const current = await this.loadAll();
      const preset = current?.[oldName];
      if (preset) {
        const firestorePreset: FirestorePreset = {
          ...preset,
          name: newName,
          userId: currentUserId,
          updatedAt: serverTimestamp(),
        };
        await setDoc(newDoc, firestorePreset);
        await deleteDoc(oldDoc);
      }
    } catch (error) {
      logWarn('Failed to rename preset in Firestore.', { error });
    }
  },

  async clear(): Promise<void> {
    if (!firestoreDb) {
      logWarn('Firestore not initialized, skipping clear');
      return;
    }

    try {
      const presetsCollection = collection(firestoreDb, COLLECTION_NAME);
      const q = currentUserId
        ? query(presetsCollection, where('userId', '==', currentUserId))
        : query(presetsCollection, where('userId', '==', null));
      const snapshot = await getDocs(q);

      const deletePromises = snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) =>
        deleteDoc(docSnap.ref)
      );
      await Promise.all(deletePromises);
    } catch (error: unknown) {
      logWarn('Failed to clear presets from Firestore.', { error });
    }
  },

  onPresetsChanged(callback: (presets: LayoutPresets) => void): Unsubscribe {
    if (!firestoreDb) {
      logWarn('Firestore not initialized, skipping onPresetsChanged');
      return () => {};
    }

    const presetsCollection = collection(firestoreDb, COLLECTION_NAME);
    const userIds = currentUserId ? [null, currentUserId] : [null];
    const q = query(presetsCollection, where('userId', 'in', userIds));

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const presets: LayoutPresets = {};
        snapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
          const data = docSnap.data() as FirestorePreset;
          const { userId: _userId, updatedAt: _updatedAt, ...preset } = data;
          presets[preset.name] = preset;
        });
        callback(presets);
      },
      (error: unknown) => {
        logWarn('Firestore snapshot listener error.', { error });
      }
    );
  },

  getDocId(presetName: string): string {
    const prefix = currentUserId ? `user_${currentUserId}` : 'shared';
    const safeName = presetName.replace(/[^a-zA-Z0-9-_]/g, '_');
    return `${prefix}_${safeName}`;
  },
};
