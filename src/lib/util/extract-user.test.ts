import { SYSTEM_USER } from '../../lib/types/index.js';
import type { IUser } from '../types/index.js';
import {
    extractUserAgentFromHeaders,
    extractUserIdFromUser,
    extractUsernameFromUser,
} from './extract-user.js';

describe('extractUsernameFromUser()', () => {
    test('should return the email if it exists', () => {
        const user = {
            email: 'unleashaki@yggdrasil.com',
            username: 'unleashakis',
        } as IUser;

        expect(extractUsernameFromUser(user)).toBe(user.email);
    });

    test('should return the username if it exists and email does not', () => {
        const user = {
            username: 'unleashakis',
        } as IUser;

        expect(extractUsernameFromUser(user)).toBe(user.username);
    });

    test('should return the system user if neither email nor username exists', () => {
        const user = {} as IUser;

        expect(extractUsernameFromUser(user)).toBe(SYSTEM_USER.username);
        expect(extractUserIdFromUser(user)).toBe(SYSTEM_USER.id);
    });

    test('should return the system user if user is null', () => {
        const user = null as unknown as IUser;
        expect(extractUsernameFromUser(user)).toBe(SYSTEM_USER.username);
        expect(extractUserIdFromUser(user)).toBe(SYSTEM_USER.id);
    });
});

describe('user agent on the audit context', () => {
    const request = (userAgent?: string) =>
        ({
            ip: '127.0.0.1',
            user: { id: 1, email: 'unleashakis@yggdrasil.com' },
            get: (name: string) =>
                name.toLowerCase() === 'user-agent' ? userAgent : undefined,
        }) as any;

    describe('extractUserAgentFromHeaders()', () => {
        test('reads the user agent off the request', () => {
            expect(extractUserAgentFromHeaders(request('curl/8.4.0'))).toBe(
                'curl/8.4.0',
            );
        });

        test('is undefined when the client sends no user agent', () => {
            expect(extractUserAgentFromHeaders(request())).toBeUndefined();
        });
    });
});
