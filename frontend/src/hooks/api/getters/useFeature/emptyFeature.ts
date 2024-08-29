import type { IFeatureToggle } from 'interfaces/featureToggle';

export const emptyFeature: IFeatureToggle = {
    environments: [],
    name: '',
    type: 'release',
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
