import { Box, Typography, styled } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    minHeight: '150px',
}));

const StyledNotificationsIcon = styled(NotificationsIcon)(({ theme }) => ({
    height: '30px',
    width: '30px',
    color: theme.palette.neutral.main,
    marginBottom: theme.spacing(1),
}));

export const EmptyNotifications = () => {
    return (
        <StyledBox>
            <StyledNotificationsIcon />
            <Typography color="neutral.main">No new notifications</Typography>
        </StyledBox>
    );
};
