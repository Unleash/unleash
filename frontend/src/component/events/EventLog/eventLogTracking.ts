import type { Tracking } from 'utils/trackingEvents';

export const eventLogExportedTracking: Tracking = {
    event: 'event-log',
    type: 'exported',
};

export const eventLogRawViewToggledTracking: Tracking = {
    event: 'event-log',
    type: 'raw-view-toggled',
};

export const eventLogPaginatedTracking: Tracking = {
    event: 'event-log',
    type: 'paginated',
};

export const eventLogPageSizeChangedTracking: Tracking = {
    event: 'event-log',
    type: 'page-size-changed',
};
