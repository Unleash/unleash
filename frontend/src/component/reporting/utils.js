import parseISO from 'date-fns/parseISO';
import differenceInDays from 'date-fns/differenceInDays';

import { EXPERIMENT, OPERATIONAL, RELEASE, FOURTYDAYS, SEVENDAYS } from './constants';

export const toggleExpiryByTypeMap = {
    [EXPERIMENT]: FOURTYDAYS,
    [RELEASE]: FOURTYDAYS,
    [OPERATIONAL]: SEVENDAYS,
};

export const applyCheckedToFeatures = (features, checkedState) =>
    features.map(feature => ({ ...feature, checked: checkedState }));

export const getCheckedState = (name, features) => {
    const feature = features.find(feature => feature.name === name);

    if (feature) {
        return feature.checked ? feature.checked : false;
    }
    return false;
};

export const getDiffInDays = (date, now) => Math.abs(differenceInDays(date, now));

export const formatProjectOptions = projects => projects.map(project => ({ key: project.id, label: project.name }));

export const expired = (diff, type) => {
    if (diff >= toggleExpiryByTypeMap[type]) return true;
    return false;
};

export const getObjectProperties = (target, ...keys) => {
    const newObject = {};

    keys.forEach(key => {
        if (target[key] !== undefined) {
            newObject[key] = target[key];
        }
    });

    return newObject;
};

export const sortFeaturesByNameAscending = features => {
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

export const sortFeaturesByNameDescending = features => sortFeaturesByNameAscending([...features]).reverse();

export const sortFeaturesByLastSeenAscending = features => {
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

export const sortFeaturesByLastSeenDescending = features => sortFeaturesByLastSeenAscending([...features]).reverse();

export const sortFeaturesByCreatedAtAscending = features => {
    const sorted = [...features];
    sorted.sort((a, b) => {
        const dateA = parseISO(a.createdAt);
        const dateB = parseISO(b.createdAt);

        return dateA.getTime() - dateB.getTime();
    });
    return sorted;
};

export const sortFeaturesByCreatedAtDescending = features => sortFeaturesByCreatedAtAscending([...features]).reverse();

export const sortFeaturesByExpiredAtAscending = features => {
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

export const sortFeaturesByExpiredAtDescending = features => {
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

export const sortFeaturesByStatusAscending = features => {
    const sorted = [...features];
    sorted.sort((a, b) => {
        if (a.stale) return 1;
        if (b.stale) return -1;
        return 0;
    });
    return sorted;
};

export const sortFeaturesByStatusDescending = features => sortFeaturesByStatusAscending([...features]).reverse();

export const pluralize = (items, word) => {
    if (items === 1) return `${items} ${word}`;
    return `${items} ${word}s`;
};

export const getDates = dateString => {
    const date = parseISO(dateString);
    const now = new Date();

    return [date, now];
};

export const filterByProject = selectedProject => feature => feature.project === selectedProject;

export const isFeatureExpired = feature => {
    const [date, now] = getDates(feature.createdAt);
    const diff = getDiffInDays(date, now);

    return expired(diff, feature.type);
};
