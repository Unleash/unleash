import type { FC } from 'react';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import type { InstanceInsightsSchema } from 'openapi';
import { calculateMedian } from './calculateMedian.ts';
import { StatCard } from '../shared/StatCard.tsx';

interface NewProductionFlagsStatsProps {
    groupedLifecycleData: GroupedDataByProject<
        InstanceInsightsSchema['lifecycleTrends']
    >;
    isLoading?: boolean;
}

export const NewProductionFlagsStats: FC<NewProductionFlagsStatsProps> = ({
    groupedLifecycleData,
    isLoading,
}) => {
    const median = calculateMedian(groupedLifecycleData);

    return (
        <StatCard
            value={median}
            label='Median per week'
            tooltip='The median number of flags that have entered production for the selected time range.'
            explanation='How often do flags go live in production?'
            isLoading={isLoading}
        />
    );
};
