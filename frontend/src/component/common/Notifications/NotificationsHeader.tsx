import Settings from '@mui/icons-material/Settings';
import { Typography, IconButton, styled, Box } from '@mui/material';
import { flexRow } from 'themes/themeStyles';

const StyledOuterContainerBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1, 1.5, 1, 3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    boxShadow: theme.boxShadows.separator,
}));

export const NotificationsHeader: React.FC = ({ children }) => {
    return (
        <>
            <StyledOuterContainerBox>
                <Typography fontWeight="bold">Notifications</Typography>
                {children}
            </StyledOuterContainerBox>
        </>
    );
};
