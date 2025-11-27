import { omitIfDefined, omitNestedField } from './omitFields';

describe('omitIfDefined', () => {
    test('should omit specified keys from object', () => {
        const input = { a: 1, b: 2, c: 3 };
        expect(omitIfDefined(input, ['b'])).toEqual({ a: 1, c: 3 });
    });

    test('should omit multiple keys from object', () => {
        const input = { a: 1, b: 2, c: 3, d: 4 };
        expect(omitIfDefined(input, ['b', 'd'])).toEqual({ a: 1, c: 3 });
    });

    test('should return undefined if input is undefined', () => {
        expect(omitIfDefined(undefined, ['a'])).toBeUndefined();
    });

    test('should return null if input is null', () => {
        expect(omitIfDefined(null, ['a'])).toBeNull();
    });

    test('should return object unchanged if keys do not exist', () => {
        const input = { a: 1, b: 2 };
        expect(omitIfDefined(input, ['c', 'd'])).toEqual({ a: 1, b: 2 });
    });
});

describe('omitNestedField', () => {
    test('should omit top-level field', () => {
        const input = { a: 1, b: 2 };
        expect(omitNestedField(input, 'a')).toEqual({ b: 2 });
    });

    test('should omit nested field', () => {
        const input = {
            a: 1,
            b: {
                c: 2,
                d: 3,
            },
        };
        expect(omitNestedField(input, 'b.c')).toEqual({
            a: 1,
            b: {
                d: 3,
            },
        });
    });

    test('should omit deeply nested field', () => {
        const input = {
            impactMetric: {
                id: '123',
                labelSelectors: {
                    environment: 'prod',
                    appName: ['app1'],
                },
            },
        };
        expect(omitNestedField(input, 'impactMetric.labelSelectors.environment')).toEqual({
            impactMetric: {
                id: '123',
                labelSelectors: {
                    appName: ['app1'],
                },
            },
        });
    });

    test('should return undefined if input is undefined', () => {
        expect(omitNestedField(undefined, 'a.b')).toBeUndefined();
    });

    test('should return null if input is null', () => {
        expect(omitNestedField(null, 'a.b')).toBeNull();
    });

    test('should return object unchanged if nested path does not exist', () => {
        const input = { a: 1, b: { c: 2 } };
        expect(omitNestedField(input, 'b.d')).toEqual({ a: 1, b: { c: 2 } });
    });

    test('should return object unchanged if parent path does not exist', () => {
        const input = { a: 1 };
        expect(omitNestedField(input, 'b.c')).toEqual({ a: 1 });
    });
});

