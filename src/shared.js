// @flow
import type {
  RequiredPropSpec,
} from 'react-firebase-subscribable'

const requiredPropErrorMsg = (componentName: string, propName: string, message: string): string => `${componentName} did not receive ${propName} as a prop. ${message}`

export class RequiredPropError extends Error {
  constructor(componentName: string, propName: string, message: string) {
    super(requiredPropErrorMsg(componentName, propName, message))
  }
}

export const diffRequiredProps = (
  componentName: string,
  props: { +[key: string]: * },
  ...requiredProps: RequiredPropSpec[]
): RequiredPropError[] => {
  const errors: Array<string[] | null> = requiredProps.map((spec: RequiredPropSpec): string[] | null => {
    if (spec.predicate) {
      const { propName, predicate, message } = spec
      return !predicate(props[propName]) ? [
        componentName,
        propName,
        message || `${propName} is required`,
      ] : null
    }
    if (spec.propType) {
      const { propName, propType } = spec
      return typeof props[propName] !== propType ? [ // eslint-disable-line valid-typeof
        componentName,
        propName,
        `${propName} is required and should be a ${propType}`,
      ] : null
    }
    return null
  })
  return errors
    .filter(e => !!e)
    .map(err => {
      // $FlowFixMe filtered arrays aren't properly type-checked
      const e = new RequiredPropError(...err)
      console.error(e)
      return e
    })
}

const shallowEqual = (a: any, b: any): boolean => {
  if (a === b) {
    return true
  }
  if (typeof a !== 'object' || !a || typeof b !== 'object' || !b) {
    return false
  }
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) {
    return false
  }
  const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(b)
  for (let idx = 0; idx < keysA.length; idx += 1) {
    const key = keysA[idx]
    if (!bHasOwnProperty(key) || a[key] !== b[key]) {
      return false
    }
  }
  return true
}

export const memoize = (fn: Function): Function => {
  let lastArgs
  let lastResult
  return (...args) => {
    if (
      !lastArgs
      || args.length !== lastArgs.length
      || args.some((arg, index) => !shallowEqual(lastArgs[index], arg))
    ) {
      lastArgs = args
      lastResult = fn(...args)
    }
    return lastResult
  }
}
