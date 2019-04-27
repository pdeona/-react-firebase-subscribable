// @flow
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  FC,
  ReactNode,
} from 'react'
import { auth } from 'firebase'
import { invariant } from '../shared'
import { AuthState } from '../types'

const AuthContext = createContext<AuthState>(null)
export const useAuth = () => useContext(AuthContext)

type AuthProviderProps = {
  firebaseAuth: auth.Auth,
  onAuthStateChanged?: (a: AuthState) => void,
  children: ReactNode,
}

const FirebaseAuthProvider: FC<AuthProviderProps> = ({
  onAuthStateChanged,
  firebaseAuth,
  children,
}) => {
  const [user, setUser] = useState<AuthState>(null)
  useEffect(() => {
    invariant(
      firebaseAuth && typeof firebaseAuth.onAuthStateChanged === 'function',
      'FirebaseAuthProvider Props: firebaseAuth is required and should be a firebase app auth instance.',
    )
    try {
      return firebaseAuth.onAuthStateChanged(u => {
        setUser(u)
        if (typeof onAuthStateChanged === 'function') {
          onAuthStateChanged(u)
        }
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth Subscription error: ', error)
      }
    }
  }, [firebaseAuth])
  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  )
}

export default FirebaseAuthProvider
