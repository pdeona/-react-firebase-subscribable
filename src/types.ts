import { UserInfo, database, firestore } from 'firebase'
import { Ref } from 'react'

export type AuthState = UserInfo | null
export type FSSnap = firestore.QuerySnapshot | firestore.DocumentSnapshot
export type FSRef = firestore.CollectionReference | firestore.DocumentReference
export type DBRef = database.Reference
export type DBSnap = database.DataSnapshot
export type DBEventType = 'value'
  | 'child_added'
  | 'child_changed'
  | 'child_removed'
  | 'child_moved'

export type RefMap = {
  [key: string]: FSRef,
}

export type FSState = {
  [key: string]: {
    snap?: FSSnap,
    error?: Error,
  },
}

export type ObserverFn<T> = (next: T) => void

export type UpdateSnapshot = { key: string, snap: FSSnap }
export type UpdateError = { key: string, error: Error }

export type SnapshotListenerMap = {
  [key: string]: () => void,
}

export type StateObserver = {
  observer: () => void,
  id: number,
}

export type FirestoreSnapHandler = (s?: FSSnap) => void

export type InjectedRef = {
  key: string,
  ref: FSRef,
}

export type ObservableStore = {
  getState: () => FSState,
  subscribe: (o: () => void) => () => void,
  injectRef: (r: InjectedRef) => void,
}

export type ForwardedRef<C> = {
  forwardedRef: Ref<C>,
}
