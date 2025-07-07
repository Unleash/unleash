import { SYSTEM_USER } from '../../lib/types/index.js';
import type { IUser } from '../types/index.js';
import {
    extractUserIdFromUser,
    extractUsernameFromUser,
} from './extract-user.js';

describe('extractUsernameFromUser', () => {
    test('Should return the email if it exists', () => {
        const user = {
            email: 'ratatoskr@yggdrasil.com',
            username: 'ratatoskr',
        } as IUser;

        expect(extractUsernameFromUser(user)).toBe(user.email);
    });

    test('Should return the username if it exists and email does not', () => {
        const user = {
            username: 'ratatoskr',
        } as IUser;

        expect(extractUsernameFromUser(user)).toBe(user.username);
    });

    test('Should return the system user if neither email nor username exists', () => {
        const user = {} as IUser;

        expect(extractUsernameFromUser(user)).toBe(SYSTEM_USER.username);
        expect(extractUserIdFromUser(user)).toBe(SYSTEM_USER.id);
    });

    test('Should return the system user if user is null', () => {
        const user = null as unknown as IUser;
        expect(extractUsernameFromUser(user)).toBe(SYSTEM_USER.username);
        expect(extractUserIdFromUser(user)).toBe(SYSTEM_USER.id);
    });
});
