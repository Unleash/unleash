import React, { useMemo } from 'react';
import { getBasePath } from 'utils/formatPath';
import { createPersistentGlobalStateHook } from './usePersistentGlobalState';
import {
    expired,
    getDiffInDays,
    toggleExpiryByTypeMap,
} from 'component/Reporting/utils';
import { FeatureSchema } from 'openapi';

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
    sorted: FeatureSchema[];
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
    features: FeatureSchema[]
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
    features: FeatureSchema[],
    sort: IFeaturesSort
): FeatureSchema[] => {
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
    features: FeatureSchema[],
    sort: IFeaturesSort
): FeatureSchema[] => {
    const sorted = sortAscendingFeatures(features, sort);

    if (sort.desc) {
        return [...sorted].reverse();
    }

    return sorted;
};

const sortByEnabled = (
    features: Readonly<FeatureSchema[]>
): FeatureSchema[] => {
    return [...features].sort((a, b) =>
        a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1
    );
};

const sortByStale = (features: Readonly<FeatureSchema[]>): FeatureSchema[] => {
    return [...features].sort((a, b) =>
        a.stale === b.stale ? 0 : a.stale ? -1 : 1
    );
};

const sortByLastSeen = (
    features: Readonly<FeatureSchema[]>
): FeatureSchema[] => {
    return [...features].sort((a, b) =>
        a.lastSeenAt && b.lastSeenAt
            ? compareNullableDates(b.lastSeenAt, a.lastSeenAt)
            : a.lastSeenAt
            ? -1
            : b.lastSeenAt
            ? 1
            : compareNullableDates(b.createdAt, a.createdAt)
    );
};

const sortByCreated = (
    features: Readonly<FeatureSchema[]>
): FeatureSchema[] => {
    return [...features].sort((a, b) =>
        compareNullableDates(b.createdAt, a.createdAt)
    );
};

const sortByName = (features: Readonly<FeatureSchema[]>): FeatureSchema[] => {
    return [...features].sort((a, b) => a.name.localeCompare(b.name));
};

const sortByProject = (
    features: Readonly<FeatureSchema[]>
): FeatureSchema[] => {
    return [...features].sort((a, b) => a.project.localeCompare(b.project));
};

const sortByType = (features: Readonly<FeatureSchema[]>): FeatureSchema[] => {
    return [...features].sort((a, b) =>
        a.type && b.type
            ? a.type.localeCompare(b.type)
            : a.type
            ? 1
            : b.type
            ? -1
            : 0
    );
};

const compareNullableDates = (
    a: Date | null | undefined,
    b: Date | null | undefined
): number => {
    return a && b ? a.getTime() - b.getTime() : a ? 1 : b ? -1 : 0;
};
const sortByExpired = (
    features: Readonly<FeatureSchema[]>
): FeatureSchema[] => {
    return [...features].sort((a, b) => {
        const now = new Date();
        const dateA = a.createdAt!;
        const dateB = b.createdAt!;

        const diffA = getDiffInDays(dateA, now);
        const diffB = getDiffInDays(dateB, now);

        if (!expired(diffA, a.type!) && expired(diffB, b.type!)) {
            return 1;
        }

        if (expired(diffA, a.type!) && !expired(diffB, b.type!)) {
            return -1;
        }

        const expiration = toggleExpiryByTypeMap as Record<string, number>;
        const expiredByA = a.type ? diffA - expiration[a.type] : 0;
        const expiredByB = b.type ? diffB - expiration[b.type] : 0;

        return expiredByB - expiredByA;
    });
};

const sortByStatus = (features: Readonly<FeatureSchema[]>): FeatureSchema[] => {
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
