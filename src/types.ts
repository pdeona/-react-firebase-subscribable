import { UserInfo, database, firestore } from 'firebase'
import { Ref } from 'react'
import { Observer } from 'rxjs'

export type AuthState = UserInfo
export type FSSnap 
  = firestore.QuerySnapshot
  | firestore.DocumentSnapshot

export interface IFSRef {
  onSnapshot<S>(o: Observer<S>): () => void;
  onSnapshot<S>(
    next: (s: S) => void,
    error: (e: Error) => void,
  ): () => void;
  id: string;
}

export interface IDBRef {
  on<S>(e: DBEventType, f: (s: S) => void): void;
  off<S>(e: DBEventType, f: (s: S) => void): void;
}

export type DBSnap = database.DataSnapshot
export type DBEventType = 'value'
  | 'child_added'
  | 'child_changed'
  | 'child_removed'
  | 'child_moved'

export type RefMap<P> = {
  [key: string]: IFSRef | ((props: P) => IFSRef),
}

export type FSState = {
  [key: string]: {
    value: FSSnap,
    error: Error,
  },
}

export type ObserverFn<T> = (next: T) => void

export interface UpdateAction {
  key: string,
  snapshot?: FSSnap,
  error?: Error,
}


export type SnapshotListenerMap = {
  [key: string]: () => void,
}

export type StateObserver = {
  observer: () => void,
  id: number,
}

export type FirestoreSnapHandler = (s?: FSSnap) => void

export type MapFirestoreFn = (s: FSState) => any

export type ForwardedRef<C> = {
  forwardedRef?: Ref<C>,
}

// fix for typescript not seeing Object.values
declare global {
  interface Object {
    values: <P extends object>(o: P) => Array<P[keyof P]>
  }
}
