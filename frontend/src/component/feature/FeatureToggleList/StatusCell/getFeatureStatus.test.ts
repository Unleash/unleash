import { describe, expect, it } from 'vitest';
import { getFeatureStatus } from './getFeatureStatus.js';
import { PRODUCTION } from 'constants/environmentTypes';
import type {
    FeatureSearchEnvironmentSchema,
    FeatureSearchResponseSchemaLifecycle,
} from 'openapi';

const lifecycle = (
    stage: FeatureSearchResponseSchemaLifecycle['stage'],
): FeatureSearchResponseSchemaLifecycle => ({
    stage,
    enteredStageAt: '2025-04-01T00:00:00Z',
});

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

const devEnvDisabledWithEnabledStrategies: FeatureSearchEnvironmentSchema = {
    ...devEnvEnabled,
    enabled: false,
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

describe('getFeatureStatus', () => {
    it('is unknown when the lifecycle is missing', () => {
        expect(
            getFeatureStatus({
                environments: [devEnvEnabled],
                lifecycle: undefined,
            }),
        ).toEqual({ type: 'unknown' });
    });

    describe("'initial' stage (Define)", () => {
        it('has no traffic when a non-production environment is enabled', () => {
            expect(
                getFeatureStatus({
                    environments: [devEnvEnabled, prodEnvDisabled],
                    lifecycle: lifecycle('initial'),
                }),
            ).toEqual({ type: 'noTraffic' });
        });

        it('reports no traffic even when there are no strategies at all', () => {
            expect(
                getFeatureStatus({
                    environments: [
                        { ...devEnvEnabled, hasStrategies: false },
                        prodEnvDisabled,
                    ],
                    lifecycle: lifecycle('initial'),
                }),
            ).toEqual({ type: 'noTraffic' });
        });

        it('has no strategies in non-production', () => {
            expect(
                getFeatureStatus({
                    environments: [devEnvDisabledNoStrategies, prodEnvDisabled],
                    lifecycle: lifecycle('initial'),
                }),
            ).toEqual({
                type: 'noStrategies',
                environment: 'non-production',
            });
        });

        it('ignores production strategies when deciding non-production status', () => {
            expect(
                getFeatureStatus({
                    environments: [devEnvDisabledNoStrategies, prodEnvEnabled],
                    lifecycle: lifecycle('initial'),
                }),
            ).toEqual({
                type: 'noStrategies',
                environment: 'non-production',
            });
        });

        it('has no enabled strategies', () => {
            expect(
                getFeatureStatus({
                    environments: [
                        devEnvDisabledWithStrategies,
                        prodEnvDisabled,
                    ],
                    lifecycle: lifecycle('initial'),
                }),
            ).toEqual({ type: 'noEnabledStrategies' });
        });

        it('is paused when enabled strategies exist but every environment is off', () => {
            expect(
                getFeatureStatus({
                    environments: [
                        devEnvDisabledWithEnabledStrategies,
                        prodEnvDisabled,
                    ],
                    lifecycle: lifecycle('initial'),
                }),
            ).toEqual({ type: 'paused', environment: 'non-production' });
        });
    });

    describe("'pre-live' stage (Develop)", () => {
        it('is paused when no environment of any type is enabled', () => {
            expect(
                getFeatureStatus({
                    environments: [
                        devEnvDisabledWithStrategies,
                        prodEnvDisabled,
                    ],
                    lifecycle: lifecycle('pre-live'),
                }),
            ).toEqual({ type: 'paused', environment: 'any' });
        });

        it('is ok when any environment is enabled', () => {
            expect(
                getFeatureStatus({
                    environments: [devEnvEnabled, prodEnvDisabled],
                    lifecycle: lifecycle('pre-live'),
                }),
            ).toEqual({ type: 'ok' });
        });
    });

    describe.each([
        'live',
        'completed',
    ] as const)("'%s' stage (Production / Cleanup)", (stage) => {
        it('has no production environments', () => {
            expect(
                getFeatureStatus({
                    environments: [devEnvEnabled],
                    lifecycle: lifecycle(stage),
                }),
            ).toEqual({ type: 'noProductionEnvironments' });
        });

        it('is paused when the single production environment is disabled', () => {
            expect(
                getFeatureStatus({
                    environments: [prodEnvDisabled],
                    lifecycle: lifecycle(stage),
                }),
            ).toEqual({ type: 'paused', environment: 'production' });
        });

        it('is paused when none of several production environments is enabled', () => {
            expect(
                getFeatureStatus({
                    environments: [
                        { ...prodEnvDisabled, name: 'production-eu' },
                        { ...prodEnvDisabled, name: 'production-us' },
                    ],
                    lifecycle: lifecycle(stage),
                }),
            ).toEqual({ type: 'paused', environment: 'production' });
        });

        it('is partially enabled in production', () => {
            expect(
                getFeatureStatus({
                    environments: [
                        { ...prodEnvEnabled, name: 'production-eu' },
                        { ...prodEnvDisabled, name: 'production-us' },
                        { ...prodEnvEnabled, name: 'production-apac' },
                    ],
                    lifecycle: lifecycle(stage),
                }),
            ).toEqual({
                type: 'partialProduction',
                enabledEnvironments: ['production-eu', 'production-apac'],
                total: 3,
            });
        });

        it('is not partial when every production environment is enabled', () => {
            expect(
                getFeatureStatus({
                    environments: [
                        { ...prodEnvEnabled, name: 'production-eu' },
                        { ...prodEnvEnabled, name: 'production-us' },
                    ],
                    lifecycle: lifecycle(stage),
                }),
            ).toEqual({ type: 'ok' });
        });

        it('has no production strategies', () => {
            expect(
                getFeatureStatus({
                    environments: [{ ...prodEnvEnabled, hasStrategies: false }],
                    lifecycle: lifecycle(stage),
                }),
            ).toEqual({ type: 'noStrategies', environment: 'production' });
        });

        it('prefers "no strategies" over "paused" for a disabled production environment without strategies', () => {
            expect(
                getFeatureStatus({
                    environments: [prodEnvDisabledNoStrategies],
                    lifecycle: lifecycle(stage),
                }),
            ).toEqual({ type: 'noStrategies', environment: 'production' });
        });

        it('is ok for an enabled production environment with strategies and no release plan', () => {
            expect(
                getFeatureStatus({
                    environments: [prodEnvEnabled],
                    lifecycle: lifecycle(stage),
                }),
            ).toEqual({ type: 'ok' });
        });

        it('reports the active milestone with a name', () => {
            expect(
                getFeatureStatus({
                    environments: [
                        {
                            ...prodEnvEnabled,
                            totalMilestones: 2,
                            milestoneOrder: 0,
                            milestoneName: 'First step',
                        },
                    ],
                    lifecycle: lifecycle(stage),
                }),
            ).toEqual({
                type: 'milestone',
                name: 'First step',
                order: 1,
                total: 2,
            });
        });

        it('reports the active milestone without a name', () => {
            expect(
                getFeatureStatus({
                    environments: [
                        {
                            ...prodEnvEnabled,
                            totalMilestones: 3,
                            milestoneOrder: 1,
                        },
                    ],
                    lifecycle: lifecycle(stage),
                }),
            ).toEqual({
                type: 'milestone',
                name: null,
                order: 2,
                total: 3,
            });
        });

        it('does not report a milestone for a disabled production environment', () => {
            expect(
                getFeatureStatus({
                    environments: [
                        {
                            ...prodEnvDisabled,
                            totalMilestones: 2,
                            milestoneOrder: 0,
                            milestoneName: 'First step',
                        },
                    ],
                    lifecycle: lifecycle(stage),
                }),
            ).toEqual({ type: 'paused', environment: 'production' });
        });
    });

    it('is ok for archived flags', () => {
        expect(
            getFeatureStatus({
                environments: [prodEnvDisabled],
                lifecycle: lifecycle('archived'),
            }),
        ).toEqual({ type: 'ok' });
    });
});
