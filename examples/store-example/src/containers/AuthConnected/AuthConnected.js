import React from 'react'
import { FirebaseAuthProvider } from 'react-firebase-subscribable'
import FirestoreConnectedRoot from '../FirestoreConnected'
import firebase from '../../firebase'

const AuthConnected = () => (
  <FirebaseAuthProvider firebaseAuth={firebase.auth()}>
    <FirestoreConnectedRoot />
  </FirebaseAuthProvider>
)

export default AuthConnected
