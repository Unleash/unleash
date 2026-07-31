import { describe, expect, it } from 'vitest';
import {
    isPendingActionExpired,
    PENDING_ACTION_TTL_MS,
} from './floatingOnboardingChecklistState.ts';

describe('isPendingActionExpired', () => {
    const now = 1_000_000_000_000;

    it('stays valid within the TTL window', () => {
        const action = { type: 'flag' as const, setAt: now };

        expect(
            isPendingActionExpired(action, now + PENDING_ACTION_TTL_MS),
        ).toBe(false);
    });

    it('expires once the TTL elapses', () => {
        const action = { type: 'sdk' as const, setAt: now };

        expect(
            isPendingActionExpired(action, now + PENDING_ACTION_TTL_MS + 1),
        ).toBe(true);
    });
});
