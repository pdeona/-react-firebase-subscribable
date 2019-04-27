import { useEffect, useState } from 'react'
import { database } from 'firebase'

type RTDBEventType = 'value'
  | 'child_added'
  | 'child_changed'
  | 'child_removed'
  | 'child_moved'

type SnapshotState = database.DataSnapshot | null

export default function useRTDBSubscription(
  firebaseRef: database.Reference | null,
  eventType: RTDBEventType = 'value',
): database.DataSnapshot | null {
  const [snap, onSnap] = useState<SnapshotState>(null)
  useEffect(() => {
    if (firebaseRef) {
      firebaseRef.on(eventType, onSnap)
      return () => { firebaseRef.off(eventType, onSnap) }
    }
  }, [firebaseRef])
  return snap
}
