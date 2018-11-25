import React, { Component } from 'react'
import User from '../../models/user'
import Container from '../Container'
import './App.css'

class App extends Component {
  onChangeColor = ({ target: { value: color } }) => User.userProfile(this.props.user.uid)
    .set({ favoriteColor: color }, { merge: true })

  onChangeName = ({ target: { value: name } }) => User.userProfile(this.props.user.uid)
    .set({ name }, { merge: true })

  render() {
    return (
      <div className="App">
        <Container
          onChangeUserName={this.onChangeName}
          onChangeUserColor={this.onChangeColor}
        />
      </div>
    )
  }
}

export default App
