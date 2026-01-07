import { getStatus } from './getStatus.js';
import { PRODUCTION } from 'constants/environmentTypes';
import type { FeatureSearchEnvironmentSchema } from 'openapi';

const prodEnvEnabled: FeatureSearchEnvironmentSchema = {
    name: 'production',
    enabled: true,
    type: PRODUCTION,
    sortOrder: 1,
    variantCount: 0,
    lastSeenAt: null,
    hasStrategies: true,
    hasEnabledStrategies: true,
};

const prodEnvDisabled: FeatureSearchEnvironmentSchema = {
    ...prodEnvEnabled,
    enabled: false,
    hasEnabledStrategies: false,
};

const prodEnvDisabledNoStrategies: FeatureSearchEnvironmentSchema = {
    ...prodEnvDisabled,
    hasStrategies: false,
};

const devEnvEnabled: FeatureSearchEnvironmentSchema = {
    name: 'development',
    enabled: true,
    type: 'development',
    sortOrder: 0,
    variantCount: 0,
    lastSeenAt: null,
    hasStrategies: true,
    hasEnabledStrategies: true,
};

const devEnvDisabledWithStrategies: FeatureSearchEnvironmentSchema = {
    ...devEnvEnabled,
    enabled: false,
    hasEnabledStrategies: false,
};

const devEnvDisabledNoStrategies: FeatureSearchEnvironmentSchema = {
    ...devEnvDisabledWithStrategies,
    hasStrategies: false,
};

describe('getStatus', () => {
    describe("lifecycle 'define' stage", () => {
        it('has no strategies', () => {
            expect(
                getStatus({
                    environments: [devEnvDisabledNoStrategies, prodEnvDisabled],
                    lifecycle: {
                        stage: 'initial',
                        enteredStageAt: null as any,
                    },
                }),
            ).toBe('No strategies');
        });

        it('has no enabled strategies', () => {
            expect(
                getStatus({
                    environments: [
                        devEnvDisabledWithStrategies,
                        prodEnvDisabled,
                    ],
                    lifecycle: {
                        stage: 'initial',
                        enteredStageAt: null as any,
                    },
                }),
            ).toBe('No enabled strategies');
        });

        it('has a non-production environment enabled', () => {
            expect(
                getStatus({
                    environments: [devEnvEnabled],
                    lifecycle: {
                        stage: 'initial',
                        enteredStageAt: null as any,
                    },
                }),
            ).toBe('No traffic');
        });
    });

    describe("lifecycle 'develop' stage", () => {
        it('is paused', () => {
            expect(
                getStatus({
                    environments: [
                        devEnvDisabledWithStrategies,
                        prodEnvDisabled,
                    ],
                    lifecycle: {
                        stage: 'pre-live',
                        enteredStageAt: null as any,
                    },
                }),
            ).toBe('Paused');
            expect(
                getStatus({
                    environments: [devEnvEnabled, prodEnvDisabled],
                    lifecycle: {
                        stage: 'pre-live',
                        enteredStageAt: null as any,
                    },
                }),
            ).not.toBe('Paused');
        });
    });

    describe("lifecycle 'production' stage", () => {
        it('has no production environments', () => {
            expect(
                getStatus({
                    environments: [devEnvEnabled],
                    lifecycle: { stage: 'live', enteredStageAt: null as any },
                }),
            ).toBe('No production environments');
        });

        it('is paused', () => {
            expect(
                getStatus({
                    environments: [prodEnvDisabled],
                    lifecycle: { stage: 'live', enteredStageAt: null as any },
                }),
            ).toBe('Paused');
            expect(
                getStatus({
                    environments: [prodEnvEnabled],
                    lifecycle: { stage: 'live', enteredStageAt: null as any },
                }),
            ).not.toBe('Paused');
        });

        it('has no produciton strategies', () => {
            expect(
                getStatus({
                    environments: [prodEnvDisabledNoStrategies],
                    lifecycle: { stage: 'live', enteredStageAt: null as any },
                }),
            ).toBe('No strategies');
        });
    });

    describe('release plan - milestones', () => {
        it('should show the release plan', () => {
            expect(
                getStatus({
                    environments: [
                        {
                            ...prodEnvEnabled,
                            totalMilestones: 2,
                            milestoneOrder: 0,
                            milestoneName: 'First step',
                        },
                    ],
                    lifecycle: {
                        stage: 'live',
                        enteredStageAt: null as any,
                    },
                }),
            ).toBe('Milestone: First step (1 of 2)');
        });

        it('should not show the milestone if a flag is disabled', () => {
            expect(
                getStatus({
                    environments: [
                        {
                            ...prodEnvDisabled,
                            totalMilestones: 2,
                            milestoneOrder: 0,
                            milestoneName: 'First step',
                        },
                    ],
                    lifecycle: {
                        stage: 'live',
                        enteredStageAt: null as any,
                    },
                }),
            ).not.toBe('Release plan');
        });
    });
});
