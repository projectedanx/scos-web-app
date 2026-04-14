/**
 * Safely parse JSON while preventing Prototype Pollution.
 * @param jsonStr The JSON string to parse
 * @returns The parsed object, or null if the string parses to a falsy value
 */
export const secureJSONParse = (jsonStr: string): any => {
  const parsed = JSON.parse(jsonStr, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });

  if (!parsed) {
    return null;
  }

  return parsed;
};
