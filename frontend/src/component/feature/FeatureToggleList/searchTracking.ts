import type { Tracking } from 'utils/trackingEvents';

export const flagsSearchedTracking = (
    screen: 'features' | 'project',
): Tracking => ({
    event: 'search-bar',
    type: 'flags-searched',
    props: { screen },
});
