import React from 'react'
import compose from 'lodash/fp/compose'
import {
  connectFirestore,
} from 'react-firebase-subscribable'
import User from '../models/user'

function Container({
  userProfile,
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

const mapSnapshotsToProps = ({ userProfile }) => ({
  userProfile: userProfile ? userProfile.doc() : null,
})

export default connectFirestore(mapSnapshotsToProps)(Container)
