import type { FeatureSchema } from 'openapi';

export const emptyFeature: FeatureSchema = {
    name: '',
    type: 'release',
    stale: false,
    archived: false,
    environments: [],
    favorite: false,
    impressionData: false,
};
