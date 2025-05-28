import type { FC } from 'react';
import { styled } from '@mui/material';
import { InsightsHeader } from './components/InsightsHeader/InsightsHeader.tsx';
import { InsightsCharts } from './InsightsCharts.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { LegacyInsights } from './LegacyInsights.tsx';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

interface InsightsProps {
    // todo (lifecycleMetrics): remove this arg? it's only used for testing
    withCharts?: boolean;
}

const NewInsights: FC<InsightsProps> = ({ withCharts = true }) => {
    return (
        <StyledWrapper>
            <InsightsHeader />
            {withCharts && <InsightsCharts />}
        </StyledWrapper>
    );
};

export const Insights: FC<InsightsProps> = (props) => {
    const useNewInsights = useUiFlag('lifecycleMetrics');

    return useNewInsights ? (
        <NewInsights {...props} />
    ) : (
        <LegacyInsights {...props} />
    );
};
