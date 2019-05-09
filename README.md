# 🔥 react-firebase-subscribable 🔥

[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/react-firebase-subscribable.svg)](https://www.npmjs.com/package/react-firebase-subscribable)
[![CircleCI (all branches)](https://img.shields.io/circleci/project/github/pdeona/-react-firebase-subscribable.svg)](https://circleci.com/gh/pdeona/-react-firebase-subscribable)
[![GitHub issues](https://img.shields.io/github/issues-raw/pdeona/-react-firebase-subscribable.svg)](https://github.com/pdeona/-react-firebase-subscribable)

`react-firebase-subscribable` is a component library for handling Firebase Authentication and Firestore/RTDB subscriptions.

## Table of Contents

[Installation](#installation)

[Usage](#usage)

- [Context API](#context-api):
  - [Auth](#auth)
    - [Firebase Auth Provider](#firebase-auth-provider)
    - [connectAuth](#connectauth)
  - [Firestore](#firestore)
    - [Firestore Provider](#firestore-provider)
    - [connectFirestore](#connectfirestore)
    - [useInjected](#useinjected)

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

### Context API

`react-firebase-subscribable` exports `Provider` components and `connect` functions for using Auth/Firestore state via the context API. Auth state is separated from database subscriptions so the module exports separate Provider/connect functions for each:

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
  onAuthStateChanged,
})

export default connect(
  null,
  mapDispatchToProps,
)(AuthConnectedRoot)
```

#### connectAuth

A function that accepts a function `mapAuthStateToProps` and returns a function that accepts a component.

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
  user,
})

export default connectAuth(mapAuthStateToProps)(CurrentUser)
```

### Firestore

#### Firestore Provider

Props:

| Name        | Type                            | Required |
| ----------- |:-------------------------------:| --------:|
| initialRefs | object (see below.)             | false    |

```ts
type FirestoreProviderProps = {
  initialRefs: object<string, firestore.DocumentReference | firestore.CollectionReference | firestore.QueryReference>,
}
```

```js
// in root component
import React from 'react'
import { FirestoreProvider } from 'react-firebase-subscribable'
import App from 'components/App'
import firebase from 'firebase'

const initialRefs = {
  allUsers: firebase.firestore().collection('all-users'),
}

const FirestoreConnectedRoot = () => (
  <FirestoreProvider initialRefs={initial}>
    <App />
  </FirestoreProvider>
)

export default FirestoreConnectedRoot
```

#### connectFirestore

A function that accepts a function `mapSnapshotsToProps` and a list of `injectedRefs` and returns a function that accepts a component.

##### mapSnapshotsToProps

`mapSnapshotsToProps` will receive the current `store`'s corresponding snapshots as an argument:

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

const mapSnapshotsToProps = ({ userProfile: { value, error } }) => ({
  userProfile: !error && value ? value.data() : null,
  profileError: error ? value : null,
})

export default connectFirestore(mapSnapshotsToProps)(CurrentUserProfile)
```

##### injectedRefs

`injectedRefs` can be passed into any firestore-connected component, and should have the form:

```ts
{
  [key: string]: firestore.Reference |
                 (props) => firestore.Reference | null,
}
```

If the provided `ref` is a function it will be called with the component's props

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
const mapSnapshotsToProps = ({
  userProfile: { value: profileValue, error: profileError },
  allProfiles: { value: allProfiles, error: allProfilesError },
}) => ({
  userProfile: !profileError && profileValue ? profileValue.data() : null,
  otherProfiles: !allProfilesError && allProfiles.docs,
})

// ref can be a function, will be called with (props) as an arg
const injectedRefs = {
  userProfile: ({ user }) => user
    ? firebase.firestore().collection('user-profiles').doc(user.uid)
    : null,
  allProfiles: firebase.firestore().collection('user-profiles'),
}

// inject userProfileRef using key 'userProfile'
const withFirestore = connectFirestore(
  mapSnapshotsToProps,
  injectedRefs,
)

export default withFirestore(CurrentUserProfile)
```

#### useInjected

The `useInjected` hook can be used to manually connect a component to the Firestore Provider, and has the same API as `connectFirestore`:

```js
import React from 'react'
import { useInjected } from 'react-firebase-subscribable'

const mapSnapshots = ({ userProfile: { value, error } }) => ({
  userProfile: !error && value ? value.data() : null,
  profileError: error ? value : null,
})

const CurrentUserProfile = ({ user }) => {
  const { userProfile } = useInjected(mapSnapshots, {
    userProfile: ({ user }) => user
      ? firebase.firestore().collection('user-profiles').doc(user.uid)
      : null,
    allProfiles: firebase.firestore().collection('user-profiles'),
  })
  return (
  <div>
    {userProfile
      ? <div>Welcome back, {userProfile.name}!</div>
      : <div>Sign in to view profile</div>
    }
  </div>
)

export default CurrentUserProfile
```

### Examples

[Provider/connect example](https://github.com/pdeona/-react-firebase-subscribable/tree/master/store-example)

## Bugs, Pull Requests

[Pull requests, feature requests, bug reports welcome](https://github.com/pdeona/-react-firebase-subscribable)
