import type { ReactNode } from 'react';
import { Alert, type AlertProps, styled, Typography } from '@mui/material';

const StyledBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.fontSizes.bodySize,
    color: theme.palette.text.primary,
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const StyledActions = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
}));

interface FeatureSetupGuideBannerProps
    extends Omit<AlertProps, 'severity' | 'color' | 'variant'> {
    variant?: 'set-up-guide' | 'info';
    subtitle: ReactNode;
    actions: ReactNode;
    children?: ReactNode;
}

const StyledAlert = styled(Alert, {
    shouldForwardProp: (prop) => prop !== 'highlighted',
})<{ isSetupBanner?: boolean }>(({ theme, isSetupBanner }) => ({
    ...(isSetupBanner && {
        '&&.MuiAlert-standard.MuiAlert-colorInfo': {
            backgroundColor: theme.palette.secondary.light,
            borderColor: theme.palette.secondary.border,
            color: theme.palette.secondary.dark,
        },
    }),
}));

export const FeatureSetupGuideBanner = ({
    variant = 'info',
    icon,
    title,
    subtitle,
    actions,
    children,
    ...props
}: FeatureSetupGuideBannerProps) => (
    <StyledAlert
        severity='info'
        icon={icon}
        isSetupBanner={variant === 'set-up-guide'}
        {...props}
    >
        <StyledBody>
            <div>
                <StyledTitle>{title}</StyledTitle>
                <StyledSubtitle>{subtitle}</StyledSubtitle>
            </div>
            {children}
            <StyledActions>{actions}</StyledActions>
        </StyledBody>
    </StyledAlert>
);
