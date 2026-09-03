import { PRODUCTION } from 'constants/environmentTypes';
import type { FeatureSearchResponseSchema } from 'openapi';

export type FeatureStatus =
    | { type: 'noTraffic' }
    | { type: 'noStrategies'; environment: 'non-production' | 'production' }
    | { type: 'noEnabledStrategies' }
    | { type: 'paused'; environment: 'non-production' | 'any' | 'production' }
    | {
          type: 'partialProduction';
          enabledEnvironments: string[];
          total: number;
      }
    | { type: 'noProductionEnvironments' }
    | { type: 'milestone'; name: string | null; order: number; total: number }
    | { type: 'ok' }
    | { type: 'unknown' };

export const getFeatureStatus = ({
    lifecycle,
    environments,
}: Pick<
    FeatureSearchResponseSchema,
    'lifecycle' | 'environments'
>): FeatureStatus => {
    if (!lifecycle) {
        return { type: 'unknown' };
    }

    if (lifecycle.stage === 'initial') {
        const nonProductionEnvironments = environments.filter(
            (env) => env.type !== PRODUCTION,
        );

        if (nonProductionEnvironments.some((env) => env.enabled)) {
            return { type: 'noTraffic' };
        }

        if (!nonProductionEnvironments.some((env) => env.hasStrategies)) {
            return { type: 'noStrategies', environment: 'non-production' };
        }

        if (
            !nonProductionEnvironments.some((env) => env.hasEnabledStrategies)
        ) {
            return { type: 'noEnabledStrategies' };
        }

        return { type: 'paused', environment: 'non-production' };
    }

    if (lifecycle.stage === 'pre-live') {
        if (!environments.some((env) => env.enabled)) {
            return { type: 'paused', environment: 'any' };
        }

        return { type: 'ok' };
    }

    if (lifecycle.stage === 'live' || lifecycle.stage === 'completed') {
        const productionEnvironments = environments.filter(
            (env) => env.type === PRODUCTION,
        );

        if (productionEnvironments.length === 0) {
            return { type: 'noProductionEnvironments' };
        }

        if (productionEnvironments.length > 1) {
            const enabledEnvironments = productionEnvironments.filter(
                (env) => env.enabled,
            );

            if (enabledEnvironments.length === 0) {
                return { type: 'paused', environment: 'production' };
            }

            if (enabledEnvironments.length !== productionEnvironments.length) {
                return {
                    type: 'partialProduction',
                    enabledEnvironments: enabledEnvironments.map(
                        (env) => env.name,
                    ),
                    total: productionEnvironments.length,
                };
            }
        }

        const productionEnvironment = productionEnvironments[0];

        if (!productionEnvironment.hasStrategies) {
            return { type: 'noStrategies', environment: 'production' };
        }

        if (!productionEnvironment.enabled) {
            return { type: 'paused', environment: 'production' };
        }

        if (productionEnvironment.totalMilestones) {
            return {
                type: 'milestone',
                name: productionEnvironment.milestoneName ?? null,
                order: (productionEnvironment.milestoneOrder ?? 0) + 1,
                total: productionEnvironment.totalMilestones,
            };
        }
    }

    return { type: 'ok' };
};
