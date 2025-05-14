import type { IEnvironments } from 'interfaces/featureToggle';

import { getLatestLastSeenAt } from './getLatestLastSeenAt.js';

describe('getLatestLastSeenAt', () => {
    test('should return the most recent lastSeenAt date', () => {
        const input: IEnvironments[] = [
            {
                name: 'test1',
                lastSeenAt: '2023-10-22T08:48:11.869Z',
                enabled: false,
                variantCount: 0,
            },
            {
                name: 'test2',
                lastSeenAt: '2023-10-23T08:48:11.869Z',
                enabled: true,
                variantCount: 0,
            },
            {
                name: 'test3',
                lastSeenAt: '2023-10-24T08:48:11.869Z',
                enabled: true,
                variantCount: 0,
            },
        ];
        const expected = '2023-10-24T08:48:11.869Z';
        expect(getLatestLastSeenAt(input)).toBe(expected);
    });

    test('should handle an empty array', () => {
        const input: IEnvironments[] = [];
        const expected = null;
        expect(getLatestLastSeenAt(input)).toBe(expected);
    });

    test('should not fail with non-standard date formats', () => {
        const input: IEnvironments[] = [
            {
                name: 'test',
                lastSeenAt: 'Some Invalid Date',
                enabled: true,
                variantCount: 0,
            },
        ];
        expect(() => getLatestLastSeenAt(input)).not.toThrow();
    });
});
