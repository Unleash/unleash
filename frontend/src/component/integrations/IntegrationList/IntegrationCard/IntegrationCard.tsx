import type { VFC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, styled, Tooltip, Typography } from '@mui/material';
import { IntegrationIcon } from '../IntegrationIcon/IntegrationIcon.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Badge } from 'component/common/Badge/Badge';
import { IntegrationCardMenu } from './IntegrationCardMenu/IntegrationCardMenu.tsx';
import type { AddonSchema } from 'openapi';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { IntegrationEventsLastEvent } from 'component/integrations/IntegrationEvents/IntegrationEventsLastEvent';

type CardVariant = 'default' | 'stacked';

interface IIntegrationCardBaseProps {
    variant?: CardVariant;
    id?: string | number;
    icon?: string;
    title: string;
    description?: string;
    isEnabled?: boolean;
    configureActionText?: string;
    addon?: AddonSchema;
    deprecated?: string;
}

interface IIntegrationCardWithLinkProps extends IIntegrationCardBaseProps {
    link: string;
    isExternal?: boolean;
    onClick?: never;
}

interface IIntegrationCardWithOnClickProps extends IIntegrationCardBaseProps {
    link?: never;
    isExternal?: never;
    onClick: () => void;
}

type IIntegrationCardProps =
    | IIntegrationCardWithLinkProps
    | IIntegrationCardWithOnClickProps;

const StyledCard = styled('div', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: CardVariant }>(({ theme, variant = 'default' }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    height: '100%',
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.boxShadows.card,
    ':hover': {
        backgroundColor: theme.palette.action.hover,
    },
    ...(variant === 'stacked' && {
        position: 'relative',
        zIndex: 0,
        '&:after': {
            content: '""',
            width: 'auto',
            height: theme.spacing(1),
            position: 'absolute',
            zIndex: -1,
            bottom: theme.spacing(-1),
            left: theme.spacing(1),
            right: theme.spacing(1),
            borderBottomLeftRadius: `${theme.shape.borderRadiusMedium}px`,
            borderBottomRightRadius: `${theme.shape.borderRadiusMedium}px`,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.boxShadows.card,
        },
    }),
}));

const StyledLink = styled(Link)({
    textDecoration: 'none',
    color: 'inherit',
    textAlign: 'left',
}) as typeof Link;

const StyledRouterLink = styled(RouterLink)({
    textDecoration: 'none',
    color: 'inherit',
});

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
    fontSize: theme.typography.body2.fontSize,
    marginTop: 'auto',
    paddingTop: theme.spacing(1),
    gap: theme.spacing(0.5),
}));

const StyledOpenInNewIcon = styled(OpenInNewIcon)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

export const IntegrationCard: VFC<IIntegrationCardProps> = ({
    variant = 'default',
    icon,
    title,
    description,
    isEnabled,
    configureActionText = 'Configure',
    link,
    onClick,
    addon,
    deprecated,
    isExternal = false,
}) => {
    const { trackEvent } = usePlausibleTracker();
    const isConfigured = addon !== undefined;

    const handleClick = () => {
        trackEvent('open-integration', {
            props: {
                integrationName: title,
                isConfigured: isConfigured,
            },
        });
    };

    const content = (
        <StyledCard variant={variant}>
            <StyledHeader>
                <StyledTitle variant='h3' data-loading>
                    <IntegrationIcon name={icon as string} /> {title}
                </StyledTitle>
                <ConditionallyRender
                    condition={deprecated !== undefined}
                    show={
                        <Tooltip title={deprecated} arrow>
                            <Badge data-loading>Deprecated</Badge>
                        </Tooltip>
                    }
                />
                <ConditionallyRender
                    condition={isEnabled === true}
                    show={
                        <Badge color='success' data-loading>
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
            <Typography variant='body2' color='text.secondary' data-loading>
                {description}
            </Typography>
            <StyledAction data-loading>
                {configureActionText}
                <ConditionallyRender
                    condition={isExternal}
                    show={<StyledOpenInNewIcon />}
                    elseShow={<ChevronRightIcon />}
                />
                <IntegrationEventsLastEvent
                    integration={addon}
                    sx={{ ml: 'auto' }}
                />
            </StyledAction>
        </StyledCard>
    );

    if (onClick) {
        return (
            <StyledLink
                component='button'
                onClick={() => {
                    handleClick();
                    onClick();
                }}
            >
                {content}
            </StyledLink>
        );
    } else if (isExternal) {
        return (
            <StyledLink
                href={link}
                target='_blank'
                rel='noreferrer'
                onClick={handleClick}
            >
                {content}
            </StyledLink>
        );
    } else {
        return (
            <StyledRouterLink to={link} onClick={handleClick}>
                {content}
            </StyledRouterLink>
        );
    }
};
