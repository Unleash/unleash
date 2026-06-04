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
    subtitle: ReactNode;
    actions: ReactNode;
    children?: ReactNode;
}

export const FeatureSetupGuideBanner = ({
    icon,
    title,
    subtitle,
    actions,
    children,
    ...props
}: FeatureSetupGuideBannerProps) => (
    <Alert severity='info' icon={icon} {...props}>
        <StyledBody>
            <div>
                <StyledTitle>{title}</StyledTitle>
                <StyledSubtitle>{subtitle}</StyledSubtitle>
            </div>
            {children}
            <StyledActions>{actions}</StyledActions>
        </StyledBody>
    </Alert>
);
