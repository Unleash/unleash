import Settings from '@mui/icons-material/Settings';
import { Typography, Box, IconButton, styled } from '@mui/material';
import { flexRow } from 'themes/themeStyles';

const StyledOuterContainerBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1, 3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledSettingsContainer = styled(Box)(() => ({
    ...flexRow,
}));

export const NotificationsHeader = () => {
    return (
        <>
            <StyledOuterContainerBox>
                <Typography fontWeight="bold">Notifications</Typography>

                <StyledSettingsContainer>
                    <IconButton>
                        <Settings />
                    </IconButton>
                </StyledSettingsContainer>
            </StyledOuterContainerBox>
        </>
    );
};
