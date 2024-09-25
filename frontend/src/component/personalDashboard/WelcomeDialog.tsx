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
                    Here are the concepts you{' '}
                    <Typography
                        component='span'
                        color='primary'
                        fontWeight='bold'
                    >
                        must understand
                    </Typography>{' '}
                    in order to work effectively with Unleash
                </Box>
                <StyledImg src={formatAssetPath(onboardingConcepts)} />
                <ScreenReaderOnly>
                    <h2>Environments</h2>
                    <p>
                        Unleash comes with two global environments. Once you
                        create a feature flag it will exist in all environments,
                        but it will hold different configuration per
                        environment.
                    </p>
                    <h2>Projects</h2>
                    <p>
                        Feature flags live in projects. When SDKs connect to
                        Unleash they use an environment /project combination in
                        order to retrieve the correct configuration. You can
                        also use projects to control access level for feature
                        flags.
                    </p>
                    <h2>Feature flags</h2>
                    <p>
                        Flags live in projects and across all configured
                        environments. Each flag will have separate configuration
                        in each environment enabled for the project that they
                        live in.
                    </p>
                    <h2>Activation strategy</h2>
                    <p>
                        Activation strategies are rulesets that decide whether
                        or not a feature flag should be enabled in a specific
                        environment. You can configure as many rulesets as you
                        want per environment.
                    </p>
                </ScreenReaderOnly>
                <Button variant='contained' onClick={onClose}>
                    Got it, let's get started
                </Button>
            </ContentWrapper>
        </StyledDialog>
    );
};
