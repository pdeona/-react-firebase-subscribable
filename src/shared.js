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
