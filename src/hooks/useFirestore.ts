import { useEffect, useState } from 'react'
import {
  firestore,
} from 'firebase'
import { FSSnap, FSRef } from '../types'

export default function useFirestore(
  firestoreRef: FSRef,
) {
  const [snapshot, onSnap] = useState<FSSnap | null>(null)
  const [error, onError] = useState<Error | null>(null)
  useEffect(() => {
    if (firestoreRef) {
      return (firestoreRef as firestore.CollectionReference)
        .onSnapshot(onSnap, onError)
    }
  }, [firestoreRef])
  return { snapshot, error }
}
