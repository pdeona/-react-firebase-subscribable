import React from 'react'
import {
  withAuthSubscription,
  withFirestoreSubscription,
} from 'react-firebase-subscribable'
import {
  withState,
  withPropsOnChange,
  withStateHandlers,
  withHandlers,
  compose,
} from 'recompose'
import User from '../models/user'

const withCurrentUser = withState('user', 'onAuthStateChanged', null)
const withUserProfileRef = withPropsOnChange(
  ['user'],
  ({ user }) => user ?
    ({ firestoreRef: User.userProfile(user.uid) }) : null,
)

const withUserProfile = withStateHandlers(
  { userProfile: null, color: '', name: '' },
  {
    onSnapshot: props => doc => {
      const data = doc.data()
      return {
        userProfile: data,
        color: data ? data.favoriteColor : '',
        name: data ? data.name : '',
      }
    },
  },
)

const withFormState = withHandlers({
  onChangeName: ({ user }) => ({ target: { value } }) =>
    User.userProfile(user.uid).set({ name: value }, { merge: true }),
  onChangeColor: ({ user }) => ({ target: { value } }) => (
    User.userProfile(user.uid).set({ favoriteColor: value }, { merge: true })),
})

const enhance = compose(
  withCurrentUser,
  withUserProfileRef,
  withUserProfile,
  withFormState,
  withAuthSubscription,
  withFirestoreSubscription,
)

function Container({
  user,
  updateAuthState,
  userProfileRef,
  userProfile,
  updateProfile,
  name,
  color,
  onChangeName,
  onChangeColor,
}) {
  return (
    <div>
      <div className="profile-info">
        {user ?
          userProfile ?
            `${userProfile.name}'s favorite color is ${userProfile.favoriteColor || 'unknown at this time'}` : 'We dont have your profile yet!' :
            'Sign in to view profile'
        }
      </div>
      {
        user &&
          <form>
            <label htmlFor="user-name">Name:</label>
            <input 
              name="name"
              id="user-name"
              value={name}
              onChange={onChangeName}
            />
            <label htmlFor="user-color">Fav. Color:</label>
            <input 
              name="color" 
              id="user-color" 
              value={color}
              onChange={onChangeColor}
            />
          </form>
      }
      <button onClick={user ? User.signOut : User.signInAnonymously}>
        Sign {user ? 'Out' : 'In'}
      </button>
    </div>
  )
}

export default enhance(Container)
