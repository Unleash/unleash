import { Box, styled } from '@mui/material';
import { InviteLinkBar } from '../InviteLinkBar/InviteLinkBar.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { LicensedUsersBox } from './LicensedUsersBox.tsx';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
}));

const StyledElement = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 3, 2, 2),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    border: '2px solid',
    borderColor: theme.palette.divider,
    flex: 'auto',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
}));

export const UsersHeader = () => {
    const {
        isEnterprise,
        uiConfig: { billing },
    } = useUiConfig();

    const licensedUsersEnabled = isEnterprise() && billing !== 'pay-as-you-go';

    return (
        <StyledContainer>
            <StyledElement>
                <InviteLinkBar />
            </StyledElement>

            {licensedUsersEnabled && (
                <StyledElement>
                    <LicensedUsersBox />
                </StyledElement>
            )}
        </StyledContainer>
    );
};
