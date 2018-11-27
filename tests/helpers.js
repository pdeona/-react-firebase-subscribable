const mockCleanup = jest.fn()

const mockSnapshot = {
  data: jest.fn(() => 'mock value'),
}

const mockDocument = jest.fn(() => ({
  onSnapshot: jest.fn(cb => {
    cb(mockSnapshot)
    setTimeout(cb(mockSnapshot), 50)
    return mockCleanup
  }),
  get: jest.fn(() => new Promise(res => res(mockSnapshot))),
}))

mockSnapshot.ref = mockDocument

const mockCollection = jest.fn(collectionPath => ({
  doc: mockDocument,
  get: new Promise(res => res([mockDocument])),
  path: collectionPath,
}))

mockDocument.parent = mockCollection

const mockFirestore = {
  firestore: jest.fn(() => ({
    collection: mockCollection,
  }))
}

export {
  mockFirestore,
  mockCleanup,
  mockDocument,
  mockCollection,
  mockSnapshot,
}
