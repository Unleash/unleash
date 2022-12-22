import { WarningAmber } from '@mui/icons-material';
import { styled, Icon, Link } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useNavigate } from 'react-router-dom';

const StyledBar = styled('aside', {
    shouldForwardProp: prop => prop !== 'variant',
})<{ variant?: BannerVariant }>(({ theme, variant = 'neutral' }) => ({
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    gap: theme.spacing(1),
    borderBottom: '1px solid',
    borderColor: theme.palette[variant].border,
    background: theme.palette[variant].light,
    color: theme.palette[variant].dark,
}));

const StyledIcon = styled('div', {
    shouldForwardProp: prop => prop !== 'variant',
})<{ variant?: BannerVariant }>(({ theme, variant = 'neutral' }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette[variant].main,
}));

const StyledMessage = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledLink = styled(Link)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

type BannerVariant = 'warning' | 'info' | 'error' | 'success' | 'neutral';

interface IMessageFlag {
    enabled: boolean;
    message: string;
    variant?: BannerVariant;
    icon?: string;
    link?: string;
    linkText?: string;
    plausibleEvent?: string;
}

// TODO: Grab a real feature flag instead
const mockFlag: IMessageFlag = {
    enabled: true,
    message:
        '<strong>Heads up!</strong> It seems like one of your client instances might be misbehaving.',
    variant: 'warning',
    link: '/admin/network',
    linkText: 'View Network',
    plausibleEvent: 'network_warning',
};

export const MessageBanner = () => {
    const { enabled, message, variant, icon, link, linkText, plausibleEvent } =
        mockFlag;

    if (!enabled) return null;

    return (
        <StyledBar variant={variant}>
            <StyledIcon variant={variant}>
                <BannerIcon icon={icon} variant={variant} />
            </StyledIcon>
            <StyledMessage dangerouslySetInnerHTML={{ __html: message }} />
            <BannerButton
                link={link}
                linkText={linkText}
                plausibleEvent={plausibleEvent}
            />
        </StyledBar>
    );
};

interface IBannerIconProps {
    icon?: string;
    variant?: BannerVariant;
}

const BannerIcon = ({ icon, variant }: IBannerIconProps) => {
    if (icon === 'none') return null;
    if (icon) return <Icon>{icon}</Icon>;
    if (variant) return <WarningAmber />;
    // TODO: Add defaults for other variants?
    return null;
};

interface IBannerButtonProps {
    link?: string;
    linkText?: string;
    plausibleEvent?: string;
}

const BannerButton = ({
    link,
    linkText = 'More info',
    plausibleEvent,
}: IBannerButtonProps) => {
    if (!link) return null;

    const navigate = useNavigate();
    const tracker = usePlausibleTracker();
    const external = link.startsWith('http');

    const trackEvent = () => {
        if (!plausibleEvent) return;
        tracker.trackEvent('message_banner', {
            props: { event: plausibleEvent },
        });
    };

    if (external)
        return (
            <StyledLink href={link} target="_blank" onClick={trackEvent}>
                {linkText}
            </StyledLink>
        );
    else
        return (
            <StyledLink
                onClick={() => {
                    trackEvent();
                    navigate('/admin/network');
                }}
            >
                {linkText}
            </StyledLink>
        );
};
