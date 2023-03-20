import { Typography, styled, Box } from '@mui/material';

const StyledOuterContainerBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1, 1.5, 1, 3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    boxShadow: theme.boxShadows.separator,
}));

export const NotificationsHeader: React.FC = ({ children }) => (
    <StyledOuterContainerBox>
        <Typography fontWeight="bold">Notifications</Typography>
        {children}
    </StyledOuterContainerBox>
);
