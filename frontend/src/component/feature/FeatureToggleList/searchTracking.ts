import type { Tracking } from 'utils/trackingEvents';

export const searchFlagsTracking = (
    screen: 'features' | 'project',
): Tracking => ({
    event: 'search-bar',
    type: 'search-flags',
    props: { screen },
});
