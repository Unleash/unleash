import { Box, Button, Dialog, styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/logoWithWhiteText.svg';
import { ThemeMode } from '../common/ThemeMode/ThemeMode';
import onboardingConcepts from 'assets/img/onboardingConcepts.png';

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
                <StyledImg src={onboardingConcepts} />
                <Button variant='contained' onClick={onClose}>
                    Got it, let's get started
                </Button>
            </ContentWrapper>
        </StyledDialog>
    );
};
