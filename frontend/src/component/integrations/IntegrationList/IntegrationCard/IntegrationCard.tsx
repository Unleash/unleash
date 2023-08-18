import { VFC } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { IntegrationIcon } from '../IntegrationIcon/IntegrationIcon';

interface IIntegrationCardProps {
    icon: string;
    title: string;
    description?: string;
    isEnabled?: boolean;
    isDeprecated?: boolean;
}

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

export const IntegrationCard: VFC<IIntegrationCardProps> = ({
    icon,
    title,
    description,
    isDeprecated,
    isEnabled,
}) => {
    return (
        <StyledBox>
            <StyledHeader variant="h3">
                <IntegrationIcon name={icon as string} /> {title}
            </StyledHeader>
            <Typography variant="body1">{description}</Typography>
        </StyledBox>
    );
};
