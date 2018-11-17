import React from 'react'
import firebase from './firebase'
import Container from './components/Container'
import './App.css'

const App = () => (
  <div className="App">
    <Container
      firebaseAuth={firebase.auth()}
    />
  </div>
)

export default App
