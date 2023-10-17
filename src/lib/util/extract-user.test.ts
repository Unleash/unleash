import { IUser } from '../server-impl';
import { extractUsernameFromUser } from './extract-user';

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

    test('Should return "unknown" if neither email nor username exists', () => {
        const user = {} as IUser;

        expect(extractUsernameFromUser(user)).toBe('unknown');
    });

    test('Should return "unknown" if user is null', () => {
        // @ts-expect-error
        expect(extractUsernameFromUser(null)).toBe('unknown');
    });
});
