import { useEffect, useState } from 'react'
import { FSSnap, IFSRef } from '../types'

export default function useFirestore(
  firestoreRef: IFSRef,
): [FSSnap, Error] {
  const [snapshot, onSnap] = useState<FSSnap>(null)
  const [error, onError] = useState<Error>(null)
  useEffect(() => {
    if (firestoreRef) {
      return firestoreRef.onSnapshot(onSnap, onError)
    }
  }, [firestoreRef])
  return [snapshot, error]
}
