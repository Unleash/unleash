import { isSafeToArchive } from './isSafeToArchive.js'; // Update the import path accordingly
import { subDays } from 'date-fns';

describe('isSafeToArchive', () => {
    it('should return true if all environments were last seen more than two days ago', () => {
        const now = new Date();
        const environments = [
            { name: 'Production', lastSeenAt: subDays(now, 3).toISOString() },
            { name: 'Staging', lastSeenAt: subDays(now, 4).toISOString() },
        ];

        const result = isSafeToArchive(environments);
        expect(result).toBe(true);
    });

    it('should return false if any environment was seen within the last two days', () => {
        const now = new Date();
        const environments = [
            { name: 'Production', lastSeenAt: subDays(now, 3).toISOString() },
            { name: 'Staging', lastSeenAt: subDays(now, 1).toISOString() },
        ];

        const result = isSafeToArchive(environments);
        expect(result).toBe(false);
    });

    it('should return false if all environments were seen within the last two days', () => {
        const now = new Date();
        const environments = [
            { name: 'Production', lastSeenAt: subDays(now, 0).toISOString() },
            { name: 'Staging', lastSeenAt: subDays(now, 1).toISOString() },
        ];

        const result = isSafeToArchive(environments);
        expect(result).toBe(false);
    });

    it('should return true for an empty array of environments', () => {
        const environments: Array<{ name: string; lastSeenAt: string }> = [];

        const result = isSafeToArchive(environments);
        expect(result).toBe(true);
    });
});
