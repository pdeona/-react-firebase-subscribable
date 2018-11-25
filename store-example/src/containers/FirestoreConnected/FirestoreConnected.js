import React from 'react'
import {
  FirestoreProvider,
  connectAuth,
} from 'react-firebase-subscribable'
import App from '../../components/App'
import User from '../../models/user'

const FirestoreConnected = ({ refMap }) => (
  <FirestoreProvider refMap={refMap}>
    <App />
  </FirestoreProvider>
)

const mapAuthStateToProps = user => ({
  refMap: user ? User.userProfile(user.uid) : null,
})

export default connectAuth(mapAuthStateToProps)(FirestoreConnected)
