import React from 'react'
import {
  useAuthSubscription,
} from 'react-firebase-subscribable'
import firebase from './firebase'
import Container from './components/Container'
import User from './models/user'
import './App.css'

function App() {
  const user = useAuthSubscription(firebase.auth())

  return (
    <div className="App">
      <Container
        user={user}
        userProfileRef={user && User.userProfile(user.uid)}
      />
    </div>
  );
}

export default App;
