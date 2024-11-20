import { Box, styled } from '@mui/material';
import { InviteLinkBar } from '../InviteLinkBar/InviteLinkBar';
import { useUiFlag } from 'hooks/useUiFlag';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { LicensedUsersBox } from './LicensedUsersBox';

interface StyledContainerProps {
    licensedUsersEnabled: boolean;
}

const StyledContainer = styled(Box)<StyledContainerProps>(
    ({ theme, licensedUsersEnabled }) => ({
        display: 'grid',
        gridTemplateColumns: licensedUsersEnabled ? '60% 40%' : '100%',
        gap: theme.spacing(2),
        paddingBottom: theme.spacing(3),
    }),
);

const StyledElement = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 3, 2, 2),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    display: 'flex',
    border: '2px solid',
    borderColor: theme.palette.background.alternative,
}));

export const UsersHeader = () => {
    const licensedUsers = useUiFlag('licensedUsers');
    const { isOss } = useUiConfig();
    const licensedUsersEnabled = licensedUsers && !isOss();

    return (
        <StyledContainer licensedUsersEnabled={licensedUsersEnabled}>
            <StyledElement>
                <InviteLinkBar />
            </StyledElement>

            {licensedUsersEnabled && (
                <StyledElement>
                    <LicensedUsersBox />{' '}
                </StyledElement>
            )}
        </StyledContainer>
    );
};
