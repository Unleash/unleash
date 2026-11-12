import type { FC, ReactNode } from 'react';
import { styled } from '@mui/material';
import { Link } from 'react-router';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { SkipNavTarget } from 'component/common/SkipNavLink/SkipNavTarget';
import { EventTimelineProvider } from 'component/events/EventTimeline/EventTimelineProvider';
import UnleashLogo from 'assets/img/logoDarkWithText.svg?react';
import UnleashLogoWhite from 'assets/img/logoWithWhiteText.svg?react';

const SIDEBAR_WIDTH = 240;

const StyledRoot = styled('div')(({ theme }) => ({
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: theme.palette.appShell.background,
}));

const StyledSidebar = styled('nav')(({ theme }) => ({
    position: 'sticky',
    top: 0,
    height: '100vh',
    width: SIDEBAR_WIDTH,
    flex: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.appShell.sidebar,
}));

const StyledLogoLink = styled(Link)(({ theme }) => ({
    display: 'inline-flex',
    padding: theme.spacing(0.5),
    '& svg': { width: 110, height: 'auto' },
}));

const StyledContent = styled('main')(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    maxWidth: 1512,
    margin: '0 auto',
    padding: theme.spacing(0, 3, 6),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(0, 1.5, 6),
    },
}));

const Sidebar: FC = () => (
    <StyledSidebar aria-label='Main'>
        <StyledLogoLink to='/' aria-label='Home'>
            <ThemeMode
                darkmode={<UnleashLogoWhite aria-label='Unleash logo' />}
                lightmode={<UnleashLogo aria-label='Unleash logo' />}
            />
        </StyledLogoLink>
    </StyledSidebar>
);

export const AppShell: FC<{ children: ReactNode }> = ({ children }) => (
    <EventTimelineProvider>
        <StyledRoot>
            <Sidebar />
            <StyledContent>
                <SkipNavTarget />
                {children}
            </StyledContent>
        </StyledRoot>
    </EventTimelineProvider>
);
