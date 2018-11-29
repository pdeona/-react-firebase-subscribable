const mockCleanup = jest.fn()

const mockSnapshot = {
  data: jest.fn(() => 'mock value'),
}

const mockDocument = jest.fn(path => ({
  onSnapshot: jest.fn(cb => {
    cb(mockSnapshot)
    return mockCleanup
  }),
  path,
  get: jest.fn(() => new Promise(res => res(mockSnapshot))),
}))

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

export {
  mockFirestore,
  mockCleanup,
  mockDocument,
  mockCollection,
  mockSnapshot,
}
