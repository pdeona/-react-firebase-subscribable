// @flow
import { useEffect, useState } from 'react'
import type { FirebaseUser } from 'firebase/app'
import type { Auth } from 'firebase/auth'

type CurrentUserState = [?FirebaseUser, (?FirebaseUser) => void]

export default function useAuthSubscription(firebaseAuth: Auth): ?FirebaseUser {
  const [user, setUser]: CurrentUserState = useState(null)
  useEffect(
    () => firebaseAuth.onAuthStateChanged(setUser),
    [],
  )
  return user
}
