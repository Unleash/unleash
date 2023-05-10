import { Typography, styled, Box } from '@mui/material';
import { FC } from 'react';

const StyledOuterContainerBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1, 1.5, 1, 3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    boxShadow: theme.boxShadows.separator,
}));

export const NotificationsHeader: FC = ({ children }) => {
    return (
        <>
            <StyledOuterContainerBox>
                <Typography fontWeight="bold">Notifications</Typography>
                {children}
            </StyledOuterContainerBox>
        </>
    );
};
