import { Box, IconButton, Link, styled, Tooltip } from '@mui/material';
import upgradeEnvironments from 'assets/img/upgradeEnvironments.png';
import { formatAssetPath } from 'utils/formatPath';
import Close from '@mui/icons-material/Close';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';

const Wrapper = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(3),
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
    width: theme.spacing(20),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1.25),
    right: theme.spacing(1.5),
}));

const MainContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const MainText = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: theme.spacing(1),
    maxWidth: theme.spacing(60),
}));

export const UpgradeMoreEnvironments = () => {
    const [moreEnvironmentsUpgrade, setMoreEnvironmentsUpgrade] =
        useLocalStorageState<'open' | 'closed'>(
            'upgrade-environments:v1',
            'open',
        );

    if (moreEnvironmentsUpgrade === 'closed') return null;

    return (
        <Wrapper>
            <MainContent>
                <StyledImage
                    src={formatAssetPath(upgradeEnvironments)}
                    alt='Multiple environments'
                />
                <MainText>
                    <b>Need more environments?</b>
                    <p>
                        You are currently using our open-source version, which
                        allows for only two environments. With our Enterprise
                        offering, you can have unlimited environments to better
                        suit your organization's needs.
                    </p>
                    <StyledLink
                        href='https://www.getunleash.io/upgrade-unleash?umt_source=environments'
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
                        setMoreEnvironmentsUpgrade('closed');
                    }}
                    size='small'
                >
                    <Close fontSize='inherit' />
                </StyledCloseButton>
            </Tooltip>
        </Wrapper>
    );
};
