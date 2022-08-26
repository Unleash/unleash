import React, { useMemo } from 'react';
import { createGlobalStateHook } from 'hooks/useGlobalState';
import { FeatureSchema } from 'openapi';

export interface IFeaturesFilter {
    query?: string;
    project: string;
}

export interface IFeaturesSortOutput {
    filtered: FeatureSchema[];
    filter: IFeaturesFilter;
    setFilter: React.Dispatch<React.SetStateAction<IFeaturesFilter>>;
}

// Store the features filter state globally, and in localStorage.
// When changing the format of IFeaturesFilter, change the version as well.
const useFeaturesFilterState = createGlobalStateHook<IFeaturesFilter>(
    'useFeaturesFilterState',
    { project: '*' }
);

export const useFeaturesFilter = (
    features: FeatureSchema[]
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

const filterFeatures = (
    features: FeatureSchema[],
    filter: IFeaturesFilter
): FeatureSchema[] => {
    return filterFeaturesByQuery(
        filterFeaturesByProject(features, filter),
        filter
    );
};

const filterFeaturesByProject = (
    features: FeatureSchema[],
    filter: IFeaturesFilter
): FeatureSchema[] => {
    return filter.project === '*'
        ? features
        : features.filter(f => f.project === filter.project);
};

const filterFeaturesByQuery = (
    features: FeatureSchema[],
    filter: IFeaturesFilter
): FeatureSchema[] => {
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
    feature: FeatureSchema,
    filter: IFeaturesFilter,
    regExp: RegExp
): boolean => {
    if (
        regExp.test(feature.name) ||
        (feature.description && regExp.test(feature.description))
    ) {
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
        strategy =>
            regExp.test(strategy.name) ||
            strategy.constraints?.some(constraint =>
                constraint.values?.some(value => regExp.test(value))
            )
    );
};
