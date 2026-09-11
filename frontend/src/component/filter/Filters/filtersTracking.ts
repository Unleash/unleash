import type { Tracking } from 'utils/trackingEvents';

export const filterAddedTracking: Tracking = {
    event: 'list-filters',
    type: 'filter-added',
};

export const filterValueToggledTracking: Tracking = {
    event: 'list-filters',
    type: 'filter-value-toggled',
};

export const filterRemovedTracking: Tracking = {
    event: 'list-filters',
    type: 'filter-removed',
};
