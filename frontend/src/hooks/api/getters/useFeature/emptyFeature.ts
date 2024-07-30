import type { FeatureSchema } from 'openapi';

export const emptyFeature: FeatureSchema = {
    environments: [],
    name: '',
    type: '',
    stale: false,
    archived: false,
    createdAt: '',
    lastSeenAt: '',
    project: '',
    variants: [],
    description: '',
    favorite: false,
    impressionData: false,
    dependencies: [],
    children: [],
};
