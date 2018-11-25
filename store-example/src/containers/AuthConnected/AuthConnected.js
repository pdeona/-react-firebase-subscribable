import React from 'react'
import { FirebaseAuthProvider } from 'react-firebase-subscribable'
import App from '../FirestoreConnected'
import firebase from '../../firebase'

const AuthConnected = () => (
  <FirebaseAuthProvider firebaseAuth={firebase.auth()}>
    <App />
  </FirebaseAuthProvider>
)

export default AuthConnected
