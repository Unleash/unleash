import type { JSONSchema } from 'json-schema-to-ts';

// this function simplifies simple schemas and return allOf schema if it
// doesn't know how to simplify it. It's a proof of concept but it can be extended
export function mergeAllOf(a: JSONSchema, b: JSONSchema): JSONSchema {
    if (typeof a !== 'boolean' && typeof b !== 'boolean') {
        const {
            required: aRequired,
            properties: aProperties,
            type: aType,
            ...aRest
        } = a;
        const {
            required: bRequired,
            properties: bProperties,
            type: bType,
            ...bRest
        } = b;
        if (
            Object.keys(aRest).length === 0 &&
            Object.keys(bRest).length === 0 &&
            aType === 'object' &&
            bType === 'object'
        ) {
            return {
                required: [...(aRequired ?? []), ...(bRequired ?? [])],
                type: 'object',
                properties: { ...aProperties, ...bProperties },
            };
        }
    }
    return {
        allOf: [a, b],
    };
}

export function mergeAllOfs(schemas: JSONSchema[]): JSONSchema {
    if (schemas.length === 1) {
        return schemas[0];
    }
    const [a, b, ...rest] = schemas;
    return mergeAllOfs([mergeAllOf(a, b), ...rest]);
}
