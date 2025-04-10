import { PRODUCTION } from 'constants/environmentTypes';
import type { FeatureSearchResponseSchema } from 'openapi';

export const getStatus = ({
    lifecycle,
    environments,
}: Pick<
    FeatureSearchResponseSchema,
    'lifecycle' | 'environments' | 'lastSeenAt'
>) => {
    if (lifecycle?.stage === 'initial') {
        if (
            environments?.some((env) => env.type !== PRODUCTION && env.enabled)
        ) {
            return 'No traffic';
        }

        if (
            !environments?.some(
                (env) => env.type !== PRODUCTION && env.hasStrategies,
            )
        ) {
            return 'No strategies';
        }

        if (
            !environments?.some(
                (env) => env.type !== PRODUCTION && env.hasEnabledStrategies,
            )
        ) {
            return 'No enabled strategies';
        }
    }

    if (lifecycle?.stage === 'pre-live') {
        if (!environments?.some((env) => env.enabled)) {
            return 'Paused';
        }
    }

    const productionEnvironment = environments?.find(
        (env) => env.type === PRODUCTION,
    );

    if (lifecycle?.stage === 'live') {
        if (!productionEnvironment) {
            return 'No production environments';
        }

        if (!productionEnvironment?.hasStrategies) {
            return 'No strategies';
        }

        if (!productionEnvironment?.enabled) {
            return 'Paused';
        }
    }

    if (lifecycle?.stage === 'completed') {
        if (productionEnvironment?.enabled) {
            return 'Enabled';
        }
    }

    return '–';
};
