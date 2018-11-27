declare module '@internal/types' {
  import typeof $observable from 'symbol-observable'
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

  declare type UpdateSnapshotActn = { +key: string, +snap: FirestoreSnapshot }
  declare type Dispatch = (a: UpdateSnapshotActn) => void

  declare type FirestoreSnapHandler = (snap: ?FirestoreSnapshot) => void

  declare type InjectedRef = {
    +key: string,
    +ref: ?FirestoreReference,
  }

  declare type Observer<S> = {
    +next: (v: ?S) => void,
    +error: (e: Error) => void,
    +complete: () => void,
    +closed?: boolean,
  }

  declare type StateObserverFn = () => void

  declare type ObsUnsubscribe = { +unsubscribe: () => void }

  declare type Observable<S> = {
    subscribe: (o: Observer<S>) => ObsUnsubscribe,
    // $FlowFixMe symbols not yet supported
    [$observable]: () => Observable<S>,
  }

  declare type StateObserver = {
    +id: number,
    +observer: StateObserverFn,
  }

  declare type ObservableRefMap = {
    getState: () => SnapshotMap,
    injectRef: (i: InjectedRef) => void,
    subscribe: (sub: StateObserverFn) => () => void,
    // $FlowFixMe symbols not yet supported
    [$observable]: () => Observable<SnapshotMap>,
  }
}
