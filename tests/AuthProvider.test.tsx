import React, { ReactNode, FC, useState } from 'react'
import { render, cleanup } from 'react-testing-library'
import { mockAuth, User, sendNext } from './helpers'
import * as snaps from './auth.snaps'
import { FirebaseAuthProvider } from '../src'

const failAuth = () => ({
  onAuthStateChanged: () => { throw new Error('Error') }
})

type RootProps = {
  auth?: typeof mockAuth | typeof failAuth,
}

type DummyProps = {
  user: User | null,
}

const Dummy: FC<DummyProps> = ({ user }) => (
  <span data-testid="child">{user ? String(user.uid) : null}</span>
)

const Root: FC<RootProps> = ({ children, auth = mockAuth }) => {
  const [u, setU] = useState(null)
  return (
    <div data-testid='parent'>
      <FirebaseAuthProvider
        firebaseAuth={(auth as any)() as firebase.auth.Auth}
        onAuthStateChanged={setU}
      >
        {children}
      </FirebaseAuthProvider>
      <Dummy user={u} />
    </div>
  )
}

const newU = new User(1)

describe('Auth Provider', () => {
  afterEach(cleanup)

  it('accepts an onAuthStateChange function', () => {
    sendNext(null)
    const { getByTestId } = render(
      <Root />
    )
    const node = getByTestId('child')
    expect(node).toMatchInlineSnapshot(`
      <span
        data-testid="child"
      />
    `)
    sendNext(newU)
    expect(node).toMatchInlineSnapshot(snaps.USER_1('child'))
  })

  it('logs subscription errors only in development', () => {
    const oldE = console.error
    const mockE = jest.fn()
    console.error = mockE
    const r = () => render(
      <Root auth={failAuth}/>
    )
    r()
    cleanup()
    expect(mockE).not.toBeCalled()
    process.env.NODE_ENV = 'development'
    r()
    expect(mockE).toBeCalledWith(
      'Auth Subscription error: ', new Error('Error')
    )
    process.env.NODE_ENV = 'test'
  })
})
