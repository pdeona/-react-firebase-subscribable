# 🔥 react-firebase-subscribable 🔥

[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/react.svg)](https://www.npmjs.com/package/react-firebase-subscribable)

[![CircleCI (all branches)](https://img.shields.io/circleci/project/github/pdeona/-react-firebase-subscribable.svg)](https://circleci.com/gh/pdeona/-react-firebase-subscribable)

[![GitHub issues](https://img.shields.io/github/issues-raw/pdeona/-react-firebase-subscribable.svg)](https://github.com/pdeona/-react-firebase-subscribable)

`react-firebase-subscribable` is a component library for handling Firebase Authentication and Firestore/RTDB subscriptions. 

##### This is the experimental Hooks API alpha release of `react-firebase-subscribable`. Be sure not to use this one in production, as it depends on react@16.7.0-alpha and the API may change.

## Table of Contents

[Installation](#installation)

[Usage](#usage)

- [As Decorators](#as-decorators)
- [withAuthSubscription](#withauthsubscription)
- [withFirestoreSubscription](#withfirestoresubcription)
- [withRTDBSubscription](#withrtdbsubscription)
- [Context API](#context-api):
  - [Auth](#auth)
    - [Firebase Auth Provider](#firebase-auth-provider)
    - [connectAuth](#connectauth)
  - [Firestore](#firestore)
    - [createRefMap](#createrefmap)
    - [Firestore Provider](#firestore-provider)
    - [connectFirestore](#connectfirestore)
- [Hooks](#hooks)
  - [useAuthSubscription](#useauthsubscription)
  - [useFirestoreSubscription](#usefirestoresubcription)
  - [useRTDBSubscription](#usertdbsubscription)

[Examples](#examples)

[Dependencies](#dependencies)

[Bugs, Pull Requests](#bugs-pull-requests)

## Installation

This package is hosted on `npm`. To add it to your node project, use:

```bash
npm i -S react-firebase-subscribable
# with yarn
yarn add react-firebase-subscribable
```

A UMD build is also available for browsers via `unpkg`:

```html
<script
  src="https://unpkg.com/react-firebase-subscribable@1.0.21/dist/react-firebase-subscribable.umd.js"
>
</script>
```

Note: you will need load the [dependencies](#dependencies) before this tag to use this library

## Usage

### As Decorators

All HOC exports can be used as class decorators:

```js
@withAuthSubscription
@withFirestoreSubscription
@withRTDBSubscription
@connectAuth(mapAuthStateToProps)
@connectFirestore(mapSnapshotsToProps, ...injectedRefs)
```

To enable support in your app, you need to add `@babel/plugin-proposal-decorators` to your project and add the following to your `.babelrc`:

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ]
}
```

See the example in <https://github.com/pdeona/-react-firebase-subscribable/tree/master/example-with-decorators>

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
To use dynamic references simply pass in null when the desired value isn't available:
`firestoreRef={currentUser ? firebase.firestore().collection('user-profiles').doc(currentUser.id) : null}`

Props:

| Name               | Type                   | Required                                     |
| ------------------ |:----------------------:| -------------------------------------------: |
| firestoreRef       | Firestore Reference    | false (if null, no listener is attached)     |
| onSnapshot         | function               | true                                         |

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

### withRTDBSubscription

withRTDBSubscription will cleanup/re-initialize snapshot listeners any time firebaseRef changes.
This component also allows an eventType to be provided, for listeners on lists. The default
value for `eventType` is `"value"`.

To use dynamic references simply pass in null when the desired value isn't available:
`firebaseRef={currentUser ? firebase.database().ref('user-profiles').child(currentUser.id) : null}`

Props:

| Name               | Type                   | Required                                   |
| ------------------ |:----------------------:| -----------------------------------------: |
| firebaseRef        | Firebase DB Reference  | false (if null, no listener is attached)   |
| onSnapshot         | function               | true                                       |
| eventType          | enum                   | false; default = 'value'; see [EventTypes](#event-types)   |

#### Event Types

- "value"
- "child_added"
- "child_changed"
- "child_removed"
- "child_moved"

Note: Firestore is in beta, however it is recommended if you are building a new app to use Firestore over the legacy RTDB. Some of the advantages include:

- Document References
- A more intuitive and powerful query API
- More scalability and better performance for apps that handle a large amount of data
- Less data denormalization required

Read more here: [Real-Time Database vs. Firestore](https://firebase.google.com/docs/database/rtdb-vs-firestore)

```js
import React, { Component } from 'react'
import { withRTDBSubscription } from 'react-firebase-subscribable'

/**
 *  as a decorator
 **/
@withRTDBSubscription
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

export default withRTDBSubscription(NameInDB)
```

```js
import React, { PureComponent } from 'react'
import firebase from 'firebase' // firebase db ref passed in as prop
import NameInDB from './NameInDB'

export default class App extends PureComponent {
  state = {
    name: '',
  }
  
  onChange = doc => this.setState(() => ({
    name: doc.val() || '',
  }))

  render() {
    return (
      <NameInDB
        name={this.state.name}
        firebaseRef={firebase.database(APP_CONFIG).ref('name').child('mine')}
        onChange={this.onChange}
        eventType="value"
      />
    )
  }
}
```

### Context API

`react-firebase-subscribable` exports `Provider` components and `connect` functions for using Auth/Firestore state via the context API. The API is modeled after `redux` with individual components being wrapped in a context consumer and passed the desired state fields. As with the above HOC's, auth state is separated from database subscriptions so the module exports separate Provider/connect functions for each:

### Auth

#### Firebase Auth Provider

Props:

| Name               | Type                   | Required |
| ------------------ |:----------------------:| --------:|
| firebaseAuth       | Firebase Auth Instance | true     |
| onAuthStateChanged | Function               | false    |

`onAuthStateChanged` can be provided to inform external stores of changes to auth state without nesting them inside of `Firebase Auth Provider`, such as if you want to nest it in an existing redux store and dispatch actions to update the store on auth state change, so you can simply use one `connect` if you are already using redux.

Usage:

```js
// in root component
import React from 'react'
import { FirebaseAuthProvider } from 'react-firebase-subscribable'
import App from 'components/App'
import firebase from 'firebase'

const AuthConnectedRoot = () => (
  <FirebaseAuthProvider firebaseAuth={firebase.auth()}>
    <App />
  </FirebaseAuthProvider>
)

export default AuthConnectedRoot

/**
 * with a redux store
 * Note: this component must be rendered as a child to Redux's
 * Provider component for this example to work.
 **/
import React from 'react'
import { connect } from 'react-redux'
import { FirebaseAuthProvider } from 'react-firebase-subscribable'
import App from 'components/App'
import { onAuthStateChanged } from '../actions/auth'
import firebase from 'firebase'

const AuthConnectedRoot = ({ onAuthStateChanged }) => (
  <FirebaseAuthProvider
    firebaseAuth={firebase.auth()}
    onAuthStateChanged={onAuthStateChanged}
  >
    <App />
  </FirebaseAuthProvider>
)

const mapDispatchToProps = dispatch => ({
  onAuthStateChanged: user => dispatch(onAuthStateChanged(user)),
})

export default connect(null, mapDispatchToProps)(AuthConnectedRoot)
```

#### connectAuth

A function that accepts a function `mapAuthStateToProps` and returns a function that accepts a component. Used similarly to `react-redux`'s `connect`.

##### mapAuthStateToProps

`mapAuthStateToProps` should accept the current user and return a `props` object to be applied to the wrapped component:

```js
// in consumer components
import React from 'react'
import { connectAuth } from 'react-firebase-subscribable'

const CurrentUser = ({ user }) => (
  <div>
    {user ? user.uid : 'Not signed in'}
  </div>
)

const mapAuthStateToProps = user => ({
  currentUser: user,
})

export default connectAuth(mapAuthStateToProps)(CurrentUser)
```

### Firestore

#### createRefMap

A function that returns an observable refmap for the provider to subscribe to. accepts an optional `initialRefMap`, where each key is a string and each value is a ref or null, and returns a `refMap` that can be passed into the Provider.

#### Firestore Provider

Props:

| Name        | Type                                         | Required |
| ----------- |:--------------------------------------------:| --------:|
| refMap      | returned from `createRefMap`                 | true     |

`refMap` is the return value of calling `createRefMap` with an optional `initialRefMap`

```js
// in root component
import React from 'react'
import { FirestoreProvider, createRefMap } from 'react-firebase-subscribable'
import App from 'components/App'
import firebase from 'firebase'

const refMap = createRefMap()

const FirestoreConnectedRoot = () => (
  <FirestoreProvider refMap={refMap}>
    <App />
  </FirestoreProvider>
)

export default FirestoreConnectedRoot
```

#### connectFirestore

A function that accepts a function `mapSnapshotsToProps` and a list of `injectedRefs` and returns a function that accepts a component. Used similarly to `react-redux`'s `connect`.

##### mapSnapshotsToProps

`mapSnapshotsToProps` will receive the current `refMap`'s corresponding snapshots as values in an object with the same keys:

```js
// in consumer components
import React from 'react'
import { connectFirestore } from 'react-firebase-subscribable'

const CurrentUserProfile = ({ userProfile }) => (
  <div>
    {userProfile
      ? <div>Welcome back, {userProfile.name}!</div>
      : <div>Sign in to view profile</div>
    }
  </div>
)

const mapSnapshotsToProps = ({ userProfile }) => ({
  userProfile: userProfile ? userProfile.data() : null,
})

export default connectFirestore(mapSnapshotsToProps)(CurrentUserProfile)
```

##### injectedRefs

`...injectedRefs` can be passed into any firestore-connected component, and should have the form { key: string, ref: (Firestore Reference | Function) }. if the provided ref is a function it will be called with the component's props:

```js
import React from 'react'
import { connectFirestore } from 'react-firebase-subscribable'

const CurrentUserProfile = ({ userProfile }) => (
  <div>
    {userProfile
      ? <div>Welcome back, {userProfile.name}!</div>
      : <div>Sign in to view profile</div>
    }
  </div>
)

// userProfile will be injected when this component connects
/**
 *  mapSnapshotsToProps can be null if you do not want the
 *  component to receive snapshot updates, but still want to inject
 *  refs.
 **/
const mapSnapshotsToProps = ({ userProfile }) => ({
  userProfile: userProfile ? userProfile.data() : null,
})

// ref can be a function, will be called with (props) as an arg
const userProfileRef = ({ user }) => (user
  ? firebase.firestore().collection('user-profiles').doc(user.uid)
  : null)

// inject userProfileRef using key 'userProfile'
const withFirestoreState = connectFirestore(mapSnapshotsToProps, { key: 'userProfile', ref: userProfileRef })

export default withFirestoreState(CurrentUserProfile)
```


### Hooks

Note: The hooks API is still unreleased and likely to change. This version should not be used in production.

### useAuthSubscription

useAuthSubscription is a function that accepts a firebase auth instance. the return value (`user` below) will be set upon auth state change.

```js
import React from 'react'
import firebase from 'firebase'
import { useAuthSubscription } from 'react-firebase-subscribable'

const App = () => {
  const user = useAuthSubscription(firebase.auth())
  return (
    <div>
      {user ? 'Signed in' : 'Signed out'}
    </div>
  )
}

export default App
```

### useFirestoreSubscription

useFirestoreSubscription is a function that accepts an optional firestore reference. the return value will be updated whenever the data snapshot changes, and the listener subscription will be reinitialized/cleaned up on ref change.

```js
import React from 'react'
import firebase from 'firebase'
import { useFirestoreSubscription } from 'react-firebase-subscribable'

const UserProfile = ({ user }) => {
  const userRef = user
    ? firebase.firestore().collection('names').doc(user.uid)
    : null
  const userProfile = useFirestoreSubscription(userRef)
  return (
    <div>
      {
        userProfile ?
          <span>{userProfile.data().name}</span> :
          <span>Sign in to view your profile</span>
      }
    </div>
  )
}

export default UserProfile
```

### useRTDBSubscription

useRTDBSubscription is a function that accepts an optional real-time database reference and event type (default is `value`). the return value will be updated whenever the data snapshot changes, and the listener subscription will be reinitialized/cleaned up on ref change.

```js
import React from 'react'
import firebase from 'firebase'
import { useRTDBSubscription } from 'react-firebase-subscribable'

const UserProfile = ({ user }) => {
  const userRef = user
    ? firebase.database().ref(`names/${user.uid}`)
    : null
  const userProfile = useRTDBSubscription(userRef)
  return (
    <div>
      {
        userProfile ?
          <span>{userProfile.val().name}</span> :
          <span>Sign in to view your profile</span>
      }
    </div>
  )
}

export default UserProfile
```

### Examples

[vanilla React](https://github.com/pdeona/-react-firebase-subscribable/tree/master/example)

[with Recompose](https://github.com/pdeona/-react-firebase-subscribable/tree/master/example-with-recompose)

[as Decorators](https://github.com/pdeona/-react-firebase-subscribable/tree/master/example-with-decorators)

[Provider/connect example](https://github.com/pdeona/-react-firebase-subscribable/tree/master/store-example)

## Dependencies

- `react` `^16.6.0`
- `symbol-observable` `^1.2.0`
- `hoist-non-react-statics` `^3.1.0`

### Peer Dependencies

- `react-dom` `^16.6.0`

## Bugs, Pull Requests

[Pull requests, feature requests, bug reports welcome](https://github.com/pdeona/-react-firebase-subscribable)
