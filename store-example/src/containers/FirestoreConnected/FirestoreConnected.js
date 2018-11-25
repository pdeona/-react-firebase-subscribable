import React from 'react'
import { FirestoreProvider } from 'react-firebase-subscribable'
import App from '../../components/App'
import User from '../../models/user'

const FirestoreConnected = props => {
  const refMap = {
    userProfile: props.currentUser ?
      User.userProfile(props.currentUser) : null,
  }

  return (
    <FirestoreProvider refMap={refMap}>
      <App />
    </FirestoreProvider>
  )
}

export default FirestoreConnected
