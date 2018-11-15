const requiredPropErrorMsg = (componentName, propName, propType) => `${componentName} did not receive ${propName} as a prop. ${propName} should be provided as a ${propType}`

class RequiredPropError extends Error {
  constructor(componentName, propName, propType) {
    super(requiredPropErrorMsg(componentName, propName, propType))
  }
}

export const diffRequiredProps = (componentName, props, ...requiredProps) => {
  const errors = requiredProps.map(([propName, propType, custType = '']) => {
    if (!props[propName] || typeof props[propName] !== propType) {
      return [componentName, propName, custType || propType]
    }
    return null
  }).filter(e => !!e)
  return errors.map(err => console.error(new RequiredPropError(...err)))
}
