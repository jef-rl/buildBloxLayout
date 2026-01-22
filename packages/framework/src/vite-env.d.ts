/// <reference types="vite/client" />

declare module '*.css?inline' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}

// Firebase/Firestore type declarations
declare module 'firebase/firestore' {
  export interface Firestore {
    readonly app: any;
    readonly type: 'firestore' | 'firestore-lite';
  }

  export interface DocumentData {
    [field: string]: any;
  }

  export interface QueryDocumentSnapshot<T = DocumentData> {
    readonly id: string;
    readonly ref: any;
    data(): T;
    exists(): boolean;
  }

  export interface QuerySnapshot<T = DocumentData> {
    readonly docs: Array<QueryDocumentSnapshot<T>>;
    readonly empty: boolean;
    readonly size: number;
    forEach(callback: (doc: QueryDocumentSnapshot<T>) => void): void;
  }

  export type Unsubscribe = () => void;

  export function collection(firestore: Firestore, path: string, ...pathSegments: string[]): any;
  export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): any;
  export function getDocs(query: any): Promise<QuerySnapshot>;
  export function setDoc(reference: any, data: any, options?: any): Promise<void>;
  export function deleteDoc(reference: any): Promise<void>;
  export function query(query: any, ...queryConstraints: any[]): any;
  export function where(fieldPath: string, opStr: string, value: any): any;
  export function onSnapshot(reference: any, onNext: any, onError?: any): Unsubscribe;
  export function serverTimestamp(): any;
  export function getFirestore(app?: any): Firestore;
}
