import type { ReactNode } from 'react';
import { Box, Dialog, styled, Typography } from '@mui/material';
import textureImage from 'assets/img/texture-signup.png';
import Heart from 'assets/icons/heart.svg?react';
import { formatAssetPath } from 'utils/formatPath.ts';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        [theme.breakpoints.down('md')]: {
            gridTemplateColumns: '1fr',
        },
    },
    padding: theme.spacing(8),
    [theme.breakpoints.down('md')]: {
        padding: 0,
    },
    '& .MuiPaper-root > section': {
        overflowX: 'hidden',
    },
}));

const StyledAside = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflowY: 'hidden',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const StyledHearts = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    paddingInline: theme.spacing(4),
}));

const StyledBackgroundTexture = styled('img')({
    objectFit: 'cover',
    position: 'absolute',
    bottom: 0,
    right: 0,
    pointerEvents: 'none',
    filter: 'brightness(1.3)',
    opacity: 0.6,
    imageRendering: 'pixelated',
});

const StyledHeartWrapper = styled(Box)({
    animation: 'heartEnter 300ms ease-out',
    '@keyframes heartEnter': {
        '0%': {
            opacity: 0,
            transform: 'scale(0.7)',
        },
        '100%': {
            opacity: 1,
            transform: 'scale(1)',
        },
    },
});

const StyledHeart = styled(Heart)(({ theme }) => ({
    width: theme.spacing(10),
    height: theme.spacing(10),
    color: theme.palette.primary.contrastText,
    animation: 'float 6s ease-in-out infinite',
    '@keyframes float': {
        '0%': {
            transform: 'translateY(0) scale(1)',
        },
        '50%': {
            transform: 'translateY(-16px) scale(1.1)',
        },
        '100%': {
            transform: 'translateY(0) scale(1)',
        },
    },
}));

const StyledBody = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'wide',
})<{ wide?: boolean }>(({ theme, wide }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: wide ? theme.spacing(4, 5) : theme.spacing(4, 10),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
    },
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    maxWidth: wide ? theme.spacing(92) : theme.spacing(70),
    boxSizing: wide ? 'border-box' : undefined,
    margin: 'auto',
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(3),
    width: '100%',
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    marginBottom: theme.spacing(1.5),
    fontSize: theme.typography.h1.fontSize,
}));

const StyledContent = styled(Box)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    justifyContent: 'start',
    gap: theme.spacing(3),
}));

const getHeartAnimationDelay = (i: number) => {
    const delays = ['0s', '-1.5s', '-3s', '-4.5s'];
    return delays[i % 4];
};

interface ISignupDialogLayoutProps {
    hearts: number;
    title?: string;
    description?: string;
    isCustom?: boolean;
    children: ReactNode;
}

export const SignupDialogLayout = ({
    hearts,
    title,
    description,
    isCustom,
    children,
}: ISignupDialogLayoutProps) => (
    <StyledDialog open fullScreen>
        <StyledAside>
            <StyledBackgroundTexture
                src={formatAssetPath(textureImage)}
                alt=''
            />
            <StyledHearts>
                {Array.from({ length: hearts }).map((_, i) => (
                    <StyledHeartWrapper key={i}>
                        <StyledHeart
                            sx={{
                                animationDelay: getHeartAnimationDelay(i),
                            }}
                        />
                    </StyledHeartWrapper>
                ))}
            </StyledHearts>
        </StyledAside>
        <StyledBody wide={isCustom}>
            {!isCustom && (
                <StyledHeader data-public>
                    <StyledTitle>{title}</StyledTitle>
                    <Typography
                        variant='body2'
                        sx={{
                            color: 'text.secondary',
                            whiteSpace: 'pre-line',
                        }}
                    >
                        {description}
                    </Typography>
                </StyledHeader>
            )}
            <StyledContent>{children}</StyledContent>
        </StyledBody>
    </StyledDialog>
);
