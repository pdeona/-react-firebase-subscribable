// @flow
import { useEffect, useState } from 'react'
import type {
  DataSnapshot,
  Reference,
} from 'firebase/database'

type RTDBEventType = 'value'
  | 'child_added'
  | 'child_changed'
  | 'child_removed'
  | 'child_moved'

type OnSnapshot = (d: DataSnapshot) => void
type SnapshotState = [?Reference, OnSnapshot]

export default function useRTDBSubscription(
  firebaseRef: ?Reference,
  eventType: RTDBEventType = 'value',
): ?Reference {
  const [snap, onSnap]: SnapshotState = useState(null)
  useEffect(
    () => firebaseRef && firebaseRef.on(eventType, onSnap),
    [firebaseRef],
  )
  return snap
}
