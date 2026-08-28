import type { FC } from 'react';
import { styled } from '@mui/material';
import { ImpactMetrics } from './ImpactMetrics.tsx';
import { useImpactMetricsEnabled } from './hooks/useImpactMetricsEnabled.ts';
import NotFound from 'component/common/NotFound/NotFound';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

export const ImpactMetricsPage: FC = () => {
    const impactMetricsEnabled = useImpactMetricsEnabled();

    if (!impactMetricsEnabled) {
        return <NotFound />;
    }

    return (
        <StyledWrapper>
            <StyledContainer>
                <ImpactMetrics />
            </StyledContainer>
        </StyledWrapper>
    );
};
