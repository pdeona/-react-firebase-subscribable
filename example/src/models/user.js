// @flow
import typeof { FirebaseUserCredential } from 'firebase/auth'
import type { CollectionReference, DocumentReference } from 'firebase/firestore'
import firebase from '../firebase'

type Color = 'Red' | 'Yellow' | 'Blue' | 'Green'

export type UserDatabaseRecord = {
  +name: string,
  +favoriteColor: Color,
}

export default class User {
  static signInWithEmailAndPassword(email: string, password: string): Promise<FirebaseUserCredential> {
    return firebase.auth().signInWithEmailAndPassword(email, password)
  }

  static signInAnonymously(): Promise<FirebaseUserCredential> {
    return firebase.auth().signInAnonymously()
  }

  static signOut(): Promise<void> {
    return firebase.auth().signOut()
  }

  static get profileCollection(): CollectionReference {
    return firebase.firestore().collection('user-profiles')
  }

  static userProfile(userID: string): DocumentReference {
    return this.profileCollection.doc(userID)
  }
}
