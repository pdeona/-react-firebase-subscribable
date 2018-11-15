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
  form,
}) {
  return (
    <div>
      <button onClick={user ? User.signOut : User.signInAnonymously}>
        Sign {user ? 'Out' : 'In'}
      </button>
      <div className="profile-info">
        {userProfile ?
          `${userProfile.name}'s favorite color is ${userProfile.favoriteColor}` :
          'Sign in to view profile'
        }
      </div>
      {
        user &&
          <form onSubmit={updateProfile}>
            <label htmlFor="user-name">Name:</label>
            <input 
              name="name"
              id="user-name"
              value={form.name}
              onChange={onChangeUserName}
            />
            <label htmlFor="user-color">Fav. Color:</label>
            <input 
              name="color" 
              id="user-color" 
              value={form.color}
              onChange={onChangeUserColor}
            />
            <button type="submit">Update</button>
          </form>
      }
    </div>
  )
}

export default compose(
  withAuthSubscription,
  withFirestoreSubscription,
)(Container)
