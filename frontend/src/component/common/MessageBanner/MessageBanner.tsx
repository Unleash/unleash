import { Check, Close, InfoOutlined, WarningAmber } from '@mui/icons-material';
import { styled, Icon, Link } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useNavigate } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { MessageBannerDialog } from './MessageBannerDialog/MessageBannerDialog';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useVariant } from 'hooks/useVariant';

const StyledBar = styled('aside', {
    shouldForwardProp: prop => prop !== 'variant' && prop !== 'sticky',
})<{ variant: BannerVariant; sticky?: boolean }>(
    ({ theme, variant, sticky }) => ({
        position: sticky ? 'sticky' : 'relative',
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
        ...(sticky && {
            top: 0,
            zIndex: theme.zIndex.sticky,
        }),
    })
);

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
    sticky?: boolean;
    icon?: string;
    link?: string;
    linkText?: string;
    plausibleEvent?: string;
    dialogTitle?: string;
    dialog?: string;
}

export const MessageBanner = () => {
    const { uiConfig } = useUiConfig();
    const [open, setOpen] = useState(false);

    const messageBanner = useVariant<IMessageFlag>(
        uiConfig.flags.messageBanner
    );

    if (!messageBanner) return null;

    const {
        message,
        variant = 'neutral',
        sticky,
        icon,
        link,
        linkText = 'More info',
        plausibleEvent,
        dialogTitle,
        dialog,
    } = messageBanner;

    return (
        <StyledBar variant={variant} sticky={sticky}>
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
