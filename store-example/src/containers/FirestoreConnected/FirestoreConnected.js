import React from 'react'
import {
  FirestoreProvider,
  connectAuth,
} from 'react-firebase-subscribable'
import App from '../../components/App'
import User from '../../models/user'

const FirestoreConnected = ({ user }) => {
  const refMap = {
    userProfile: user
      ? User.userProfile(user.uid) : null,
  }

  return (
    <FirestoreProvider refMap={refMap}>
      <App user={user} />
    </FirestoreProvider>
  )
}

const mapAuthStateToProps = user => ({ user })

export default connectAuth(mapAuthStateToProps)(FirestoreConnected)
