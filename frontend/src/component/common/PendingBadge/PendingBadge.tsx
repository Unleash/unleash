import { styled, Typography } from '@mui/material';

const StyledPending = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.warning.main,
}));

const StyledPendingDot = styled('span')(({ theme }) => ({
    width: 5,
    height: 5,
    borderRadius: '50%',
    backgroundColor: theme.palette.warning.main,
}));

export const PendingBadge = () => (
    <StyledPending>
        <StyledPendingDot />
        <Typography variant='caption'>Pending</Typography>
    </StyledPending>
);
