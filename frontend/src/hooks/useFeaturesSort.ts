import { IFeatureToggle } from '../interfaces/featureToggle';
import React, { useMemo } from 'react';
import { getBasePath } from 'utils/formatPath';
import { createPersistentGlobalStateHook } from './usePersistentGlobalState';
import { parseISO } from 'date-fns';
import {
    expired,
    getDiffInDays,
    toggleExpiryByTypeMap,
} from 'component/Reporting/utils';

type FeaturesSortType =
    | 'name'
    | 'expired'
    | 'type'
    | 'enabled'
    | 'stale'
    | 'created'
    | 'last-seen'
    | 'status'
    | 'project';

interface IFeaturesSort {
    type: FeaturesSortType;
    desc?: boolean;
}

export interface IFeaturesSortOutput {
    sort: IFeaturesSort;
    sorted: IFeatureToggle[];
    setSort: React.Dispatch<React.SetStateAction<IFeaturesSort>>;
}

export interface IFeaturesFilterSortOption {
    type: FeaturesSortType;
    name: string;
}

// Store the features sort state globally, and in localStorage.
// When changing the format of IFeaturesSort, change the version as well.
const useFeaturesSortState = createPersistentGlobalStateHook<IFeaturesSort>(
    `${getBasePath()}:useFeaturesSort:v1`,
    { type: 'name' }
);

export const useFeaturesSort = (
    features: IFeatureToggle[]
): IFeaturesSortOutput => {
    const [sort, setSort] = useFeaturesSortState();

    const sorted = useMemo(() => {
        return sortFeatures(features, sort);
    }, [features, sort]);

    return {
        setSort,
        sort,
        sorted,
    };
};

export const createFeaturesFilterSortOptions =
    (): IFeaturesFilterSortOption[] => {
        return [
            { type: 'name', name: 'Name' },
            { type: 'type', name: 'Type' },
            { type: 'enabled', name: 'Enabled' },
            { type: 'stale', name: 'Stale' },
            { type: 'created', name: 'Created' },
            { type: 'last-seen', name: 'Last seen' },
            { type: 'project', name: 'Project' },
        ];
    };

const sortAscendingFeatures = (
    features: IFeatureToggle[],
    sort: IFeaturesSort
): IFeatureToggle[] => {
    switch (sort.type) {
        case 'enabled':
            return sortByEnabled(features);
        case 'stale':
            return sortByStale(features);
        case 'created':
            return sortByCreated(features);
        case 'last-seen':
            return sortByLastSeen(features);
        case 'name':
            return sortByName(features);
        case 'project':
            return sortByProject(features);
        case 'type':
            return sortByType(features);
        case 'expired':
            return sortByExpired(features);
        case 'status':
            return sortByStatus(features);
        default:
            console.error(`Unknown feature sort type: ${sort.type}`);
            return features;
    }
};

const sortFeatures = (
    features: IFeatureToggle[],
    sort: IFeaturesSort
): IFeatureToggle[] => {
    const sorted = sortAscendingFeatures(features, sort);

    if (sort.desc) {
        return [...sorted].reverse();
    }

    return sorted;
};

const sortByEnabled = (
    features: Readonly<IFeatureToggle[]>
): IFeatureToggle[] => {
    return [...features].sort((a, b) =>
        a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1
    );
};

const sortByStale = (
    features: Readonly<IFeatureToggle[]>
): IFeatureToggle[] => {
    return [...features].sort((a, b) =>
        a.stale === b.stale ? 0 : a.stale ? -1 : 1
    );
};

const sortByLastSeen = (
    features: Readonly<IFeatureToggle[]>
): IFeatureToggle[] => {
    return [...features].sort((a, b) =>
        a.lastSeenAt && b.lastSeenAt
            ? b.lastSeenAt.localeCompare(a.lastSeenAt)
            : a.lastSeenAt
            ? -1
            : b.lastSeenAt
            ? 1
            : b.createdAt.localeCompare(a.createdAt)
    );
};

const sortByCreated = (
    features: Readonly<IFeatureToggle[]>
): IFeatureToggle[] => {
    return [...features].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

const sortByName = (features: Readonly<IFeatureToggle[]>): IFeatureToggle[] => {
    return [...features].sort((a, b) => a.name.localeCompare(b.name));
};

const sortByProject = (
    features: Readonly<IFeatureToggle[]>
): IFeatureToggle[] => {
    return [...features].sort((a, b) => a.project.localeCompare(b.project));
};

const sortByType = (features: Readonly<IFeatureToggle[]>): IFeatureToggle[] => {
    return [...features].sort((a, b) => a.type.localeCompare(b.type));
};
const sortByExpired = (
    features: Readonly<IFeatureToggle[]>
): IFeatureToggle[] => {
    return [...features].sort((a, b) => {
        const now = new Date();
        const dateA = parseISO(a.createdAt);
        const dateB = parseISO(b.createdAt);

        const diffA = getDiffInDays(dateA, now);
        const diffB = getDiffInDays(dateB, now);

        if (!expired(diffA, a.type) && expired(diffB, b.type)) {
            return 1;
        }

        if (expired(diffA, a.type) && !expired(diffB, b.type)) {
            return -1;
        }

        const expiration = toggleExpiryByTypeMap as Record<string, number>;
        const expiredByA = diffA - expiration[a.type];
        const expiredByB = diffB - expiration[b.type];

        return expiredByB - expiredByA;
    });
};

const sortByStatus = (
    features: Readonly<IFeatureToggle[]>
): IFeatureToggle[] => {
    return [...features].sort((a, b) => {
        if (a.stale) {
            return 1;
        } else if (b.stale) {
            return -1;
        } else {
            return 0;
        }
    });
};
