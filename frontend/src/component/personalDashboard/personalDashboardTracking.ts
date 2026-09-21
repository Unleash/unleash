import type { Tracking } from 'utils/trackingEvents';

// One row per dashboard load, carrying which sections were open. Section state
// persists in localStorage, so toggle rows alone cannot say how often a section is seen.
export const personalDashboardTracking: Tracking = {
    event: 'personal-dashboard',
};

export const toggleDashboardSectionTracking: Tracking = {
    event: 'personal-dashboard',
    type: 'toggle-section',
};
