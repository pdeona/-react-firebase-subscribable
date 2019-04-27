import React from 'react'
import {
  FirestoreProvider,
  createRefMap,
} from 'react-firebase-subscribable'
import App from '../../components/App'

const refMap = createRefMap()

const FirestoreConnected = () => (
  <FirestoreProvider refMap={refMap}>
    <App />
  </FirestoreProvider>
)

export default FirestoreConnected
