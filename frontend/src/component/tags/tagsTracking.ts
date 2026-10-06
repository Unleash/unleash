import type { Tracking } from 'utils/trackingEvents';

export const createTagTypeTracking: Tracking = {
    event: 'tags',
    type: 'create-tag-type',
};

export const editTagTypeTracking: Tracking = {
    event: 'tags',
    type: 'edit-tag-type',
};

export const deleteTagTypeTracking: Tracking = {
    event: 'tags',
    type: 'delete-tag-type',
};

export const searchTagTypesTracking: Tracking = {
    event: 'tags',
    type: 'search-tag-types',
};

export const deleteTagValueTracking: Tracking = {
    event: 'tags',
    type: 'delete-tag-value',
};
