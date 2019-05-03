import { useEffect, useState } from 'react'
import {
  firestore,
} from 'firebase'
import { FSSnap, IFSRef } from '../types'

export default function useFirestore(
  firestoreRef: IFSRef,
): [FSSnap, Error] {
  const [snapshot, onSnap] = useState<FSSnap>(null)
  const [error, onError] = useState<Error>(null)
  useEffect(() => {
    if (firestoreRef) {
      return (firestoreRef as firestore.CollectionReference)
        .onSnapshot(onSnap, onError)
    }
  }, [firestoreRef])
  return [snapshot, error]
}
