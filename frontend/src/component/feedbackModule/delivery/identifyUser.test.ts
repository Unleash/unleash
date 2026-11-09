import { describe, expect, it } from 'vitest';
import type { IContext } from 'unleash-proxy-client';
import { identifyUser } from './identifyUser.ts';

const context = (overrides: Partial<IContext> = {}): IContext => ({
    appName: 'test',
    userId: '7',
    properties: { clientId: 'instance-a' },
    ...overrides,
});

describe('identifyUser', () => {
    it('identifies the user by the instance and the user id', () => {
        expect(identifyUser(context())).toBe('instance-a:7');
    });

    it('does not identify the user when the instance is not known', () => {
        expect(identifyUser(context({ properties: {} }))).toBeUndefined();
    });

    it('does not identify the user when the user id is not known', () => {
        expect(identifyUser(context({ userId: undefined }))).toBeUndefined();
    });
});
