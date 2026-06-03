import type { FC } from 'react';
import { styled } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import { GoalSummaryPanel } from './views/GoalSummaryPanel/GoalSummaryPanel';
import { MultimetricChartCard } from './views/MultimetricChartCard/MultimetricChartCard';
import { FollowedFeaturesList } from './views/FollowedFeaturesList/FollowedFeaturesList';
import { useGoalViewData } from './views/goalView/useGoalViewData';
import { GOAL_VIEW } from './fixtures/goalViewConfig';

const TIME_RANGE_LABELS: Record<ChartTimeRange, string> = {
    hour: 'Last hour',
    day: 'Last 24 hours',
    week: 'Last 7 days',
    month: 'Last 30 days',
};

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

const StyledCard = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledFeatures = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

export const ImpactViewsPage: FC = () => {
    const view = GOAL_VIEW;
    const data = useGoalViewData(view);
    const timeLabel = TIME_RANGE_LABELS[view.timeRange];

    return (
        <StyledWrapper>
            <PageHeader title='Impact views' />
            <StyledCard>
                <MultimetricChartCard
                    title={data.goalLabel}
                    subtitle={`Goal · ${timeLabel}`}
                    timeRange={view.timeRange}
                    aggregationMode={view.metrics[0]?.aggregationMode}
                    stepSeries={data.stepSeries}
                    stepTotals={data.stepTotals}
                    featureEvents={data.featureEvents}
                    start={data.start}
                    end={data.end}
                    loading={data.loading}
                    chartHeightSpacing={{ base: 48, lg: 40, sm: 32 }}
                    totalsLabel='Goal'
                    totalsHeaderSlot={
                        data.goalSummary ? (
                            <GoalSummaryPanel
                                goalMetricLabel={data.goalLabel}
                                summary={data.goalSummary}
                                series={data.goalSeries}
                                timeLabel={timeLabel}
                            />
                        ) : null
                    }
                />
            </StyledCard>
            <StyledFeatures>
                <FollowedFeaturesList features={data.resolvedFeatures} />
            </StyledFeatures>
        </StyledWrapper>
    );
};
