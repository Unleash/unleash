import type { FC } from 'react';
import { styled } from '@mui/material';
import { MultimetricChartCard } from './MultimetricChartCard';
import { useGroupedImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useGroupedImpactMetricsData';
import { useFeatureEnvironmentEvents } from 'hooks/api/getters/useFeatureEnvironmentEvents/useFeatureEnvironmentEvents';
import type { ConfigGroup } from './groupImpactConfigs';

const StyledWrapper = styled('div')({
    gridColumn: '1 / -1',
});

interface GroupedChartCardProps {
    group: ConfigGroup;
    projectId: string;
    featureName: string;
}

export const GroupedChartCard: FC<GroupedChartCardProps> = ({
    group,
    projectId,
    featureName,
}) => {
    const { stepSeries, stepTotals, start, end, loading } =
        useGroupedImpactMetricsData(group.configs);
    const { featureEvents } = useFeatureEnvironmentEvents({
        featureName,
        project: projectId,
    });

    const title = group.configs[0].title || group.configs[0].displayName;

    return (
        <StyledWrapper>
            <MultimetricChartCard
                title={title}
                timeRange={group.timeRange}
                stepCount={group.configs.length}
                stepSeries={stepSeries}
                stepTotals={stepTotals}
                start={start}
                end={end}
                featureEvents={featureEvents}
                loading={loading}
                href={`/projects/${projectId}/features/${featureName}/metrics`}
            />
        </StyledWrapper>
    );
};
