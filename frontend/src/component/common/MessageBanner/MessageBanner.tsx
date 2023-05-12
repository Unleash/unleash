import { Check, Close, InfoOutlined, WarningAmber } from '@mui/icons-material';
import { styled, Icon, Link } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useNavigate } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { MessageBannerDialog } from './MessageBannerDialog/MessageBannerDialog';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const StyledBar = styled('aside', {
    shouldForwardProp: prop => prop !== 'variant',
})<{ variant: BannerVariant }>(({ theme, variant }) => ({
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
    fontSize: theme.fontSizes.smallBody,
}));

const StyledIcon = styled('div', {
    shouldForwardProp: prop => prop !== 'variant',
})<{ variant: BannerVariant }>(({ theme, variant }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette[variant].main,
}));

type BannerVariant =
    | 'warning'
    | 'info'
    | 'error'
    | 'success'
    | 'neutral'
    | 'secondary';

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
/* eslint-disable @typescript-eslint/no-unused-vars */
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
    variant: 'secondary',
    link: 'dialog',
    linkText: "What's new?",
    plausibleEvent: 'change_log_v5',
    dialog: `![Unleash v5](https://www.getunleash.io/logos/unleash_pos.svg)
## Unleash v5 🎉
**Unleash v5 is finally here!**

Check out what changed in the newest major release:

- An Amazing Feature
- Another Amazing Feature
- We'll save the best for last
- And the best is...
- **Unleash v5 is finally here!**

You can read more about it on our newest [blog post](https://www.getunleash.io/blog).`,
};

export const MessageBanner = () => {
    const { uiConfig } = useUiConfig();
    const [open, setOpen] = useState(false);

    const {
        enabled,
        message,
        variant = 'neutral',
        icon,
        link,
        linkText = 'More info',
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
            <ReactMarkdown>{message}</ReactMarkdown>
            <BannerButton
                link={link}
                plausibleEvent={plausibleEvent}
                openDialog={() => setOpen(true)}
            >
                {linkText}
            </BannerButton>
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

const VariantIcons = {
    warning: <WarningAmber />,
    info: <InfoOutlined />,
    error: <Close />,
    success: <Check />,
    neutral: <InfoOutlined />,
    secondary: <InfoOutlined />,
};

interface IBannerIconProps {
    variant: BannerVariant;
    icon?: string;
}

const BannerIcon = ({ icon, variant }: IBannerIconProps) => {
    if (icon === 'none') return null;
    if (icon) return <Icon>{icon}</Icon>;
    return VariantIcons[variant] ?? <InfoOutlined />;
};

interface IBannerButtonProps {
    link?: string;
    plausibleEvent?: string;
    openDialog: () => void;
    children: React.ReactNode;
}

const BannerButton = ({
    link,
    plausibleEvent,
    openDialog,
    children,
}: IBannerButtonProps) => {
    const navigate = useNavigate();
    const tracker = usePlausibleTracker();

    if (!link) return null;

    const dialog = link === 'dialog';
    const internal = !link.startsWith('http');

    const trackEvent = () => {
        if (!plausibleEvent) return;
        tracker.trackEvent('message_banner', {
            props: { event: plausibleEvent },
        });
    };

    if (dialog)
        return (
            <Link
                onClick={() => {
                    trackEvent();
                    openDialog();
                }}
            >
                {children}
            </Link>
        );

    if (internal)
        return (
            <Link
                onClick={() => {
                    trackEvent();
                    navigate(link);
                }}
            >
                {children}
            </Link>
        );

    return (
        <Link href={link} target="_blank" rel="noreferrer" onClick={trackEvent}>
            {children}
        </Link>
    );
};
