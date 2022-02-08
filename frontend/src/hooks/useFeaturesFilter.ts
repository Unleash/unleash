import { IFeatureToggle } from '../interfaces/featureToggle';
import React, { useMemo } from 'react';
import { getBasePath } from '../utils/format-path';
import { createPersistentGlobalState } from './usePersistentGlobalState';

export interface IFeaturesFilter {
    query?: string;
    project: string;
}

export interface IFeaturesSortOutput {
    filtered: IFeatureToggle[];
    filter: IFeaturesFilter;
    setFilter: React.Dispatch<React.SetStateAction<IFeaturesFilter>>
}

// Store the features filter state globally, and in localStorage.
// When changing the format of IFeaturesFilter, change the version as well.
const useFeaturesFilterState = createPersistentGlobalState<IFeaturesFilter>(
    `${getBasePath()}:useFeaturesFilter:v1`,
    { project: '*' }
);

export const useFeaturesFilter = (
    features: IFeatureToggle[]
): IFeaturesSortOutput => {
    const [filter, setFilter] = useFeaturesFilterState();

    const filtered = useMemo(() => {
        return filterFeatures(features, filter);
    }, [features, filter]);

    return {
        setFilter,
        filter,
        filtered,
    };
};

// Return the current project ID a project has been selected,
// or the 'default' project if showing all projects.
export const resolveFilteredProjectId = (filter: IFeaturesFilter): string => {
    if (!filter.project || filter.project === '*') {
        return 'default';
    }

    return filter.project;
};

const filterFeatures = (
    features: IFeatureToggle[],
    filter: IFeaturesFilter
): IFeatureToggle[] => {
    return filterFeaturesByQuery(
        filterFeaturesByProject(features, filter),
        filter
    );
};

const filterFeaturesByProject = (
    features: IFeatureToggle[],
    filter: IFeaturesFilter
): IFeatureToggle[] => {
    return filter.project === '*'
        ? features
        : features.filter(f => f.project === filter.project);
};

const filterFeaturesByQuery = (
    features: IFeatureToggle[],
    filter: IFeaturesFilter
): IFeatureToggle[] => {
    if (!filter.query) {
        return features;
    }

    // Try to parse the search query as a RegExp.
    // Return all features if it can't be parsed.
    try {
        const regExp = new RegExp(filter.query, 'i');
        return features.filter(f => filterFeatureByRegExp(f, filter, regExp));
    } catch (err) {
        if (err instanceof SyntaxError) {
            return features;
        } else {
            throw err;
        }
    }
};

const filterFeatureByRegExp = (
    feature: IFeatureToggle,
    filter: IFeaturesFilter,
    regExp: RegExp
): boolean => {
    if (regExp.test(feature.name) || regExp.test(feature.description)) {
        return true;
    }

    if (
        filter.query &&
        filter.query.length > 1 &&
        regExp.test(JSON.stringify(feature))
    ) {
        return true;
    }

    if (!feature.strategies) {
        return false;
    }

    return feature.strategies.some(
        s =>
            regExp.test(s.name) ||
            s.constraints.some(c => c.values.some(v => regExp.test(v)))
    );
};
