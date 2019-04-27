import React from 'react'
import { useFirestoreSubscription } from 'react-firebase-subscribable'
import User from '../models/user'

const onChangeAttr = attr => user => ({ target: { value } }) => User
  .userProfile(user.uid).set({ [attr]: value }, { merge: true })
const onChangeColor = onChangeAttr('favoriteColor')
const onChangeName = onChangeAttr('name')

function Container({
  user,
  userProfileRef,
}) {
  const userProfileSnap = useFirestoreSubscription(userProfileRef)
  const userProfile = userProfileSnap && userProfileSnap.data()

  if (user) {
    return (
      <div>
        <div className="profile-info">
          {userProfile ?
            `${userProfile.name}'s favorite color is ${userProfile.favoriteColor || 'unknown at this time'}` : 'We dont have your profile yet!'
          }
        </div>
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
        <button onClick={User.signOut}>
          Sign Out
        </button>
      </div>
    )
  }
  return (
    <div>
      <span>Sign in to view your profile</span>
      <button onClick={User.signInAnonymously}>
        Sign In
      </button>
    </div>
  )
}

export default Container
