import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

firebase.initializeApp({
  apiKey: 'AIzaSyCtVFuTOHHXBRhrGg5KEeM-VOZ84WcMiIM',
  authDomain: 'react-subscribable-test.firebaseapp.com',
  databaseURL: 'https://react-subscribable-test.firebaseio.com',
  projectId: 'react-subscribable-test',
  storageBucket: 'react-subscribable-test.appspot.com',
  messagingSenderId: '775677578700'
})

const firestore = firebase.firestore()
const settings = { timestampsInSnapshots: true }
firestore.settings(settings)

export default firebase
