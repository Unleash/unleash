import { isDefined } from './isDefined';

export function ensureStringValue(value: unknown): string {
    if (!isDefined(value)) {
        return '';
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
}
