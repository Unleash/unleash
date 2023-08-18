import { VFC } from 'react';
import { Box, styled, Typography } from '@mui/material';

interface IIntegrationCardProps {
    title: string;
    description?: string;
    isEnabled?: boolean;
    isDeprecated?: boolean;
}

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
}));

export const IntegrationCard: VFC<IIntegrationCardProps> = ({
    title,
    description,
    isDeprecated,
    isEnabled,
}) => {
    return (
        <StyledBox>
            <Typography variant="h3">{title}</Typography>
            <Typography variant="body1">{description}</Typography>
        </StyledBox>
    );
};
