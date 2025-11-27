import lodashOmit from 'lodash.omit';

const omitNestedFieldInternal = (obj: any, path: string) => {
    if (!obj) return obj;
    const [first, ...rest] = path.split('.');
    if (rest.length === 0) {
        return lodashOmit(obj, [first]);
    }
    if (!obj[first]) return obj;
    return {
        ...obj,
        [first]: omitNestedFieldInternal(obj[first], rest.join('.')),
    };
};

export const omitIfDefined = (obj: any, paths: string[]) => {
    if (!obj) return obj;

    const topLevelKeys: string[] = [];
    const nestedPaths: string[] = [];

    for (const path of paths) {
        if (path.includes('.')) {
            nestedPaths.push(path);
        } else {
            topLevelKeys.push(path);
        }
    }

    let result = topLevelKeys.length > 0 ? lodashOmit(obj, topLevelKeys) : obj;

    for (const nestedPath of nestedPaths) {
        result = omitNestedFieldInternal(result, nestedPath);
    }

    return result;
};
