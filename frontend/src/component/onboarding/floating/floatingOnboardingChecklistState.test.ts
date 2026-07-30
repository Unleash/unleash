import { describe, expect, it } from 'vitest';
import {
    isPendingActionExpired,
    PENDING_ACTION_TTL_MS,
} from './floatingOnboardingChecklistState.ts';

describe('isPendingActionExpired', () => {
    const now = 1_000_000_000_000;

    it('returns false when no pending action is set', () => {
        expect(isPendingActionExpired(undefined, now)).toBe(false);
    });

    it('returns false while still within the TTL window', () => {
        const action = { type: 'flag' as const, setAt: now };

        expect(
            isPendingActionExpired(action, now + PENDING_ACTION_TTL_MS),
        ).toBe(false);
    });

    it('returns true once the TTL has elapsed', () => {
        const action = { type: 'sdk' as const, setAt: now };

        expect(
            isPendingActionExpired(action, now + PENDING_ACTION_TTL_MS + 1),
        ).toBe(true);
    });
});
