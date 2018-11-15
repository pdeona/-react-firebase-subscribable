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

  updateProfile = event => {
    event.preventDefault()
    const { user, color, name } = this.state

    const data = {
      name,
      favoriteColor: color,
    }

    User.userProfile(user.uid).set(data, { merge: true })
  }

  onUpdateProfile = p => {
    const data = p.data()
    const newProfileState = state => ({
      userProfile: p.exists ? data : null,
      color: p.exists ? data.favoriteColor : state.color,
      name: p.exists ? data.name : state.name,
    })
    this.setState(newProfileState)
  }

  onChangeColor = ({ target: { value: color } }) => this.setState(() => ({
    color,
  }))

  onChangeName = ({ target: { value: name } }) => this.setState(() => ({
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
