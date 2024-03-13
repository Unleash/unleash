export const flattenPayload = (
    payload = {},
    parentKey = '',
): Record<string, unknown> =>
    Object.entries(payload).reduce((acc, [key, value]) => {
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
        ) {
            // If it's an object, recurse and merge the results
            Object.assign(acc, flattenPayload(value, newKey));
        } else if (Array.isArray(value)) {
            // If it's an array, map through it and handle objects and non-objects differently
            value.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                    Object.assign(
                        acc,
                        flattenPayload(item, `${newKey}[${index}]`),
                    );
                } else {
                    acc[`${newKey}[${index}]`] = item;
                }
            });
        } else {
            acc[newKey] = value;
        }

        return acc;
    }, {});
