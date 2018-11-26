import React, { PureComponent } from 'react'
import { withAuthSubscription, withFirestoreSubscription } from '../src'

@withAuthSubscription
class AuthSubscriber extends PureComponent {
  render() {
    const { user } = this.props
    return user ? 'Signed in' : 'Not signed in'
  }
}

@withFirestoreSubscription
class DBSubscriber extends PureComponent {
  render() {
    const { name } = this.props
    return name
  }
}

const mockSnapshot = {
  data: jest.fn(() => 'mock value')
}

const mockCollection = jest.fn(() => ({
  onSnapshot(cb) {
    cb(mockSnapshot)
    return mockCleanup
  },
}))

const mockFirestore = {
  firestore: jest.fn(() => ({
    collection: jest.fn
  }))
}

export {
  AuthSubscriber,
  DBSubscriber,
  mockFirestore,
}
