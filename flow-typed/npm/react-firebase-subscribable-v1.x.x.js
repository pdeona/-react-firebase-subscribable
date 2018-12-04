declare module 'react-firebase-subscribable' {
  // API Functions
  declare export function createObservableRefMap(i: RefMap): ObservableRefMap

  // API Classes
  declare export class FirebaseAuthProvider extends React$PureComponent<AuthProviderProps, AuthProviderState> {
    unsubscribe: ?() => void;
    context: ?AuthCtx;
  }

  declare export class FirestoreProvider extends React$PureComponent<FirestoreProviderProps, FirestoreProviderState> {
    mounted: boolean;
    unsubscribe: () => void;
  }

  import typeof $observable from 'symbol-observable'
  import type { FirebaseUser } from 'firebase/app'
  import type { Auth } from 'firebase/auth'
  import type {
    DocumentReference,
    CollectionReference,
    DocumentSnapshot,
    QuerySnapshot,
  } from 'firebase/firestore'

  // API Types
  declare export type AuthProviderProps = {
    +firebaseAuth: Auth,
    +onAuthStateChanged?: AuthStateHandler,
    +children: React$Node,
  }

  declare export type AuthProviderState = {
    +user: ?FirebaseUser,
  }

  declare export type AuthCtx = ?FirebaseUser

  declare export type FirestoreProviderProps = {
    +refMap: ObservableRefMap,
    +children: React$Node,
  }

  declare export type FirestoreProviderState = {
    +snapshots: SnapshotMap,
    +injectRef: (key: string, ref: FirestoreReference) => void,
  }

  declare export type FirestoreCtx = {
    +snapshots: SnapshotMap,
    +injectRef: (key: string, ref: FirestoreReference) => void,
  }

  declare export type InjectedRef = {
    +key: string,
    +ref: ?FirestoreReference,
    +memoizeProps: string[],
  }

  declare export type RefMap = {
    [key: string]: ?FirestoreReference,
  }

  declare export type SnapshotMap = {
    [key: string]: ?FirestoreSnapshot,
  }

  declare export type SnapshotListenerMap = {
    [key: string]: ?() => void,
  }

  declare export type UpdateSnapshotActn = { +key: string, +snap: ?FirestoreSnapshot }
  declare export type FirestoreSnapHandler = (snap: ?FirestoreSnapshot) => void

  declare export interface Observer<S> {
    +next: (v: ?S) => void,
    +error: (e: Error) => void,
    +complete: () => void,
    +closed?: boolean,
  }

  declare export type RequiredPropSpec = RequiredPropWithStdType | RequiredPropWithPredicate

  declare type ObsUnsubscribe = {
    +unsubscribe: () => void
  }

  declare type StateObserverFn = () => void

  declare export type Observable<S> = {
    subscribe: (o: Observer<S>) => ObsUnsubscribe,
    // $FlowFixMe symbols not yet supported
    [$observable]: () => Observable<S>,
  }

  declare export type StateObserver = {
    +id: number,
    +observer: StateObserverFn,
  }

  declare export type ObservableRefMap = {
    getState: () => SnapshotMap,
    injectRef: (i: InjectedRef) => void,
    subscribe: (sub: StateObserverFn) => () => void,
    // $FlowFixMe symbols not yet supported
    [$observable]: () => Observable<SnapshotMap>,
  }

  declare export type AuthStateHandler = (u: ?FirebaseUser) => void
  declare export type FirestoreReference = DocumentReference | CollectionReference
  declare export type FirestoreSnapshot = DocumentSnapshot | QuerySnapshot

  // Internal Classes
  declare class RequiredPropError extends Error {
    constructor(componentName: string, propName: string, message: string): RequiredPropError
  }

  // Internal Functions
  declare function diffRequiredProps(
    componentName: string,
    props: *,
    ...requiredProps: RequiredPropSpec[]
  ): RequiredPropError[]
  declare function dispatch(a: UpdateSnapshotActn): void
  declare function combinedOnSnapshot(
    key: string,
    externalOnSnap: ?FirestoreSnapHandler,
  ): FirestoreSnapHandler
  declare function reduceInitialRefs(refs: RefMap): ReduceRefsToListenerMap
  declare function unsub(unsubscribe: ?() => void): void
  declare function getState(): SnapshotMap
  declare function subscribe(observer: StateObserverFn): () => void
  declare function injectRef(i: InjectedRef): void
  declare function observable(): Observable<SnapshotMap>

  // Internal Types
  declare type TypeofTypes = 'string'
    | 'function'
    | 'number'
    | 'object'
    | 'boolean'
    | 'undefined'

  declare type RequiredPropWithStdType = $Exact<{
    propName: string,
    propType: TypeofTypes,
  }>

  declare type RequiredPropWithPredicate = $Exact<{
    propName: string,
    predicate: (prop: *) => boolean,
    message: string,
  }>

  declare type ReduceRefsToListenerMap = (acc: RefMap, key: string) => SnapshotListenerMap
}
