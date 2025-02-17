import { Box, IconButton, Link, styled, Tooltip } from '@mui/material';
import upgradeSso from 'assets/img/upgradeSso.png';
import { formatAssetPath } from 'utils/formatPath';
import Close from '@mui/icons-material/Close';
import { useLocalStorageState } from 'hooks/useLocalStorageState';

const Wrapper = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(10),
    width: '100%',
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
}));

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledImage = styled('img')(({ theme }) => ({
    width: theme.spacing(14),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1.25),
    right: theme.spacing(1.5),
}));

const MainContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

const MainText = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: theme.spacing(1),
    maxWidth: theme.spacing(60),
}));

export const UpgradeSSO = () => {
    const [ssoUpgrade, setSsoUpgrade] = useLocalStorageState<'open' | 'closed'>(
        'upgrade-sso:v1',
        'open',
    );

    if (ssoUpgrade === 'closed') return null;

    return (
        <Wrapper>
            <MainContent>
                <StyledImage
                    src={formatAssetPath(upgradeSso)}
                    alt='Single sign-on'
                />
                <MainText>
                    <p>
                        Streamline access and account management, reduce setup
                        time and enhance security with <b>Single Sign-On</b> and{' '}
                        <b>Automatic User Provisioning via SCIM</b>.
                    </p>
                    <StyledLink
                        href='https://www.getunleash.io/upgrade-unleash?utm_source=oss&utm_medium=feature&utm_content=sso'
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
                        setSsoUpgrade('closed');
                    }}
                    size='small'
                >
                    <Close fontSize='inherit' />
                </StyledCloseButton>
            </Tooltip>
        </Wrapper>
    );
};
