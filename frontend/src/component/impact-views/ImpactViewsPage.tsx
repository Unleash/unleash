import type { FC } from 'react';
import { styled } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { GoalSummaryPanel } from './views/GoalSummaryPanel/GoalSummaryPanel';
import {
    DUMMY_GOAL_METRIC_LABEL,
    DUMMY_GOAL_SERIES,
    DUMMY_GOAL_SUMMARY,
    DUMMY_GOAL_TIME_LABEL,
} from './fixtures/dummyGoalSummary';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

// Temporary: previews the goal summary panel with dummy data so we can see it
// render. Replaced by the full GoalTrackingViewChart (still dummy-fed) in a
// later PR — see ./README.md.
const StyledPanelPreview = styled('div')(({ theme }) => ({
    maxWidth: 520,
    marginTop: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    padding: theme.spacing(3),
}));

export const ImpactViewsPage: FC = () => (
    <StyledWrapper>
        <PageContent header={<PageHeader title='Impact views' />}>
            <StyledPanelPreview>
                <GoalSummaryPanel
                    goalMetricLabel={DUMMY_GOAL_METRIC_LABEL}
                    summary={DUMMY_GOAL_SUMMARY}
                    series={DUMMY_GOAL_SERIES}
                    timeLabel={DUMMY_GOAL_TIME_LABEL}
                />
            </StyledPanelPreview>
        </PageContent>
    </StyledWrapper>
);
