import { createHash } from 'crypto';

export function anonymise(s?: string): string {
    if (!s) {
        return '';
    }
    const hash = createHash('sha256')
        .update(s, 'utf-8')
        .digest('hex')
        .slice(0, 9);
    return `${hash}@unleash.run`;
}

export function anonymiseKeys<T>(object: T, keys: string[]): T {
    if (typeof object !== 'object' || object === null) {
        return object;
    }

    if (Array.isArray(object)) {
        return object.map((item) => anonymiseKeys(item, keys)) as T;
    } else {
        return Object.keys(object).reduce((result, key) => {
            if (
                keys.includes(key) &&
                result[key] !== undefined &&
                result[key] !== null
            ) {
                result[key] = anonymise(result[key]);
            } else if (typeof result[key] === 'object') {
                result[key] = anonymiseKeys(result[key], keys);
            }
            return result;
        }, object);
    }
}
