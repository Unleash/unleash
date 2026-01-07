import type { IProject } from 'interfaces/project';

export type ListItemType = Pick<
    IProject['features'][number],
    'name' | 'lastSeenAt' | 'createdAt' | 'type' | 'stale' | 'favorite'
> & {
    environments: {
        [key in string]: {
            name: string;
            enabled: boolean;
            variantCount: number;
            type: string;
            hasStrategies: boolean;
            hasEnabledStrategies: boolean;
            hasReleasePlans: boolean;
        };
    };
    someEnabledEnvironmentHasVariants: boolean;
};
