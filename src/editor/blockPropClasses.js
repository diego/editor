function toKebabCase(value) {
  return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
}

export function getPropClassNames(props = {}, propNames = []) {
  return propNames
    .map((propName) => {
      const propValue = props[propName];

      if (propValue === undefined || propValue === null || propValue === '') {
        return '';
      }

      return `prop-${toKebabCase(propName)}--${propValue}`;
    })
    .filter(Boolean)
    .join(' ');
}
