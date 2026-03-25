import type { ReactNode } from 'react';
import { styled } from '@mui/material';
import { ReactComponent as UnleashLogoDark } from 'assets/img/logoDarkWithText.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/logoWithWhiteText.svg';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import loginBackground from 'assets/img/loginBackground.png';

const StyledPage = styled('div')(({ theme }) => ({
    minHeight: '100vh',
    backgroundColor: theme.palette.background.application,
}));

const StyledBackground = styled('img')({
    position: 'absolute',
    right: 0,
    width: '70%',
    maxHeight: '100%',
    objectFit: 'contain',
    objectPosition: 'bottom right',
});

const StyledHeader = styled('header')(({ theme }) => ({
    padding: theme.spacing(3),
}));

const StyledLogoDark = styled(UnleashLogoDark)({
    width: 150,
});

const StyledLogoWhite = styled(UnleashLogoWhite)({
    width: 150,
});

const StyledMain = styled('main')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
}));

const StyledCardWrapper = styled('div')({
    position: 'relative',
    width: 500,
    maxWidth: '100%',
});

const StyledSquare = styled('div')<{
    size: number;
    color: string;
}>(({ size, color }) => ({
    position: 'absolute',
    width: size,
    height: size,
    backgroundColor: color,
}));

const StyledCard = styled('div')(({ theme }) => ({
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(5, 4),
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3, 2),
    },
}));

interface AuthPageLayoutProps {
    children: ReactNode;
}

export const AuthPageLayout = ({ children }: AuthPageLayoutProps) => {
    return (
        <StyledPage>
            <StyledBackground src={loginBackground} alt='' />
            <StyledHeader>
                <ThemeMode
                    darkmode={<StyledLogoWhite aria-label='Unleash logo' />}
                    lightmode={<StyledLogoDark aria-label='Unleash logo' />}
                />
            </StyledHeader>
            <StyledMain>
                <StyledCardWrapper>
                    <StyledSquare
                        size={8}
                        color='#B3DAED'
                        sx={{ top: -20, left: -20 }}
                    />
                    <StyledSquare
                        size={24}
                        color='#98E3AF'
                        sx={{ top: -12, left: -12 }}
                    />
                    <StyledSquare
                        size={24}
                        color='#6c65e5'
                        sx={{ bottom: -12, right: -12 }}
                    />
                    <StyledSquare
                        size={8}
                        color='#ffffff'
                        sx={{ bottom: -20, right: -20 }}
                    />
                    <StyledCard>{children}</StyledCard>
                </StyledCardWrapper>
            </StyledMain>
        </StyledPage>
    );
};
