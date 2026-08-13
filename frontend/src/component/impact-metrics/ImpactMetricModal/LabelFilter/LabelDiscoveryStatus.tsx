import type { FC } from 'react';
import { CircularProgress, styled, Typography } from '@mui/material';

const StyledStatusRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

export const LabelDiscoveryLoading: FC = () => (
    <StyledStatusRow>
        <CircularProgress size={16} />
        <Typography variant='body2' color='text.secondary'>
            Discovering labels for this metric…
        </Typography>
    </StyledStatusRow>
);

export const LabelDiscoveryError: FC = () => (
    <StyledStatusRow>
        <Typography variant='body2' color='text.secondary'>
            Could not load labels for this metric.
        </Typography>
    </StyledStatusRow>
);
