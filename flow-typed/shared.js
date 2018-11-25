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
declare type FirestoreSnapHandler = (snap: ?FirestoreSnapshot) => void
