import LicenseIcon from '@mui/icons-material/ReceiptLongOutlined';
import { Box, styled, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';

const SeatsUsageBar = styled(LinearProgress)(({ theme }) => ({
    marginTop: theme.spacing(0.5),
    height: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadiusMedium,
}));

const TotalSeatsRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: 1,
    alignItems: 'center',
}));

const TotalSeats = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h1.fontSize,
    color: theme.palette.primary.main,
}));

const SeatsUsageRow = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const SeatsUsageText = styled(Box)(({ theme }) => ({
    textAlign: 'right',
}));

export const UserSeats = () => {
    const { users } = useUsers();
    const { instanceStatus } = useInstanceStatus();
    const seats = instanceStatus?.seats;

    if (typeof seats === 'number') {
        const percentageSeats = Math.floor((users.length / seats) * 100);

        return (
            <Box>
                <TotalSeatsRow>
                    <LicenseIcon />
                    <Typography sx={{ flex: 1 }}>User seats</Typography>
                    <TotalSeats>{seats}</TotalSeats>
                </TotalSeatsRow>
                <SeatsUsageRow>
                    <SeatsUsageText>
                        {users.length}/{seats} seats used
                    </SeatsUsageText>
                    <SeatsUsageBar
                        variant='determinate'
                        value={Math.min(100, percentageSeats)}
                    />
                </SeatsUsageRow>
            </Box>
        );
    }

    return null;
};
