import { WarningAmber } from '@mui/icons-material';
import { styled, Icon, Link } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useNavigate } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { MessageBannerDialog } from './MessageBannerDialog/MessageBannerDialog';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

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
    dialogTitle?: string;
    dialog?: string;
}

// TODO: Grab a real feature flag instead
const mockFlag: IMessageFlag = {
    enabled: true,
    message:
        '**Heads up!** It seems like one of your client instances might be misbehaving.',
    variant: 'warning',
    link: '/admin/network',
    linkText: 'View Network',
    plausibleEvent: 'network_warning',
};

const mockFlag2: IMessageFlag = {
    enabled: true,
    message:
        '**Unleash v5 is finally here!** Check out what changed in the newest major release.',
    variant: 'info',
    link: 'dialog',
    linkText: "What's new?",
    plausibleEvent: 'change_log_v5',
    dialog: `
![Unleash v5](https://www.getunleash.io/logos/unleash_pos.svg)
## Unleash v5 🎉
**Unleash v5 is finally here!**

Check out what changed in the newest major release:

- An Amazing Feature
- Another Amazing Feature
- We'll save the best for last
- And the best is...
- **Unleash v5 is finally here!**

You can read more about it on our newest [blog post](https://www.getunleash.io/blog).
    `,
};

export const MessageBanner = () => {
    const { uiConfig } = useUiConfig();
    const [open, setOpen] = useState(false);

    const {
        enabled,
        message,
        variant,
        icon,
        link,
        linkText,
        plausibleEvent,
        dialogTitle,
        dialog,
    } = { ...mockFlag2, enabled: uiConfig.flags.messageBanner };

    if (!enabled) return null;

    return (
        <StyledBar variant={variant}>
            <StyledIcon variant={variant}>
                <BannerIcon icon={icon} variant={variant} />
            </StyledIcon>
            <StyledMessage>
                <ReactMarkdown>{message}</ReactMarkdown>
            </StyledMessage>
            <BannerButton
                link={link}
                linkText={linkText}
                plausibleEvent={plausibleEvent}
                openDialog={() => setOpen(true)}
            />
            <MessageBannerDialog
                open={open}
                setOpen={setOpen}
                title={dialogTitle || linkText}
            >
                {dialog!}
            </MessageBannerDialog>
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
    openDialog: () => void;
}

const BannerButton = ({
    link,
    linkText = 'More info',
    plausibleEvent,
    openDialog,
}: IBannerButtonProps) => {
    if (!link) return null;

    const navigate = useNavigate();
    const tracker = usePlausibleTracker();
    const dialog = link === 'dialog';
    const external = link.startsWith('http');

    const trackEvent = () => {
        if (!plausibleEvent) return;
        tracker.trackEvent('message_banner', {
            props: { event: plausibleEvent },
        });
    };

    if (dialog)
        return (
            <StyledLink
                onClick={() => {
                    trackEvent();
                    openDialog();
                }}
            >
                {linkText}
            </StyledLink>
        );

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
                    navigate(link);
                }}
            >
                {linkText}
            </StyledLink>
        );
};
