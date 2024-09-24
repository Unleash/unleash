import { Box, Button, Dialog, styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/logoWithWhiteText.svg';
import { ThemeMode } from '../common/ThemeMode/ThemeMode';
import onboardingConcepts from 'assets/img/onboardingConcepts.png';
import { ScreenReaderOnly } from '../common/ScreenReaderOnly/ScreenReaderOnly';
import { formatAssetPath } from 'utils/formatPath';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(140),
        width: '100%',
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

interface IWelcomeDialogProps {
    open: boolean;
    onClose: () => void;
}

export const WelcomeDialog: FC<IWelcomeDialogProps> = ({ open, onClose }) => {
    return (
        <StyledDialog open={open} onClose={onClose}>
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
                        Unleash comes with two default environments. Feature
                        flags exist across all environments but can have
                        different configurations in each.
                    </p>
                    <h2>Projects</h2>
                    <p>
                        Feature flags live inside projects. When SDKs connect to
                        Unleash they use the combination of environment and
                        project to retrieve the correct configuration. Projects
                        also control who can access a feature flag.
                    </p>
                    <h2>Feature flags</h2>
                    <p>
                        Flags live inside a project and exist across all its
                        environments. Flags can have a unique configuration in
                        each environment enabled for their project.
                    </p>
                    <h2>Activation strategy</h2>
                    <p>
                        Activation strategies are rulesets that determine if a
                        feature flag should be enabled in a specific
                        environment. You can configure multiple activation
                        strategies per environment.
                    </p>
                </ScreenReaderOnly>
                <Button variant='contained' onClick={onClose}>
                    Got it, let's get started!
                </Button>
            </ContentWrapper>
        </StyledDialog>
    );
};
