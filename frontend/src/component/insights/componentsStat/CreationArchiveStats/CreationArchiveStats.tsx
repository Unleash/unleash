import type { FC } from 'react';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import type { InstanceInsightsSchema } from 'openapi';
import { calculateArchiveRatio } from './calculateArchiveRatio.ts';
import { StatCard } from '../shared/StatCard.tsx';

interface CreationArchiveStatsProps {
    groupedCreationArchiveData: GroupedDataByProject<
        InstanceInsightsSchema['creationArchiveTrends']
    >;
    isLoading?: boolean;
}

export const CreationArchiveStats: FC<CreationArchiveStatsProps> = ({
    groupedCreationArchiveData,
    isLoading,
}) => {
    const averageRatio = calculateArchiveRatio(groupedCreationArchiveData);

    return (
        <StatCard
            value={averageRatio}
            label='Average ratio'
            tooltip='Ratio of archived flags to created flags in the selected period'
            explanation='Do you create more flags than you archive? Or do you have good process for cleaning up?'
            link={{
                to: '/search?lifecycle=IS:completed',
                text: 'View flags in cleanup stage',
            }}
            isLoading={isLoading}
        />
    );
};
