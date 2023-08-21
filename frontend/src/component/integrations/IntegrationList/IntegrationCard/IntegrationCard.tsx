import { useState, VFC } from 'react';
import { Link } from 'react-router-dom';
import { styled, Typography } from '@mui/material';
import { IntegrationIcon } from '../IntegrationIcon/IntegrationIcon';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Badge } from 'component/common/Badge/Badge';
import { IntegrationCardMenu } from './IntegrationCardMenu/IntegrationCardMenu';

interface IIntegrationCardProps {
    id?: string | number;
    icon?: string;
    title: string;
    description?: string;
    isConfigured?: boolean;
    isEnabled?: boolean;
    configureActionText?: string;
    link: string;
}

const StyledLink = styled(Link)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    border: `1px solid ${theme.palette.divider}`,
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: theme.boxShadows.card,
    ':hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const StyledTitle = styled(Typography)(() => ({
    display: 'flex',
    alignItems: 'center',
    marginRight: 'auto',
}));

const StyledAction = styled(Typography)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    marginTop: 'auto',
    paddingTop: theme.spacing(1),
    gap: theme.spacing(0.5),
}));

export const IntegrationCard: VFC<IIntegrationCardProps> = ({
    id,
    icon,
    title,
    description,
    isEnabled,
    configureActionText = 'Configure',
    link,
}) => {
    const isConfigured = id !== undefined;

    return (
        <StyledLink to={link}>
            <StyledHeader>
                <StyledTitle variant="h3">
                    <IntegrationIcon name={icon as string} /> {title}
                </StyledTitle>
                <ConditionallyRender
                    condition={isEnabled === true}
                    show={<Badge color="success">Enabled</Badge>}
                />
                <ConditionallyRender
                    condition={isEnabled === false}
                    show={<Badge>Disabled</Badge>}
                />
                <ConditionallyRender
                    condition={isConfigured}
                    show={<IntegrationCardMenu id={id as string} />}
                />
            </StyledHeader>
            <Typography variant="body1">{description}</Typography>
            <StyledAction>
                {configureActionText} <ChevronRightIcon />
            </StyledAction>
        </StyledLink>
    );
};
