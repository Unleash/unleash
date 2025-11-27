import omit from 'lodash.omit';

export const omitIfDefined = (obj: any, keys: string[]) =>
    obj ? omit(obj, keys) : obj;

export const omitNestedField = (obj: any, path: string) => {
    if (!obj) return obj;
    const [first, ...rest] = path.split('.');
    if (rest.length === 0) {
        return omit(obj, [first]);
    }
    if (!obj[first]) return obj;
    return {
        ...obj,
        [first]: omitNestedField(obj[first], rest.join('.')),
    };
};

