import React from 'react'
import compose from 'lodash/fp/compose'
import {
  connectFirestore,
  connectAuth,
} from 'react-firebase-subscribable'
import User from '../models/user'

const onChangeAttr = attr => user => ({ target: { value } }) => User
  .userProfile(user.uid)
  .set({ [attr]: value }, { merge: true })

const onChangeColor = onChangeAttr('favoriteColor')
const onChangeName = onChangeAttr('name')

const userProfileRef = ({ user }) => (user ? User.userProfile(user.uid) : null)

function App({
  user, profile, error, ...rest
}) {
  return (
    <div>
      <div className="profile-info">
        {user
          ? profile
            ? `${profile.name ? profile.name.concat('\'s') : 'Your'} favorite color is ${profile.favoriteColor || 'unknown at this time'}` : 'We dont have your profile yet!'
          : 'Sign in to view profile'
        }
        {error && `There was an error fetching your profile: ${error}`}
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

const mapSnapshotsToProps = ({ profile: { value, error } = {} }) => ({
  profile: value ? value.data() : null,
  error: error ? value : null,
})

const withFirestoreState = connectFirestore(mapSnapshotsToProps, { key: 'profile', ref: userProfileRef })

const mapAuthStateToProps = user => ({ user })

const withAuthState = connectAuth(mapAuthStateToProps)

export default compose(
  // withAuthState should be the outermost enhancer to ensure withFirestoreState
  // receives `user` as a prop
  withAuthState,
  withFirestoreState,
)(App)
