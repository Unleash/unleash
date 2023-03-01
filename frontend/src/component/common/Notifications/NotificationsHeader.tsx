import Settings from '@mui/icons-material/Settings';
import { Typography, IconButton, styled, Box } from '@mui/material';
import { flexRow } from 'themes/themeStyles';

const StyledOuterContainerBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 3, 0.5, 3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledInnerBox = styled(Box)(({ theme }) => ({
    boxShadow: theme.boxShadows.separator,
    width: '100%',
    height: '4px',
}));

export const NotificationsHeader: React.FC = ({ children }) => {
    return (
        <>
            <StyledOuterContainerBox>
                <Typography fontWeight="bold">Notifications</Typography>
                {children}
            </StyledOuterContainerBox>

            <StyledInnerBox />
        </>
    );
};
