import { Typography, styled, Box } from '@mui/material';
import { FC } from 'react';

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

export const NotificationsHeader: FC = ({ children }) => {
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
