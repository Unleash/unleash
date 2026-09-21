import type { Tracking } from 'utils/trackingEvents';

export const addFilterTracking: Tracking = {
    event: 'list-filters',
    type: 'add-filter',
};

export const toggleFilterValueTracking: Tracking = {
    event: 'list-filters',
    type: 'toggle-filter-value',
};

export const removeFilterTracking: Tracking = {
    event: 'list-filters',
    type: 'remove-filter',
};
