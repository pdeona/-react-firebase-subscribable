import {
  diffRequiredProps,
  RequiredPropError,
} from '../src/shared'

describe('RequiredPropsError tests', () => {
  test('it accepts a component name, prop name and message', () => {
    const e = new RequiredPropError('test', 'prop', 'message')
    expect(e.message).toEqual('test did not receive prop as a prop. message')
  })
})

describe('diffRequiredProps tests', () => {
  const mockError = jest.fn()
  let oldConsole
  beforeAll(() => {
    process.env.NODE_ENV = 'development'
    oldConsole = console
    global.console = {
      error: mockError,
    }
  })

  afterAll(() => {
    global.console = oldConsole
    process.env.NODE_ENV = 'test'
  })

  const props = {
    mockPropFn: () => {},
    mockPropString: 'string',
    mockPropObject: {},
    mockPropCustom: {
      onSnapshot: () => {},
    },
  }
  const componentName = 'TestComponent'
  const newError = (propName, message = `${propName} is required`) => new RequiredPropError(componentName, propName, message)
  const testCases = [
    [[componentName, props], []],
    [[componentName, props, { propName: 'prop' }], []],
    [[componentName, props, {
      propName: 'mockPropFn',
      propType: 'function',
    }], []],
    [[componentName, props, {
      propName: 'mockPropCustom',
      predicate: prop => prop.onSnapshot && typeof prop.onSnapshot === 'function',
      message: 'Custom prop is supposed to have onSnapshot'
    }], []],
    [[componentName, props, {
      propName: 'mockPropCustom',
      predicate: prop => typeof prop.fakeFunction === 'function',
      message: 'a message',
    }], [newError('mockPropCustom', 'a message')]],
    [[componentName, props, {
      propName: 'mockPropCustom',
      predicate: prop => typeof prop.fakeFunction === 'function',
    }], [newError('mockPropCustom')]],
    [[componentName, props, {
      propName: 'mockPropString',
      propType: 'function',
    }], [newError(
      'mockPropString',
      'mockPropString is required and should be a function',
    )]],
    [[componentName, props, {
      propName: 'mockPropObject',
      propType: 'object',
    }], []],
    [[componentName, props, {
      propName: 'mockFailedOne',
      propType: 'object',
    }, {
      propName: 'mockFailedTwo',
      predicate: () => false,
    }], [
      newError('mockFailedOne', 'mockFailedOne is required and should be a object'),
      newError('mockFailedTwo'),
    ]],
  ]
  const runTestCase = ([args, expectedOutput]) => {
    test(`diffRequiredProps: ${JSON.stringify(args.slice(2))}`, () => {
      const output = diffRequiredProps(...args)
      expect(output).toEqual(expectedOutput)
      expectedOutput.forEach(err => {
        expect(mockError).toBeCalledWith(err)
      })
    })
  }
  testCases.forEach(runTestCase)
})
