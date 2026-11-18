import type { Tracking, TrackingProps } from 'utils/trackingEvents';
import type { FeatureEnvironmentStrategyScope } from './FeatureStrategyEdit/FeatureStrategyEdit.tsx';
import { foldStrategyType } from './summarizeStrategy.ts';

export type StrategySetupScreen = 'cards' | 'templates';

// Extend this union when the next form version comes along. The legacy form
// predates it and sends no formVersion, so an event without one comes from
// the legacy form, or from no form at all, e.g. the menu's "apply default
// strategy" shortcut.
export type StrategyFormVersion = 'single-page-Q4-2026';

export const strategyFormVersionProps = (
    singlePageStrategyForm: boolean,
): { formVersion: StrategyFormVersion } | undefined =>
    singlePageStrategyForm ? { formVersion: 'single-page-Q4-2026' } : undefined;

export const createStrategyTracking = (props?: {
    formVersion: StrategyFormVersion;
}): Tracking => ({
    event: 'flag-strategy',
    type: 'create-strategy',
    props,
});

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
    formVersion?: StrategyFormVersion;
    viaChangeRequest?: boolean;
}): Tracking => ({
    event: 'flag-strategy',
    type: 'edit-strategy',
    props,
});

export const strategyDocsLinkTracking: Tracking = {
    event: 'flag-strategy',
    type: 'open-strategy-docs',
};
