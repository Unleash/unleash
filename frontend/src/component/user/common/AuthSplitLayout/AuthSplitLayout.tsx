import type { ReactNode } from 'react';
import { styled } from '@mui/material';
import UnleashMark from 'assets/img/inviteSignup/Unleash.svg?react';
import { GoodCompanyPanel } from './GoodCompanyPanel.tsx';

const StyledPage = styled('div')(({ theme }) => ({
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    [theme.breakpoints.up('lg')]: {
        flexDirection: 'row',
        padding: theme.spacing(8),
    },
}));

const StyledCornerMark = styled(UnleashMark)(({ theme }) => ({
    position: 'absolute',
    zIndex: 2,
    pointerEvents: 'none',
    width: 240,
    height: 240,
    top: -132,
    left: -132,
    [theme.breakpoints.up('lg')]: {
        width: 420,
        height: 420,
        top: -208,
        left: -201,
    },
}));

const StyledMain = styled('main')(({ theme }) => ({
    position: 'relative',
    zIndex: 1,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(12, 3, 6),
    [theme.breakpoints.up('lg')]: {
        width: '50%',
        padding: theme.spacing(10, 3),
    },
}));

const StyledContent = styled('div')({
    width: '100%',
    maxWidth: 368,
});

interface AuthSplitLayoutProps {
    children: ReactNode;
}

export const AuthSplitLayout = ({ children }: AuthSplitLayoutProps) => (
    <StyledPage>
        <StyledCornerMark aria-label='Unleash logo' />
        <StyledMain>
            <StyledContent>{children}</StyledContent>
        </StyledMain>
        <GoodCompanyPanel />
    </StyledPage>
);
