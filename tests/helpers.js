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

export {
  AuthSubscriber,
  DBSubscriber,
}
