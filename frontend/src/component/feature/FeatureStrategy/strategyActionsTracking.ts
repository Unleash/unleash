import type { Tracking, TrackingProps } from 'utils/trackingEvents';
import type { FeatureEnvironmentStrategyScope } from './FeatureStrategyEdit/FeatureStrategyEdit.tsx';
import { foldStrategyType } from './summarizeStrategy.ts';

export type StrategySetupScreen = 'cards' | 'templates';

export const createStrategyTracking: Tracking = {
    event: 'flag-strategy',
    type: 'create-strategy',
};

export const selectStrategySetupTracking = (props: {
    initialScreen: StrategySetupScreen;
}): Tracking => ({
    event: 'flag-strategy',
    type: 'select-strategy-setup',
    props,
});

export const strategyTypeProps = ({
    selectedStrategyName,
    defaultStrategyName,
}: {
    selectedStrategyName: string;
    defaultStrategyName: string;
}): TrackingProps => ({
    strategyType: foldStrategyType(selectedStrategyName),
    defaultStrategyType: foldStrategyType(defaultStrategyName),
});

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
