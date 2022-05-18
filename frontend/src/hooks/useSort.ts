import { useState, useCallback } from 'react';
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

import { ReportingSortType } from 'component/Reporting/constants';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';

/**
 * @deprecated
 */
const useSort = () => {
    const [sortData, setSortData] = useState<{
        sortKey: ReportingSortType;
        ascending: boolean;
    }>({
        sortKey: 'name',
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

    const sort = useCallback(
        (features: IFeatureToggleListItem[]): IFeatureToggleListItem[] => {
            switch (sortData.sortKey) {
                case 'name':
                    return handleSortName(features);
                case 'last-seen':
                    return handleSortLastSeen(features);
                case 'created':
                    return handleSortCreatedAt(features);
                case 'expired':
                case 'report':
                    return handleSortExpiredAt(features);
                case 'status':
                    return handleSortStatus(features);
                default:
                    return features;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [sortData]
    );

    return [sort, setSortData] as const;
};

export default useSort;
