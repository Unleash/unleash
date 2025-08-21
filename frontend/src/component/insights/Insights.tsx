import type { FC } from 'react';
import { styled } from '@mui/material';
import { InsightsHeader } from './components/InsightsHeader/InsightsHeader.tsx';
import { StyledContainer } from './InsightsCharts.styles.ts';
import { LifecycleInsights } from './sections/LifecycleInsights.tsx';
import { PerformanceInsights } from './sections/PerformanceInsights.tsx';
import { UserInsights } from './sections/UserInsights.tsx';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

export const Insights: FC = () => (
    <StyledWrapper>
        <InsightsHeader />
        <StyledContainer>
            <LifecycleInsights />
            <PerformanceInsights />
            <UserInsights />
        </StyledContainer>
    </StyledWrapper>
);
