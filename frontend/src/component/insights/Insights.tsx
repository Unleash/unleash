import type { FC } from 'react';
import { styled } from '@mui/material';
import { InsightsHeader } from './components/InsightsHeader/InsightsHeader.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { LegacyInsights } from './LegacyInsights.tsx';
import { StyledContainer } from './InsightsCharts.styles.ts';
import { LifecycleInsights } from './sections/LifecycleInsights.tsx';
import { PerformanceInsights } from './sections/PerformanceInsights.tsx';
import { UserInsights } from './sections/UserInsights.tsx';
import { ImpactMetrics } from './impact-metrics/ImpactMetrics.tsx';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

const NewInsights: FC = () => {
    const impactMetricsEnabled = useUiFlag('impactMetrics');

    return (
        <StyledWrapper>
            <InsightsHeader />
            <StyledContainer>
                {impactMetricsEnabled ? <ImpactMetrics /> : null}
                <LifecycleInsights />
                <PerformanceInsights />
                <UserInsights />
            </StyledContainer>
        </StyledWrapper>
    );
};

export const Insights: FC<{ withCharts?: boolean }> = (props) => {
    const useNewInsights = useUiFlag('lifecycleMetrics');

    return useNewInsights ? <NewInsights /> : <LegacyInsights {...props} />;
};
