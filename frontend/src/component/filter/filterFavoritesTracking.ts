import type { Tracking } from 'utils/trackingEvents';

export const filterFavoritesTracking: Tracking = {
    event: 'favorite',
    type: 'filter-favorites',
};
