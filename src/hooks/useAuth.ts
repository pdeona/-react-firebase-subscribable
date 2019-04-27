import { useState, useEffect } from 'react'
import { auth } from 'firebase'

const useAuth = (firebaseAuth: auth.Auth) => {
  const [user, setUser] = useState(null)
  useEffect(() => {
    return firebaseAuth.onAuthStateChanged(setUser)
  }, [firebaseAuth])

  return user
}

export default useAuth
