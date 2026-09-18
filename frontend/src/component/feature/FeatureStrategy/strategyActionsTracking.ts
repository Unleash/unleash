import type { Tracking } from 'utils/trackingEvents';
import type { FeatureEnvironmentStrategyScope } from './FeatureStrategyEdit/FeatureStrategyEdit.tsx';

export const strategyDeletedTracking: Tracking = {
    event: 'flag-strategy',
    type: 'strategy-deleted',
};

export const strategyToggledTracking: Tracking = {
    event: 'flag-strategy',
    type: 'strategy-toggled',
};

export const strategyCopiedTracking: Tracking = {
    event: 'flag-strategy',
    type: 'strategy-copied',
};

export const strategyUpdatedTracking = (props: {
    strategyScope: FeatureEnvironmentStrategyScope;
    viaChangeRequest?: boolean;
}): Tracking => ({
    event: 'flag-strategy',
    type: 'strategy-updated',
    props,
});
