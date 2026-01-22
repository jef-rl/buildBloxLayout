/// <reference types="vite/client" />

// Firebase/Firestore type declarations
declare module 'firebase/firestore' {
  export interface Firestore {
    readonly app: any;
    readonly type: 'firestore' | 'firestore-lite';
  }

  export function getFirestore(app?: any): Firestore;
}
