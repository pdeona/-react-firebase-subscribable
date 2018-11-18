// @flow
import { useEffect, useState } from 'react'
import type {
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore'

type Ref = CollectionReference | DocumentReference
type Snapshot = QuerySnapshot | DocumentSnapshot
type OnSnapshot = (m: Snapshot) => void
type SnapshotState = [?Snapshot, OnSnapshot]

export default function useFirestoreSubscription(
  firestoreRef: ?Ref
): ?Snapshot {
  const [snapshot, onSnapshot]: SnapshotState = useState(null)
  useEffect(
    () => firestoreRef && firestoreRef.onSnapshot(onSnapshot),
    [firestoreRef],
  )
  return snapshot
}
