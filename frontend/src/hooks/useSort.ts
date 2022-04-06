import { useState } from 'react';
import {
    sortFeaturesByNameAscending,
    sortFeaturesByNameDescending,
    sortFeaturesByLastSeenAscending,
    sortFeaturesByLastSeenDescending,
    sortFeaturesByCreatedAtAscending,
    sortFeaturesByCreatedAtDescending,
    sortFeaturesByExpiredAtAscending,
    sortFeaturesByExpiredAtDescending,
    sortFeaturesByStatusAscending,
    sortFeaturesByStatusDescending,
} from 'component/Reporting/utils';

import {
    LAST_SEEN,
    NAME,
    CREATED,
    EXPIRED,
    STATUS,
    REPORT,
} from 'component/Reporting/constants';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';

const useSort = () => {
    const [sortData, setSortData] = useState({
        sortKey: NAME,
        ascending: true,
    });

    const handleSortName = (features: IFeatureToggleListItem[]) => {
        if (sortData.ascending) {
            return sortFeaturesByNameAscending(features);
        }

        return sortFeaturesByNameDescending(features);
    };

    const handleSortLastSeen = (features: IFeatureToggleListItem[]) => {
        if (sortData.ascending) {
            return sortFeaturesByLastSeenAscending(features);
        }
        return sortFeaturesByLastSeenDescending(features);
    };

    const handleSortCreatedAt = (features: IFeatureToggleListItem[]) => {
        if (sortData.ascending) {
            return sortFeaturesByCreatedAtAscending(features);
        }
        return sortFeaturesByCreatedAtDescending(features);
    };

    const handleSortExpiredAt = (features: IFeatureToggleListItem[]) => {
        if (sortData.ascending) {
            return sortFeaturesByExpiredAtAscending(features);
        }
        return sortFeaturesByExpiredAtDescending(features);
    };

    const handleSortStatus = (features: IFeatureToggleListItem[]) => {
        if (sortData.ascending) {
            return sortFeaturesByStatusAscending(features);
        }
        return sortFeaturesByStatusDescending(features);
    };

    const sort = (features: IFeatureToggleListItem[]) => {
        switch (sortData.sortKey) {
            case NAME:
                return handleSortName(features);
            case LAST_SEEN:
                return handleSortLastSeen(features);
            case CREATED:
                return handleSortCreatedAt(features);
            case EXPIRED:
            case REPORT:
                return handleSortExpiredAt(features);
            case STATUS:
                return handleSortStatus(features);
            default:
                return features;
        }
    };

    return [sort, setSortData];
};

export default useSort;
