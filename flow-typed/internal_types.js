declare module '@internal/types' {
  import type { FirebaseUser } from 'firebase/app'
  import type {
    DocumentReference,
    CollectionReference,
    DocumentSnapshot,
    QuerySnapshot,
  } from 'firebase/firestore'

  declare type AuthStateHandler = (u: ?FirebaseUser) => void
  declare type FirestoreReference = DocumentReference | CollectionReference
  declare type FirestoreSnapshot = DocumentSnapshot | QuerySnapshot

  declare type RefMap = {
    [key: string]: ?FirestoreReference,
  }

  declare type SnapshotMap = {
    [key: string]: ?FirestoreSnapshot,
  }

  declare type SnapshotListenerMap = {
    [key: string]: ?() => void,
  }

  declare type Dispatch = (snap: FirestoreSnapshot) => void

  declare type FirestoreSnapHandler = (snap: ?FirestoreSnapshot) => void
  declare type InjectedRef = {
    +key: string,
    +ref: FirestoreReference,
  }
  declare type ObservableRefMap = {
    getState: () => SnapshotMap,
    injectRef: (i: InjectedRef) => void,
    subscribe: (sub: () => void) => () => void,
  }

  declare type StateObserver = {
    +id: number,
    +observer: () => void,
  }
}
