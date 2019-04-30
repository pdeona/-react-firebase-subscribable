import { Subject } from 'rxjs'
import { act } from 'react-testing-library'

const mockCleanup = jest.fn()

const mockSnapshot: any = jest.fn((data = 'mock value') => ({
  data: jest.fn(() => data),
}))

const mockDocument: any = jest.fn(path => {
  const out = {
    path,
    id: path,
    get: jest.fn(() => new Promise(res => res(mockSnapshot()))),
    subscriber: null,
    onSnapshot: null,
  }
  out.onSnapshot = jest.fn(cb => {
    out.subscriber = cb
    if (cb.next) cb.next(mockSnapshot()) 
    else cb(mockSnapshot())
    return mockCleanup
  })
  return out
})

mockSnapshot.ref = mockDocument

const mockCollection = jest.fn(collectionPath => ({
  doc: mockDocument,
  get: new Promise(res => res([mockDocument])),
  path: collectionPath,
}))

mockDocument.parent = mockCollection

const mockFirestore = () => ({
  collection: mockCollection,
})

const connectedNode = getfn => getfn('connected')

class User {
  uid: number;

  constructor(uid: number) {
    this.uid = uid
  }
}

const uStream = new Subject()

const mockAuth = jest.fn(() => ({
  onAuthStateChanged(callback: (u: User | null) => void) {
    const sub = uStream.subscribe(callback)
    return () => sub.unsubscribe()
  },
}))

const sendNext: <T>(n: T | null) => void = next => act(() => {
  uStream.next(next)
})

export {
  mockFirestore,
  mockCleanup,
  mockDocument,
  mockCollection,
  mockSnapshot,
  mockAuth,
  connectedNode,
  User,
  uStream,
  sendNext,
}
