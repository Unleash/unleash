import type { Lifecycle } from 'interfaces/featureToggle';

export const getFeatureLifecycleName = (stage: Lifecycle['stage']): string => {
    if (stage === 'initial') {
        return 'Define';
    }
    if (stage === 'pre-live') {
        return 'Develop';
    }
    if (stage === 'live') {
        return 'Production';
    }
    if (stage === 'completed') {
        return 'Cleanup';
    }
    if (stage === 'archived') {
        return 'Archived';
    }

    return stage;
};
