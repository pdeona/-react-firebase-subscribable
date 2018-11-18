import React from 'react'
import compose from 'lodash/fp/compose'
import {
  withAuthSubscription,
  withFirestoreSubscription,
} from 'react-firebase-subscribable'
import User from '../models/user'

function Container({
  user,
  userProfile,
  updateProfile,
  onChangeUserColor,
  onChangeUserName,
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
              onChange={onChangeUserName}
            />
            <label htmlFor="user-color">Fav. Color:</label>
            <input
              name="color" 
              id="user-color" 
              onChange={onChangeUserColor}
            />
          </form>
      }
      <button onClick={user ? User.signOut : User.signInAnonymously}>
        Sign {user ? 'Out' : 'In'}
      </button>
    </div>
  )
}

export default compose(
  withAuthSubscription,
  withFirestoreSubscription,
)(Container)
