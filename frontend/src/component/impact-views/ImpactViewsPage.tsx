import type { FC } from 'react';
import { styled } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { GoalSummaryPanel } from './views/GoalSummaryPanel/GoalSummaryPanel';
import { MultimetricChartCard } from './views/MultimetricChartCard/MultimetricChartCard';
import { FollowedFeaturesList } from './views/FollowedFeaturesList/FollowedFeaturesList';
import {
    DUMMY_END,
    DUMMY_FEATURE_EVENTS,
    DUMMY_FOLLOWED_FEATURES,
    DUMMY_GOAL_METRIC_LABEL,
    DUMMY_GOAL_SERIES,
    DUMMY_GOAL_SUMMARY,
    DUMMY_GOAL_TIME_LABEL,
    DUMMY_START,
    DUMMY_STEP_SERIES,
    DUMMY_STEP_TOTALS,
} from './fixtures/dummyGoalSummary';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

// Temporary: previews the chart card (with the goal summary panel in its header
// slot) using dummy data so we can see it render. Replaced by the full
// GoalTrackingViewChart (still dummy-fed) in a later PR — see ./README.md.
const StyledCardPreview = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledFeaturesPreview = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

export const ImpactViewsPage: FC = () => (
    <StyledWrapper>
        <PageHeader title='Impact views' />
        <StyledCardPreview>
            <MultimetricChartCard
                title={DUMMY_GOAL_METRIC_LABEL}
                subtitle={`Goal · ${DUMMY_GOAL_TIME_LABEL}`}
                timeRange='month'
                aggregationMode='avg'
                stepSeries={DUMMY_STEP_SERIES}
                stepTotals={DUMMY_STEP_TOTALS}
                featureEvents={DUMMY_FEATURE_EVENTS}
                start={DUMMY_START}
                end={DUMMY_END}
                loading={false}
                chartHeightSpacing={{ base: 48, lg: 40, sm: 32 }}
                totalsLabel='Goal'
                totalsHeaderSlot={
                    <GoalSummaryPanel
                        goalMetricLabel={DUMMY_GOAL_METRIC_LABEL}
                        summary={DUMMY_GOAL_SUMMARY}
                        series={DUMMY_GOAL_SERIES}
                        timeLabel={DUMMY_GOAL_TIME_LABEL}
                    />
                }
            />
        </StyledCardPreview>
        <StyledFeaturesPreview>
            <FollowedFeaturesList features={DUMMY_FOLLOWED_FEATURES} />
        </StyledFeaturesPreview>
    </StyledWrapper>
);
