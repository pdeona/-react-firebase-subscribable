import { useState, useEffect } from 'react'
import { auth, UserInfo } from 'firebase'

const useAuth = (firebaseAuth: auth.Auth): UserInfo => {
  const [user, setUser] = useState(null)
  useEffect(() => {
    return firebaseAuth.onAuthStateChanged(setUser)
  }, [firebaseAuth])

  return user
}

export default useAuth
