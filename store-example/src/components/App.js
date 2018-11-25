import React from 'react'
import compose from 'lodash/fp/compose'
import {
  connectFirestore,
  connectAuth,
  injectRef,
} from 'react-firebase-subscribable'
import User from '../models/user'

const onChangeAttr = attr => user => ({ target: { value } }) => User
  .userProfile(user.uid)
  .set({ [attr]: value }, { merge: true })

const onChangeColor = onChangeAttr('favoriteColor')
const onChangeName = onChangeAttr('name')

function App({ user, userProfile }) {
  return (
    <div>
      <div className="profile-info">
        {user
          ? userProfile
            ? `${userProfile.name}'s favorite color is ${userProfile.favoriteColor || 'unknown at this time'}` : 'We dont have your profile yet!'
          : 'Sign in to view profile'
        }
      </div>
      {
        user
          && (
            <form>
              <label htmlFor="user-name">Name:</label>
              <input
                name="name"
                id="user-name"
                onChange={onChangeName(user)}
              />
              <label htmlFor="user-color">Fav. Color:</label>
              <input
                name="color"
                id="user-color"
                onChange={onChangeColor(user)}
              />
            </form>
          )
      }
      <button onClick={user ? User.signOut : User.signInAnonymously}>
        Sign
        {' '}
        {user ? 'Out' : 'In'}
      </button>
    </div>
  )
}

const mapSnapshotsToProps = ({ userProfile }) => ({
  userProfile: userProfile ? userProfile.data() : null,
})

const userProfileRef = ({ user }) => (user ? User.userProfile(user.uid) : null)

const withFirestoreState = connectFirestore(mapSnapshotsToProps, { key: 'userProfile', ref: userProfileRef })

const mapAuthStateToProps = user => ({ user })

const withAuthState = connectAuth(mapAuthStateToProps)

export default compose(
  // withAuthState should be the outermost enhancer to ensure withFirestoreState
  // receives `user` as a prop
  withAuthState,
  withFirestoreState,
)(App)
