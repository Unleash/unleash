import type { Tracking } from 'utils/trackingEvents';
import type { FeatureEnvironmentStrategyScope } from './FeatureStrategyEdit/FeatureStrategyEdit.tsx';

export const deleteStrategyTracking: Tracking = {
    event: 'flag-strategy',
    type: 'delete-strategy',
};

export const toggleStrategyTracking: Tracking = {
    event: 'flag-strategy',
    type: 'toggle-strategy',
};

export const copyStrategyTracking: Tracking = {
    event: 'flag-strategy',
    type: 'copy-strategy',
};

export const editStrategyTracking = (props: {
    strategyScope: FeatureEnvironmentStrategyScope;
    viaChangeRequest?: boolean;
}): Tracking => ({
    event: 'flag-strategy',
    type: 'edit-strategy',
    props,
});
