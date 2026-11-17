import type { Tracking } from 'utils/trackingEvents';

export const searchDocsTracking = (
    openedFrom: 'header' | 'help-menu',
): Tracking => ({
    event: 'search-docs',
    type: 'search-docs',
    props: { openedFrom },
});
