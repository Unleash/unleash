import type { LifecycleStage } from './LifecycleStage.jsx';
import type { LifecycleFeature } from './FeatureLifecycle.jsx';

export const populateCurrentStage = (
    feature: Pick<LifecycleFeature, 'lifecycle' | 'environments'>,
): LifecycleStage | undefined => {
    if (!feature.lifecycle) return undefined;

    const getFilteredEnvironments = (
        condition: (env: { type: string; enabled: boolean }) => boolean,
    ) => {
        return (feature.environments || [])
            .filter((env) => condition(env) && Boolean(env.lastSeenAt))
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
                    (env) =>
                        env.type !== 'production' ||
                        (env.type === 'production' && !env.enabled),
                ),
                enteredStageAt,
            };
        case 'live':
            return {
                name: 'live',
                environments: getFilteredEnvironments(
                    (env) => env.type === 'production' && env.enabled,
                ),
                enteredStageAt,
            };
        case 'completed':
            return {
                name: 'completed',
                status:
                    feature.lifecycle.status === 'discarded'
                        ? 'discarded'
                        : 'kept',
                environments: getFilteredEnvironments(() => true),
                enteredStageAt,
            };
        case 'archived':
            return { name: 'archived', enteredStageAt };
        default:
            return undefined;
    }
};
