import firebase from '../firebase'

export default class User {
  static signInWithEmailAndPassword(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password)
  }

  static signInAnonymously() {
    return firebase.auth().signInAnonymously()
  }

  static signOut() {
    return firebase.auth().signOut()
  }

  static get profileCollection() {
    return firebase.firestore().collection('user-profiles')
  }

  static userProfile(userID: string) {
    return this.profileCollection.doc(userID)
  }
}
