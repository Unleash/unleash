import { Box, styled, Typography } from '@mui/material';
import UnleashLogoWhite from 'assets/img/logoWithWhiteText.svg?react';
import { GridDemo } from '../ClosedDemo.tsx';

const StyledRoot = styled(Box)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    overflow: 'auto',
    background: `linear-gradient(135deg, ${theme.palette.background.sidebar}, ${theme.palette.primary.dark})`,
}));

const StyledCard = styled(Box)(({ theme }) => ({
    width: 'min(980px, 100%)',
    height: 'min(660px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    background: theme.palette.background.paper,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 3),
    background: theme.palette.background.sidebar,
    color: '#fff',
}));

const StyledLogo = styled(UnleashLogoWhite)({
    height: 26,
    width: 'auto',
});

const StyledBody = styled(Box)({
    flex: 1,
    minHeight: 0,
});

/**
 * Framing 5 - a branded "Welcome to Unleash" splash: a centered card with the
 * logo header over a branded gradient, hosting the grid tour. First-login feel.
 */
export const SplashFrame = () => (
    <StyledRoot>
        <StyledCard>
            <StyledHeader>
                <StyledLogo aria-label='Unleash logo' />
                <Typography sx={{ opacity: 0.85 }}>
                    Welcome! Let’s see what feature flags can do
                </Typography>
            </StyledHeader>
            <StyledBody>
                <GridDemo />
            </StyledBody>
        </StyledCard>
    </StyledRoot>
);
