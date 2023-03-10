import { List, styled } from '@mui/material';
import { FC } from 'react';

const StyledListContainer = styled(List)(({ theme }) => ({
    padding: theme.spacing(2, 3),
}));

export const NotificationsList: FC = ({ children }) => {
    return (
        <StyledListContainer data-testid="NOTIFICATIONS_LIST">
            {children}
        </StyledListContainer>
    );
};
