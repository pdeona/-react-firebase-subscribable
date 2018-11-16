import React from 'react'
import {
  withState,
  withPropsOnChange,
  withStateHandlers,
  withHandlers,
  compose,
} from 'recompose'
import firebase from './firebase'
import Container from './components/Container'
import User from './models/user'
import './App.css'

const withCurrentUser = withState('user', 'updateAuthState', null)
const withUserProfileRef = withPropsOnChange(
  ['user'],
  ({ user }) => user ?
    ({ userProfileRef: User.userProfile(user.uid) }) : null,
)

const withUserProfile = withStateHandlers(
  { userProfile: null, color: '', name: '' },
  {
    updateProfile: props => doc => {
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
)

const App = ({
  user,
  updateAuthState,
  userProfileRef,
  userProfile,
  updateProfile,
  name,
  color,
  onChangeName,
  onChangeColor,
}) => (
  <div className="App">
    <Container
      user={user}
      userProfile={userProfile}
      onAuthStateChanged={updateAuthState}
      firestoreRef={userProfileRef}
      onSnapshot={updateProfile}
      firebaseAuth={firebase.auth()}
      form={{
        name,
        color,
      }}
      onChangeUserColor={onChangeColor}
      onChangeUserName={onChangeName}
    />
  </div>
)

export default enhance(App);
