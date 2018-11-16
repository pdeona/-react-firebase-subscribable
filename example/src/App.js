import React, { PureComponent } from 'react'
import firebase from './firebase'
import Container from './components/Container'
import User from './models/user'
import './App.css'

class App extends PureComponent {
  state = {
    user: null,
    userProfile: null,
    userProfileRef: null,
    color: '',
    name: '',
  }

  authStateChanged = user => this.setState(state => ({
    user,
    userProfile: user ? state.userProfile : null,
    userProfileRef: user ? User.userProfile(user.uid) : null,
  }))

  onUpdateProfile = p => {
    const data = p.data()
    const newProfileState = state => ({
      userProfile: data,
      color: data ? data.favoriteColor : '',
      name: data ? data.name : '',
    })
    this.setState(newProfileState)
  }

  onChangeColor = ({ target: { value: color } }) => User.userProfile(this.state.user.uid).set({ favoriteColor: color }, { merge: true })

  onChangeName = ({ target: { value: name } }) => User.userProfile(this.state.user.uid).set({ name }, { merge: true })

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
