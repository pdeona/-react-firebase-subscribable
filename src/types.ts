import { UserInfo, database, firestore } from 'firebase'
import { Ref, ComponentType } from 'react'
import { Observer } from 'rxjs'

export type AuthState = UserInfo
export type FSSnap = firestore.QuerySnapshot | firestore.DocumentSnapshot

export type IFSRef = {
  onSnapshot<S>(o: Observer<S>): () => void;
  onSnapshot<S>(next: (s: S) => void, error: (e: Error) => void): () => void;
  id: string;
}

export type IDBRef = {
  on<S>(e: DBEventType, f: (s: S) => void): void;
  off<S>(e: DBEventType, f: (s: S) => void): void;
}

export type DBSnap = database.DataSnapshot
export type DBEventType = 'value'
  | 'child_added'
  | 'child_changed'
  | 'child_removed'
  | 'child_moved'

export type RefMap = {
  [key: string]: IFSRef,
}

export type FSState = {
  [key: string]: {
    snap?: FSSnap,
    error?: Error,
  },
}

export type ObserverFn<T> = (next: T) => void

export type UpdateSnapshot = { key: string, snapshot: FSSnap }
export type UpdateError = { key: string, error: Error }
export type UpdateAction
  = UpdateSnapshot
  | UpdateError

export type SnapshotListenerMap = {
  [key: string]: () => void,
}

export type StateObserver = {
  observer: () => void,
  id: number,
}

export type FirestoreSnapHandler = (s?: FSSnap) => void

export type PlainRefToInj = { key: string, ref: IFSRef }
export type FnRefToInj<P> = { key: string, ref: (p: P) => IFSRef }
export type RefToInj<P> = PlainRefToInj | FnRefToInj<P>

export type MapFirestoreFn = (s: FSState) => any

export type InjectedRef = {
  key: string,
  ref: IFSRef,
}

export type ObservableStore = {
  getState: () => FSState,
  subscribe: (o: () => void) => () => void,
  injectRef: (r: InjectedRef) => void,
}

export type ForwardedRef<C> = {
  forwardedRef?: Ref<C>,
}
