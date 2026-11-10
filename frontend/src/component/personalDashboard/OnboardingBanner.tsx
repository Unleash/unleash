import { useId, type ReactNode } from 'react';
import { IconButton, Paper, styled, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import illustration from 'assets/img/Legal.png';
import { formatAssetPath } from 'utils/formatPath';

const StyledBanner = styled(Paper)(({ theme }) => ({
    containerType: 'inline-size',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledLayout = styled('div')({
    display: 'grid',
    '@container (min-width: 720px)': {
        gridTemplateColumns: 'minmax(0, 1fr) 280px',
    },
});

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(3),
}));

const StyledIllustration = styled('img')(({ theme }) => ({
    display: 'none',
    position: 'absolute',
    top: '-8%',
    right: theme.spacing(4),
    height: '115%',
    width: 'auto',
    '@container (min-width: 720px)': { display: 'block' },
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
    zIndex: 1,
}));

export const OnboardingBanner = ({
    title,
    badge,
    children,
    onDismiss,
}: {
    title: string;
    badge?: ReactNode;
    children: ReactNode;
    onDismiss?: () => void;
}) => {
    const headingId = useId();
    return (
        <StyledBanner
            variant='outlined'
            role='region'
            aria-labelledby={headingId}
        >
            {onDismiss ? (
                <Tooltip title='Dismiss' arrow>
                    <StyledCloseButton
                        aria-label='Dismiss'
                        size='small'
                        onClick={onDismiss}
                    >
                        <CloseIcon fontSize='small' />
                    </StyledCloseButton>
                </Tooltip>
            ) : null}
            <StyledLayout>
                <StyledContent>
                    {badge}
                    <Typography
                        id={headingId}
                        component='h2'
                        variant='h2'
                        sx={onDismiss ? { pr: 3 } : undefined}
                    >
                        {title}
                    </Typography>
                    {children}
                </StyledContent>
                <StyledIllustration
                    src={formatAssetPath(illustration)}
                    alt=''
                />
            </StyledLayout>
        </StyledBanner>
    );
};
