import type { FC } from 'react';
import { styled } from '@mui/material';
import { ImpactMetrics } from './ImpactMetrics.tsx';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

export const ImpactMetricsPage: FC = () => (
    <StyledWrapper>
        <StyledContainer>
            <ImpactMetrics />
        </StyledContainer>
    </StyledWrapper>
);
