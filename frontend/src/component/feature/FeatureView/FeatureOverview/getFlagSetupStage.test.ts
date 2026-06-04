import { describe, expect, it } from 'vitest';
import { getFlagSetupStage } from './getFlagSetupStage.js';

describe('getFlagSetupStage', () => {
    it('returns connect-sdk when the project is not yet sdk-connected', () => {
        expect(
            getFlagSetupStage({ status: 'onboarding-started' }, undefined),
        ).toBe('connect-sdk');
    });

    it('returns connect-sdk when onboarding status is missing', () => {
        expect(
            getFlagSetupStage(undefined, { lifecycle: { stage: 'live' } }),
        ).toBe('connect-sdk');
    });

    it('returns implement-flag when onboarded but lifecycle is initial', () => {
        expect(
            getFlagSetupStage(
                { status: 'onboarded' },
                { lifecycle: { stage: 'initial' } },
            ),
        ).toBe('implement-flag');
    });

    it('returns implement-flag when sdk-connected and lifecycle is missing', () => {
        expect(getFlagSetupStage({ status: 'sdk-connected' }, {})).toBe(
            'implement-flag',
        );
    });

    it('returns add-strategy when receiving metrics (pre-live) with no strategies', () => {
        expect(
            getFlagSetupStage(
                { status: 'onboarded' },
                {
                    lifecycle: { stage: 'pre-live' },
                    environments: [{ strategies: [] }, { strategies: [] }],
                },
            ),
        ).toBe('add-strategy');
    });

    it('returns add-strategy when receiving metrics (live) with no strategies', () => {
        expect(
            getFlagSetupStage(
                { status: 'onboarded' },
                {
                    lifecycle: { stage: 'live' },
                    environments: [{ strategies: [] }],
                },
            ),
        ).toBe('add-strategy');
    });

    it('treats an empty environments array as no strategies', () => {
        expect(
            getFlagSetupStage(
                { status: 'onboarded' },
                { lifecycle: { stage: 'live' }, environments: [] },
            ),
        ).toBe('add-strategy');
    });

    it('returns null when receiving metrics but at least one env has a strategy', () => {
        expect(
            getFlagSetupStage(
                { status: 'onboarded' },
                {
                    lifecycle: { stage: 'live' },
                    environments: [
                        { strategies: [] },
                        { strategies: [{ name: 'some-strat' }] },
                    ],
                },
            ),
        ).toBeNull();
    });

    it('returns null for completed or archived stages', () => {
        expect(
            getFlagSetupStage(
                { status: 'onboarded' },
                { lifecycle: { stage: 'completed' } },
            ),
        ).toBeNull();
        expect(
            getFlagSetupStage(
                { status: 'onboarded' },
                { lifecycle: { stage: 'archived' } },
            ),
        ).toBeNull();
    });
});
