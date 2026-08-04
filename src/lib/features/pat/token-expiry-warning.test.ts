import { addDays, addHours, subDays, subHours } from 'date-fns';
import { getTokenExpiryWarning } from './token-expiry-warning.js';

const now = new Date(2024, 5, 15, 12, 0, 0);

describe('getTokenExpiryWarning', () => {
    it('warns about an old token within the configured lead time', () => {
        const warning = getTokenExpiryWarning({
            createdAt: subDays(now, 90),
            expiresAt: addDays(now, 10),
            leadTimeDays: [14, 3],
            now,
        });

        expect(warning).toBe('expires-soon');
    });

    it('does not warn while more than a lead time remains', () => {
        const warning = getTokenExpiryWarning({
            createdAt: subDays(now, 90),
            expiresAt: addDays(now, 15),
            leadTimeDays: [14, 3],
            now,
        });

        expect(warning).toBeUndefined();
    });

    it('does not warn about a fresh short-lived token: its owner still remembers the expiry', () => {
        const warning = getTokenExpiryWarning({
            createdAt: subDays(now, 1),
            expiresAt: addDays(now, 2),
            leadTimeDays: [14, 3],
            now,
        });

        expect(warning).toBeUndefined();
    });

    it('warns once a token crosses the middle of its life', () => {
        const warning = getTokenExpiryWarning({
            createdAt: subDays(now, 2),
            expiresAt: addDays(now, 2),
            leadTimeDays: [14, 3],
            now,
        });

        expect(warning).toBe('expires-soon');
    });

    it('warns on the same calendar day the notification email fires, hours before the exact expiry instant', () => {
        const warning = getTokenExpiryWarning({
            createdAt: subDays(now, 90),
            expiresAt: addHours(addDays(now, 14), 6),
            leadTimeDays: [14, 3],
            now,
        });

        expect(warning).toBe('expires-soon');
    });

    it('reports an already expired token as expired, regardless of its age', () => {
        const warning = getTokenExpiryWarning({
            createdAt: subDays(now, 1),
            expiresAt: subHours(now, 12),
            leadTimeDays: [14, 3],
            now,
        });

        expect(warning).toBe('expired');
    });

    it('never warns about upcoming expiry when no lead times are configured', () => {
        const warning = getTokenExpiryWarning({
            createdAt: subDays(now, 90),
            expiresAt: addDays(now, 1),
            leadTimeDays: [],
            now,
        });

        expect(warning).toBeUndefined();
    });
});
