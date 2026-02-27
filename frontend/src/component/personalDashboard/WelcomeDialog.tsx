import { Box, Button, Dialog, styled, Typography } from '@mui/material';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/logoWithWhiteText.svg';
import { ThemeMode } from '../common/ThemeMode/ThemeMode.tsx';
import onboardingConcepts from 'assets/img/onboardingConcepts.png';
import { ScreenReaderOnly } from '../common/ScreenReaderOnly/ScreenReaderOnly.tsx';
import { formatAssetPath } from 'utils/formatPath';
import { useWelcomeDialogContext } from './WelcomeDialogContext.tsx';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        width: '65vw',
        maxWidth: '1800px',
        backgroundColor: 'transparent',
    },
    padding: 0,
    '& .MuiPaper-root > section': {
        overflowX: 'hidden',
    },
}));

const StyledUnleashLogoWhite = styled(UnleashLogoWhite)({ width: '150px' });

const StyledUnleashLogo = styled(UnleashLogo)({ width: '150px' });

const ContentWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(4),
    flexDirection: 'column',
    padding: theme.spacing(4, 12),
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
}));

const WelcomeLine = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const StyledImg = styled('img')({
    width: '100%',
});

export const WelcomeDialog = () => {
    const { welcomeDialog, onClose } = useWelcomeDialogContext();

    return (
        <StyledDialog open={welcomeDialog === 'open'} onClose={onClose}>
            <ContentWrapper>
                <WelcomeLine>
                    <Typography variant='h2'>Welcome to</Typography>
                    <ThemeMode
                        darkmode={<StyledUnleashLogoWhite />}
                        lightmode={<StyledUnleashLogo />}
                    />
                </WelcomeLine>
                <Box>
                    Here are the{' '}
                    <Typography
                        component='span'
                        color='primary'
                        fontWeight='bold'
                    >
                        key concepts
                    </Typography>{' '}
                    you'll need when working with Unleash
                </Box>
                <StyledImg src={formatAssetPath(onboardingConcepts)} />
                <ScreenReaderOnly>
                    <h2>Environments</h2>
                    <p>
                        Environments represent different stages in your
                        development lifecycle. The default environments are
                        development and production.
                    </p>
                    <h2>Projects</h2>
                    <p>
                        Projects help you organize feature flags and define
                        access for users and applications. SDKs use a
                        combination of environment and project to retrieve
                        feature flag configurations.
                    </p>
                    <h2>Feature flags</h2>
                    <p>
                        Feature flags exist within a project and have distinct
                        configurations for each of the project's active
                        environments.
                    </p>
                    <h2>Activation strategy</h2>
                    <p>
                        Activation strategies are rulesets that determine if a
                        feature flag is enabled in a specific environment. You
                        can configure multiple activation strategies per
                        environment.
                    </p>
                </ScreenReaderOnly>
                <Button variant='contained' onClick={onClose}>
                    Got it, let's get started!
                </Button>
            </ContentWrapper>
        </StyledDialog>
    );
};
