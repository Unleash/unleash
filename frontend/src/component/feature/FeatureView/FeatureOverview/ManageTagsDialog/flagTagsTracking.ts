import type { Tracking } from 'utils/trackingEvents';

export const editFlagTagsTracking = (props: {
    addedCount: number;
    removedCount: number;
    tagCount: number;
}): Tracking => ({
    event: 'flag-tags',
    type: 'edit-flag-tags',
    props,
});

export const createTagValueTracking: Tracking = {
    event: 'flag-tags',
    type: 'create-tag-value',
};
