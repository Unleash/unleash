import type { FC } from 'react';
import { styled, Typography } from '@mui/material';
import { ImpactMetrics } from './ImpactMetrics.tsx';
import { PageHeader } from 'component/common/PageHeader/PageHeader.tsx';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

const pageName = 'Impact Metrics';

export const ImpactMetricsPage: FC = () => (
    <StyledWrapper>
        <StyledContainer>
            <PageHeader
                title={pageName}
                titleElement={
                    <Typography variant='h1' component='span'>
                        {pageName}
                    </Typography>
                }
            />
            <ImpactMetrics />
        </StyledContainer>
    </StyledWrapper>
);
