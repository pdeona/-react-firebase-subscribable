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
type SnapshotState = [?DataSnapshot, OnSnapshot]

export default function useRTDBSubscription(
  firebaseRef: ?Reference,
  eventType: RTDBEventType = 'value',
): ?DataSnapshot {
  const [snap, onSnap]: SnapshotState = useState(null)
  useEffect(
    () => {
      if (firebaseRef === null || firebaseRef === undefined) return null
      firebaseRef.on(eventType, onSnap)
      return () => firebaseRef.off(eventType, onSnap)
    },
    [firebaseRef],
  )
  return snap
}
