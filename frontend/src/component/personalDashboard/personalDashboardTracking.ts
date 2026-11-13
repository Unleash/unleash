import type { Tracking } from 'utils/trackingEvents';

// One row per dashboard load, carrying which sections were open. Section state
// persists in localStorage, so toggle rows alone cannot say how often a section is seen.
export const personalDashboardTracking: Tracking = {
    event: 'personal-dashboard',
    type: 'view-dashboard',
};

export const toggleDashboardSectionTracking: Tracking = {
    event: 'personal-dashboard',
    type: 'toggle-section',
};

export const filterFlagsTracking: Tracking = {
    event: 'personal-dashboard',
    type: 'filter-flags',
};

export const openFullListTracking: Tracking = {
    event: 'personal-dashboard',
    type: 'open-full-list',
};

export const viewOnboardingWidgetTracking: Tracking = {
    event: 'personal-dashboard',
    type: 'view-onboarding-widget',
};

export const selectOnboardingSetupTracking: Tracking = {
    event: 'personal-dashboard',
    type: 'select-onboarding-setup',
};

export const openOnboardingResourceTracking: Tracking = {
    event: 'personal-dashboard',
    type: 'open-onboarding-resource',
};

export const dismissOnboardingBannerTracking: Tracking = {
    event: 'personal-dashboard',
    type: 'cancel-onboarding-banner',
};

export type OnboardingWidget =
    | 'getting-started'
    | 'new-to-unleash'
    | 'help'
    | 'import'
    | 'enterprise';
