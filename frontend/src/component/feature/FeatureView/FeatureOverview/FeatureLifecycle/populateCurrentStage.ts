import type { IFeatureToggle } from 'interfaces/featureToggle';
import type { LifecycleStage } from './LifecycleStage';

export const populateCurrentStage = (
    feature: Pick<IFeatureToggle, 'lifecycle' | 'environments'>,
): LifecycleStage | undefined => {
    if (!feature.lifecycle) return undefined;

    const getFilteredEnvironments = (condition: (type: string) => boolean) => {
        return feature.environments
            .filter((env) => condition(env.type) && Boolean(env.lastSeenAt))
            .map((env) => ({
                name: env.name,
                lastSeenAt: env.lastSeenAt!,
            }));
    };

    const enteredStageAt = feature.lifecycle.enteredStageAt;

    switch (feature.lifecycle.stage) {
        case 'initial':
            return { name: 'initial', enteredStageAt };
        case 'pre-live':
            return {
                name: 'pre-live',
                environments: getFilteredEnvironments(
                    (type) => type !== 'production',
                ),
                enteredStageAt,
            };
        case 'live':
            return {
                name: 'live',
                environments: getFilteredEnvironments(
                    (type) => type === 'production',
                ),
                enteredStageAt,
            };
        case 'completed':
            return {
                name: 'completed',
                status: 'kept',
                environments: getFilteredEnvironments(
                    (type) => type === 'production',
                ),
                enteredStageAt,
            };
        case 'archived':
            return { name: 'archived', enteredStageAt };
        default:
            return undefined;
    }
};
