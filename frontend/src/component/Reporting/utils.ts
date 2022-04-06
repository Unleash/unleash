import parseISO from 'date-fns/parseISO';
import differenceInDays from 'date-fns/differenceInDays';

import { EXPERIMENT, OPERATIONAL, RELEASE } from 'constants/featureToggleTypes';

import { FOURTYDAYS, SEVENDAYS } from './constants';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';

export const toggleExpiryByTypeMap: Record<string, number> = {
    [EXPERIMENT]: FOURTYDAYS,
    [RELEASE]: FOURTYDAYS,
    [OPERATIONAL]: SEVENDAYS,
};

export interface IFeatureToggleListItemCheck extends IFeatureToggleListItem {
    checked: boolean;
}

export const applyCheckedToFeatures = (
    features: IFeatureToggleListItem[],
    checkedState: boolean
): IFeatureToggleListItemCheck[] => {
    return features.map(feature => ({
        ...feature,
        checked: checkedState,
    }));
};

export const getCheckedState = (
    name: string,
    features: IFeatureToggleListItemCheck[]
) => {
    const feature = features.find(feature => feature.name === name);

    if (feature) {
        return feature.checked;
    }

    return false;
};

export const getDiffInDays = (date: Date, now: Date) =>
    Math.abs(differenceInDays(date, now));

export const expired = (diff: number, type: string) => {
    if (diff >= toggleExpiryByTypeMap[type]) return true;
    return false;
};

export const getObjectProperties = <T extends object>(
    target: T,
    ...keys: (keyof T)[]
): Partial<T> => {
    const newObject: Partial<T> = {};

    keys.forEach(key => {
        if (target[key] !== undefined) {
            newObject[key] = target[key];
        }
    });

    return newObject;
};

export const sortFeaturesByNameAscending = (
    features: IFeatureToggleListItem[]
): IFeatureToggleListItem[] => {
    const sorted = [...features];
    sorted.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });
    return sorted;
};

export const sortFeaturesByNameDescending = (
    features: IFeatureToggleListItem[]
): IFeatureToggleListItem[] =>
    sortFeaturesByNameAscending([...features]).reverse();

export const sortFeaturesByLastSeenAscending = (
    features: IFeatureToggleListItem[]
): IFeatureToggleListItem[] => {
    const sorted = [...features];
    sorted.sort((a, b) => {
        if (!a.lastSeenAt) return -1;
        if (!b.lastSeenAt) return 1;

        const dateA = parseISO(a.lastSeenAt);
        const dateB = parseISO(b.lastSeenAt);

        return dateA.getTime() - dateB.getTime();
    });
    return sorted;
};

export const sortFeaturesByLastSeenDescending = (
    features: IFeatureToggleListItem[]
): IFeatureToggleListItem[] =>
    sortFeaturesByLastSeenAscending([...features]).reverse();

export const sortFeaturesByCreatedAtAscending = (
    features: IFeatureToggleListItem[]
): IFeatureToggleListItem[] => {
    const sorted = [...features];
    sorted.sort((a, b) => {
        const dateA = parseISO(a.createdAt);
        const dateB = parseISO(b.createdAt);

        return dateA.getTime() - dateB.getTime();
    });
    return sorted;
};

export const sortFeaturesByCreatedAtDescending = (
    features: IFeatureToggleListItem[]
): IFeatureToggleListItem[] =>
    sortFeaturesByCreatedAtAscending([...features]).reverse();

export const sortFeaturesByExpiredAtAscending = (
    features: IFeatureToggleListItem[]
): IFeatureToggleListItem[] => {
    const sorted = [...features];
    sorted.sort((a, b) => {
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

        const expiredByA = diffA - toggleExpiryByTypeMap[a.type];
        const expiredByB = diffB - toggleExpiryByTypeMap[b.type];

        return expiredByB - expiredByA;
    });
    return sorted;
};

export const sortFeaturesByExpiredAtDescending = (
    features: IFeatureToggleListItem[]
): IFeatureToggleListItem[] => {
    const sorted = [...features];
    const now = new Date();
    sorted.sort((a, b) => {
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

        const expiredByA = diffA - toggleExpiryByTypeMap[a.type];
        const expiredByB = diffB - toggleExpiryByTypeMap[b.type];

        return expiredByA - expiredByB;
    });
    return sorted;
};

export const sortFeaturesByStatusAscending = (
    features: IFeatureToggleListItem[]
): IFeatureToggleListItem[] => {
    const sorted = [...features];
    sorted.sort((a, b) => {
        if (a.stale) return 1;
        if (b.stale) return -1;
        return 0;
    });
    return sorted;
};

export const sortFeaturesByStatusDescending = (
    features: IFeatureToggleListItem[]
): IFeatureToggleListItem[] =>
    sortFeaturesByStatusAscending([...features]).reverse();

export const pluralize = (items: number, word: string): string => {
    if (items === 1) return `${items} ${word}`;
    return `${items} ${word}s`;
};

export const getDates = (dateString: string): [Date, Date] => {
    const date = parseISO(dateString);
    const now = new Date();

    return [date, now];
};
