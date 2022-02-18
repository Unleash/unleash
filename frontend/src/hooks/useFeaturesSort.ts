import { IFeatureToggle } from '../interfaces/featureToggle';
import React, { useMemo } from 'react';
import { getBasePath } from '../utils/format-path';
import { createPersistentGlobalState } from './usePersistentGlobalState';

type FeaturesSortType =
    | 'name'
    | 'type'
    | 'enabled'
    | 'stale'
    | 'created'
    | 'last-seen'
    | 'project';

interface IFeaturesSort {
    type: FeaturesSortType;
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
const useFeaturesSortState = createPersistentGlobalState<IFeaturesSort>(
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

const sortFeatures = (
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
        default:
            console.error(`Unknown feature sort type: ${sort.type}`);
            return features;
    }
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
            ? a.lastSeenAt.localeCompare(b.lastSeenAt)
            : 0
    );
};

const sortByCreated = (
    features: Readonly<IFeatureToggle[]>
): IFeatureToggle[] => {
    return [...features].sort((a, b) =>
        new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1
    );
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
