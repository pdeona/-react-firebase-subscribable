// @flow
import React, { PureComponent } from 'react'
import type { FirebaseUser } from 'firebase/app'
import type { DocumentSnapshot, DocumentReference } from 'firebase/firestore'
import firebase from './firebase'
import Container from './components/Container'
import type { OnChangeHandler } from './components/Container'
import User from './models/user'
import type { UserDatabaseRecord } from './models/user'

type AppState = {
  user: ?FirebaseUser,
  userProfile: ?UserDatabaseRecord,
  userProfileRef: ?DocumentReference,
  color: string,
  name: string,
}

class App extends PureComponent<*, AppState> {
  state = {
    user: null,
    userProfile: null,
    userProfileRef: null,
    color: '',
    name: '',
  }

  authStateChanged = (user: ?FirebaseUser) => this.setState(state => ({
    user,
    userProfile: user ? state.userProfile : null,
    userProfileRef: user ? User.userProfile(user.uid) : null,
  }))

  updateProfile = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { user, color, name } = this.state

    const data = {
      name,
      favoriteColor: color,
    }

    User.userProfile(user.uid).set(data, { merge: true })
  }

  onUpdateProfile = (p: DocumentSnapshot) => {
    const data = p.data()
    const newProfileState = state => ({
      userProfile: p.exists ? data : null,
      color: p.exists ? data.favoriteColor : state.color,
      name: p.exists ? data.name : state.name,
    })
    this.setState(newProfileState)
  }

  onChangeColor: OnChangeHandler = ({ target: { value: color } }) => this.setState(() => ({
    color,
  }))

  onChangeName: OnChangeHandler = ({ target: { value: name } }) => this.setState(() => ({
    name,
  }))

  render() {
    const {
      user,
      userProfile,
      userProfileRef,
      name,
      color,
    } = this.state

    return (
      <div className="App">
        <Container
          user={user}
          userProfile={userProfile}
          updateProfile={this.updateProfile}
          onAuthStateChanged={this.authStateChanged}
          firestoreRef={userProfileRef}
          onSnapshot={this.onUpdateProfile}
          firebaseAuth={firebase.auth()}
          form={{
            name,
            color,
          }}
          onChangeUserColor={this.onChangeColor}
          onChangeUserName={this.onChangeName}
        />
      </div>
    );
  }
}

export default App;
