import type { FC } from 'react';
import { styled } from '@mui/material';
import { InsightsHeader } from './components/InsightsHeader/InsightsHeader.tsx';
import { InsightsCharts } from './InsightsCharts.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { LegacyInsights } from './LegacyInsights.tsx';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

const NewInsights: FC = () => {
    return (
        <StyledWrapper>
            <InsightsHeader />
            <InsightsCharts />
        </StyledWrapper>
    );
};

export const Insights: FC<{ withCharts?: boolean }> = (props) => {
    const useNewInsights = useUiFlag('lifecycleMetrics');

    return useNewInsights ? <NewInsights /> : <LegacyInsights {...props} />;
};
