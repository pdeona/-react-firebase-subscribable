# react-firebase-subscribable

Higher order components to wrap React Components in Firebase Auth/Firestore real-time subscriptions.

## Dependencies:

  - No dependencies, peer dependency on React.

## Usage:

### As Decorators

Both `withAuthSubscription` and `withFirestoreSubscription` work with the ES7 decorator proposal syntax for class decorators:
```js
@withAuthSubscription
@withFirestoreSubscription
```

To enable support in your app, you need to add `@babel/plugin-proposal-decorators` to your project and add the following to your `.babelrc`:

```json
{
  "plugins": [
    ["@babel/plugin-proposal/decorators", { "legacy": true }]
  ]
}
```

See the example in <https://github.com/pdeona/-react-firebase-subscribable/tree/decorator-example/example>

### withAuthSubscription

Props:

| Name               | Type                   | Required |
| ------------------ |:----------------------:| --------:|
| firebaseAuth       | Firebase Auth Instance | true     |
| onAuthStateChanged | function               | true     |


```js
import React from 'react'
import { withAuthSubscription } from 'react-firebase-subscribable'

/**
 *  as a decorator
 **/
@withAuthSubscription
class CurrentUser extends Component {
  render() {
    const { user } = this.props
    return (
      <div>
        {user ? JSON.stringify(user) : 'Not signed in'}
      </div>
    )
  }
}

export default CurrentUser

/**
 *  as a function
 **/
const CurrentUser = ({ user }) => (
  <div>
    {user ? JSON.stringify(user) : 'Not signed in'}
  </div>
)

export default withAuthSubscription(CurrentUser)
```

```js
import React, { PureComponent } from 'react'
import firebase from 'firebase' // firebase auth passed in as prop
import CurrentUser from './CurrentUser'

export default class App extends PureComponent {
  state = {
    user: null,
  }
  
  onAuthStateChanged = user => this.setState(() => ({
    user,
  }))

  render() {
    return (
      <CurrentUser
        user={this.state.user}
        onAuthStateChanged={this.onAuthStateChanged}
        firebaseAuth={firebase.auth(YOUR_APP_CONFIG)}
      />
    )
  }
}
```

### withFirestoreSubscription

withFirestoreSubscription will cleanup/re-initialize snapshot listeners any time firestoreRef changes.
To use dynamic subscriptions simply pass in null when the desired value isn't available:
`firestoreRef={currentUser ? firestore.collections('user-profiles').doc(currentUser.id) : null}`

Props:

| Name               | Type                   | Required                                     |
| ------------------ |:----------------------:| -------------------------------------------: |
| firestoreRef       | Firestore Reference    | false (if null, no listener is attached)     |
| onAuthStateChanged | function               | true                                         |

```js
import React, { Component } from 'react'
import { withFirestoreSubscription } from 'react-firebase-subscribable'

/**
 *  as a decorator
 **/
@withFirestoreSubscription
class NameInDB extends Component {
  render() {
    return (
      <div>
        {this.props.name}
      </div>
    )
  }
}

export default NameInDB

/**
 *  as a function
 **/
const NameInDB = ({ name }) => (
  <div>
    {name}
  </div>
)

export default withFirestoreSubscription(NameInDB)
```

```js
import React, { PureComponent } from 'react'
import firebase from 'firebase' // firestore ref passed in as prop
import NameInDB from './NameInDB'

export default class App extends PureComponent {
  state = {
    name: '',
  }
  
  onSnapshot = doc => this.setState(() => ({
    name: doc.data() || '',
  }))

  render() {
    return (
      <NameInDB
        name={this.state.name}
        firestoreRef={firebase.firestore(APP_CONFIG).collection('name').doc('mine')}
        onSnapshot={this.onSnapshot}
      />
    )
  }
}
```

See example for a more complete sample app.

## Bugs, Pull Requests

https://github.com/pdeona/-react-firebase-subscribable

