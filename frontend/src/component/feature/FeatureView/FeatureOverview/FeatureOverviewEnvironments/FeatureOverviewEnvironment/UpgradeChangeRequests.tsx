import { Box, IconButton, Link, styled, Tooltip } from '@mui/material';
import upgradeChangeRequests from 'assets/img/upgradeChangeRequests.png';
import { formatAssetPath } from 'utils/formatPath';
import Close from '@mui/icons-material/Close';
import { useLocalStorageState } from 'hooks/useLocalStorageState';

const Wrapper = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.secondary.border}`,
    padding: theme.spacing(2),
    display: 'flex',
    position: 'relative',
}));

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledImage = styled('img')(({ theme }) => ({
    height: theme.spacing(6),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
}));

const MainContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(1),
}));

const MainText = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
}));

export const UpgradeChangeRequests = () => {
    const [changeRequestsUpgrade, setChangeRequestUpgrade] =
        useLocalStorageState<'open' | 'closed'>(
            'upgrade-change-requests:v1',
            'open',
        );

    if (changeRequestsUpgrade === 'closed') return null;

    return (
        <Wrapper>
            <MainContent>
                <StyledImage
                    src={formatAssetPath(upgradeChangeRequests)}
                    alt='Change requests'
                />
                <MainText>
                    <p>
                        Include <b>Change Requests</b> in your process to bring
                        a pull request-like experience to your feature flags.
                        Reduce the risk of errors with the four-eyes approval
                        principle.
                    </p>
                    <StyledLink
                        href='https://www.getunleash.io/upgrade-unleash?utm_source=change-requests'
                        target='_blank'
                    >
                        View our Enterprise offering
                    </StyledLink>
                </MainText>
            </MainContent>
            <Tooltip title='Dismiss' arrow>
                <StyledCloseButton
                    aria-label='dismiss'
                    onClick={() => {
                        setChangeRequestUpgrade('closed');
                    }}
                    size='small'
                >
                    <Close fontSize='inherit' />
                </StyledCloseButton>
            </Tooltip>
        </Wrapper>
    );
};
