import { getHighestChangeRequestEnv } from './useHighestPermissionChangeRequestEnvironment.js';

describe('Get the right change request env', () => {
    it('gets a production env if present', () => {
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

    it('gets a non-production env if no production envs have change requests enabled', () => {
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

    it('returns undefined if no envs have change requests enabled', () => {
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
