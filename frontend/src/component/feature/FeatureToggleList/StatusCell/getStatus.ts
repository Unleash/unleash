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

    const productionEnvironments = environments?.filter(
        (env) => env.type === PRODUCTION,
    );

    if (lifecycle?.stage === 'live' || lifecycle?.stage === 'completed') {
        if (productionEnvironments.length > 1) {
            const countEnabled = productionEnvironments.filter(
                (env) => env.enabled,
            ).length;
            if (countEnabled === 0) {
                return 'Paused';
            }

            if (productionEnvironments.length !== countEnabled) {
                return `In ${countEnabled} out of ${productionEnvironments.length} production environments`;
            }
        }
        if (productionEnvironments.length === 0) {
            return 'No production environments';
        }

        const productionEnvironment = productionEnvironments[0];

        if (!productionEnvironment?.hasStrategies) {
            return 'No strategies';
        }

        if (!productionEnvironment?.enabled) {
            return 'Paused';
        }

        if (productionEnvironment.totalMilestones) {
            const order = `${(productionEnvironment.milestoneOrder || 0) + 1} of ${productionEnvironment.totalMilestones}`;
            if (productionEnvironment.milestoneName) {
                return `Milestone: ${productionEnvironment.milestoneName} (${order})`;
            }

            return `Milestone ${order}`;
        }
    }

    return '–';
};
