import type { Tracking } from 'utils/trackingEvents';

export const exportEventLogTracking: Tracking = {
    event: 'event-log',
    type: 'export-event-log',
};

export const toggleRawViewTracking: Tracking = {
    event: 'event-log',
    type: 'toggle-raw-view',
};

export const paginateTableTracking: Tracking = {
    event: 'event-log',
    type: 'paginate-table',
};

export const selectPageSizeTracking: Tracking = {
    event: 'event-log',
    type: 'select-page-size',
};
