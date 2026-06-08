import { describe, expect, it } from 'vitest';
import { getFeatureSetupStage } from './getFeatureSetupStage.js';
import type { FeatureSchemaLifecycleStage } from 'openapi';

const lifecycle = (stage: FeatureSchemaLifecycleStage) => ({
    stage,
    enteredStageAt: '2026-01-01T00:00:00.000Z',
});

const env = (strategies: { name: string }[] = []) => ({
    name: 'env',
    enabled: true,
    strategies,
});

describe('getFeatureSetupStage', () => {
    it('returns connect-sdk when no SDK is connected yet', () => {
        expect(
            getFeatureSetupStage({
                projectOnboardingStatus: 'onboarding-started',
            }),
        ).toBe('connect-sdk');
    });

    it('returns connect-sdk when the onboarding status is missing', () => {
        expect(
            getFeatureSetupStage({ feature: { lifecycle: lifecycle('live') } }),
        ).toBe('connect-sdk');
    });

    it('returns implement-flag when onboarded but the flag is still in the initial stage', () => {
        expect(
            getFeatureSetupStage({
                projectOnboardingStatus: 'onboarded',
                feature: { lifecycle: lifecycle('initial') },
            }),
        ).toBe('implement-flag');
    });

    it('returns implement-flag when sdk-connected and the lifecycle is missing', () => {
        expect(
            getFeatureSetupStage({
                projectOnboardingStatus: 'sdk-connected',
                feature: {},
            }),
        ).toBe('implement-flag');
    });

    it('returns add-strategy when receiving metrics with no strategies', () => {
        expect(
            getFeatureSetupStage({
                projectOnboardingStatus: 'onboarded',
                feature: {
                    lifecycle: lifecycle('pre-live'),
                    environments: [env(), env()],
                },
            }),
        ).toBe('add-strategy');
        expect(
            getFeatureSetupStage({
                projectOnboardingStatus: 'onboarded',
                feature: {
                    lifecycle: lifecycle('live'),
                    environments: [env()],
                },
            }),
        ).toBe('add-strategy');
    });

    it('treats an empty environments array as no strategies', () => {
        expect(
            getFeatureSetupStage({
                projectOnboardingStatus: 'onboarded',
                feature: {
                    lifecycle: lifecycle('live'),
                    environments: [],
                },
            }),
        ).toBe('add-strategy');
    });

    it('returns null when at least one environment already has a strategy', () => {
        expect(
            getFeatureSetupStage({
                projectOnboardingStatus: 'onboarded',
                feature: {
                    lifecycle: lifecycle('live'),
                    environments: [env(), env([{ name: 'flexibleRollout' }])],
                },
            }),
        ).toBe('setup-completed');
    });

    it('returns null for the completed stage', () => {
        expect(
            getFeatureSetupStage({
                projectOnboardingStatus: 'onboarded',
                feature: { lifecycle: lifecycle('completed') },
            }),
        ).toBe('setup-completed');
    });

    it('returns null for the archived stage', () => {
        expect(
            getFeatureSetupStage({
                projectOnboardingStatus: 'onboarded',
                feature: { lifecycle: lifecycle('archived') },
            }),
        ).toBe('setup-completed');
    });
});
