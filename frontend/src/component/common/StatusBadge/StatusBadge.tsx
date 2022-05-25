import { styled, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface IStatusBadgeProps {
    severity: 'success' | 'warning';
    className?: string;
    children: ReactNode;
}

export const StatusBadge = ({
    severity,
    className,
    children,
}: IStatusBadgeProps) => {
    const theme = useTheme();
    const background = theme.palette.statusBadge[severity];

    return (
        <StyledStatusBadge sx={{ background }} className={className}>
            {children}
        </StyledStatusBadge>
    );
};

const StyledStatusBadge = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.5, 1),
    textDecoration: 'none',
    color: theme.palette.text.primary,
    display: 'inline-block',
    borderRadius: theme.shape.borderRadius,
    marginLeft: theme.spacing(1.5),
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 1,
}));
