import React, { Fragment, VFC } from 'react';
import { Link } from 'react-router-dom';
import { styled, Typography } from '@mui/material';
import { IntegrationIcon } from '../IntegrationIcon/IntegrationIcon';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Badge } from 'component/common/Badge/Badge';
import { IntegrationCardMenu } from './IntegrationCardMenu/IntegrationCardMenu';
import type { AddonSchema } from 'openapi';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface IIntegrationCardProps {
    id?: string | number;
    icon?: string;
    title: string;
    description?: string;
    isConfigured?: boolean;
    isEnabled?: boolean;
    configureActionText?: string;
    link: string;
    isExternal?: boolean;
    addon?: AddonSchema;
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
const StyledAnchor = styled('a')(({ theme }) => ({
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

const StyledOpenInNewIcon = styled(OpenInNewIcon)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

export const IntegrationCard: VFC<IIntegrationCardProps> = ({
    icon,
    title,
    description,
    isEnabled,
    configureActionText = 'Configure',
    link,
    addon,
    isExternal = false,
}) => {
    const isConfigured = addon !== undefined;

    const content = (
        <Fragment>
            <StyledHeader>
                <StyledTitle variant="h3" data-loading>
                    <IntegrationIcon name={icon as string} /> {title}
                </StyledTitle>
                <ConditionallyRender
                    condition={isEnabled === true}
                    show={
                        <Badge color="success" data-loading>
                            Enabled
                        </Badge>
                    }
                />
                <ConditionallyRender
                    condition={isEnabled === false}
                    show={<Badge data-loading>Disabled</Badge>}
                />
                <ConditionallyRender
                    condition={isConfigured}
                    show={<IntegrationCardMenu addon={addon as AddonSchema} />}
                />
            </StyledHeader>
            <Typography variant="body2" color="text.secondary" data-loading>
                {description}
            </Typography>
            <StyledAction data-loading>
                {configureActionText}
                <ConditionallyRender
                    condition={isExternal}
                    show={<StyledOpenInNewIcon />}
                    elseShow={<ChevronRightIcon />}
                />
            </StyledAction>
        </Fragment>
    );

    if (isExternal) {
        return (
            <StyledAnchor href={link} target="_blank" rel="noreferrer">
                {content}
            </StyledAnchor>
        );
    } else {
        return <StyledLink to={link}> {content}</StyledLink>;
    }
};
