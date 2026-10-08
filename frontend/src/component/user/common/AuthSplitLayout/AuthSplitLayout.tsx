import type { ReactNode } from 'react';
import { styled, type Theme } from '@mui/material';
import UnleashMark from 'assets/img/inviteSignup/Unleash.svg?react';
import UnleashSquare from 'assets/img/inviteSignup/UnleashSquare.svg?react';
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

const cornerMarkStyles = (theme: Theme) =>
    ({
        position: 'absolute',
        pointerEvents: 'none',
        width: 320,
        height: 320,
        top: -168,
        left: -168,
        [theme.breakpoints.up('lg')]: {
            width: 520,
            height: 520,
            top: -264,
            left: -264,
        },
    }) as const;

const StyledCornerMark = styled(UnleashMark)(({ theme }) =>
    cornerMarkStyles(theme),
);

const StyledCornerSquare = styled(UnleashSquare)(({ theme }) => ({
    ...cornerMarkStyles(theme),
    zIndex: 2,
}));

const StyledMain = styled('main')(({ theme }) => ({
    zIndex: 1,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(12, 3),
    [theme.breakpoints.up('lg')]: {
        width: '50%',
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
        <StyledCornerSquare aria-hidden />
        <StyledMain>
            <StyledContent>{children}</StyledContent>
        </StyledMain>
        <GoodCompanyPanel />
    </StyledPage>
);
