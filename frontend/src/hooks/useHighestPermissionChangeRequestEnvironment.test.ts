import { getHighestChangeRequestEnv } from './useHighestPermissionChangeRequestEnvironment';

describe('Get the right change request env', () => {
    test('gets a production env if present', () => {
        const data = [
            {
                environment: 'x',
                type: 'development',
                changeRequestEnabled: true,
                requiredApprovals: 1,
            },
            {
                environment: 'y',
                type: 'production',
                changeRequestEnabled: true,
                requiredApprovals: 1,
            },
        ];

        const result = getHighestChangeRequestEnv(data)();

        expect(result).toBe('y');
    });

    test('gets a non-production env if no production envs have change requests enabled', () => {
        const data = [
            {
                environment: 'x',
                type: 'development',
                changeRequestEnabled: true,
                requiredApprovals: 1,
            },
            {
                environment: 'y',
                type: 'production',
                changeRequestEnabled: false,
                requiredApprovals: 1,
            },
        ];

        const result = getHighestChangeRequestEnv(data)();

        expect(result).toBe('x');
    });

    test('returns undefined if no envs have change requests enabled', () => {
        const data = [
            {
                environment: 'x',
                type: 'development',
                changeRequestEnabled: false,
                requiredApprovals: 1,
            },
            {
                environment: 'y',
                type: 'production',
                changeRequestEnabled: false,
                requiredApprovals: 1,
            },
        ];

        const result = getHighestChangeRequestEnv(data)();

        expect(result).toBe(undefined);
    });
});
