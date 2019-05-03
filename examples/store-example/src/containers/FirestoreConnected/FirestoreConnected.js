import React from 'react'
import {
  FirestoreProvider,
} from 'react-firebase-subscribable'
import App from '../../components/App'

const FirestoreConnected = () => (
  <FirestoreProvider initialRefs={{}}>
    <App />
  </FirestoreProvider>
)

export default FirestoreConnected
