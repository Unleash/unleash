import { omitIfDefined } from './omitFields.ts';

describe('omitIfDefined', () => {
    test('should omit top-level keys', () => {
        const input = { a: 1, b: 2, c: 3 };
        expect(omitIfDefined(input, ['b'])).toEqual({ a: 1, c: 3 });
    });

    test('should omit multiple top-level keys', () => {
        const input = { a: 1, b: 2, c: 3, d: 4 };
        expect(omitIfDefined(input, ['b', 'd'])).toEqual({ a: 1, c: 3 });
    });

    test('should omit nested fields', () => {
        const input = {
            a: 1,
            b: {
                c: 2,
                d: 3,
            },
        };
        expect(omitIfDefined(input, ['b.c'])).toEqual({
            a: 1,
            b: {
                d: 3,
            },
        });
    });

    test('should omit deeply nested fields', () => {
        const input = {
            impactMetric: {
                id: '123',
                labelSelectors: {
                    environment: 'prod',
                    appName: ['app1'],
                },
            },
        };
        expect(
            omitIfDefined(input, ['impactMetric.labelSelectors.environment']),
        ).toEqual({
            impactMetric: {
                id: '123',
                labelSelectors: {
                    appName: ['app1'],
                },
            },
        });
    });

    test('should omit both top-level and nested fields', () => {
        const input = {
            id: 'top',
            action: 'test',
            impactMetric: {
                id: '123',
                labelSelectors: {
                    environment: 'prod',
                    appName: ['app1'],
                },
            },
        };
        expect(
            omitIfDefined(input, [
                'id',
                'action',
                'impactMetric.id',
                'impactMetric.labelSelectors.environment',
            ]),
        ).toEqual({
            impactMetric: {
                labelSelectors: {
                    appName: ['app1'],
                },
            },
        });
    });

    test('should return undefined if input is undefined', () => {
        expect(omitIfDefined(undefined, ['a'])).toBeUndefined();
    });

    test('should return null if input is null', () => {
        expect(omitIfDefined(null, ['a'])).toBeNull();
    });

    test('should return object unchanged if paths do not exist', () => {
        const input = { a: 1, b: { c: 2 } };
        expect(omitIfDefined(input, ['c', 'b.d'])).toEqual({
            a: 1,
            b: { c: 2 },
        });
    });
});
