/**
 * Get the value of an object's (nested) property from a string.
 *
 * This function does not do any processing or validation of the property path.
 * Empty paths and non-existent properties yield `undefined`. Whitespace is
 * valid as a property name (so `x. .y`) is a valid path.
 *
 * @param {string} propertyPath The path to the property you want to extract. First part of the path is assumed to be on the root level of the `object` you provide.
 * @param {object} object The object you want to extract the property from.
 * @return {T = unknown | undefined} If the nested property exists, return that as `unknown` or try to coerce it into to the type you've provided. Otherwise, return `undefined`.
 */
export const getPropFromString = <T = unknown>(
    propertyPath: string,
    object: object,
): T => propertyPath.split('.').reduce((x, prop) => x?.[prop], object) as T;
