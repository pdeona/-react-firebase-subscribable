import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

firebase.initializeApp({
  apiKey: 'AIzaSyB8zi_IM-VAZYHYIoUmcHZzqwFPfLH5D6g',
  authDomain: 'react-firebase-test-92c87.firebaseapp.com',
  databaseURL: 'https://react-firebase-test-92c87.firebaseio.com',
  projectId: 'react-firebase-test-92c87',
  storageBucket: 'react-firebase-test-92c87.appspot.com',
  messagingSenderId: '772934497705'
})

export default firebase
