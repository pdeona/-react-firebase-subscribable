import React, { Component } from 'react';
import { connectAuthState } from 'react-firebase-subscribable'
import logo from './logo.svg';
import './App.css';

class App extends Component {
  onChangeColor = ({ target: { value: color } }) => 
    User.userProfile(this.props.user.uid)
      .set({ favoriteColor: color }, { merge: true })

  onChangeName = ({ target: { value: name } }) =>
    User.userProfile(this.props.user.uid)
      .set({ name }, { merge: true })

  render() {
    return (
      <div className="App">
        <Container
          onChangeUserName={this.onChangeName}
          onChangeUserColor={this.onChangeColor}
        />
      </div>
    );
  }
}

const mapAuthStateToProps = user => ({ user })

export default connectAuthState(mapAuthStateToProps)(App);
