import React from 'react'
import App from '../containers/FirestoreConnected'
import firebase from '../firebase'

const AuthConnected = () => (
  <FirebaseAuthProvider firebaseAuth={firebase.auth()}>
    <App />
  </FirebaseAuthProvider>
)

export default AuthConnected
