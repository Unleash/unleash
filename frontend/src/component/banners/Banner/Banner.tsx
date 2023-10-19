import {
    Check,
    ErrorOutlineRounded,
    InfoOutlined,
    WarningAmber,
} from '@mui/icons-material';
import { styled, Icon, Link } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useNavigate } from 'react-router-dom';
import { BannerDialog } from './BannerDialog/BannerDialog';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BannerVariant, IBanner } from 'interfaces/banner';

const StyledBar = styled('aside', {
    shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'sticky',
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
            zIndex: theme.zIndex.sticky - 100,
        }),
    }),
);

const StyledIcon = styled('div', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: BannerVariant }>(({ theme, variant }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette[variant].main,
}));

interface IBannerProps {
    banner: IBanner;
}

export const Banner = ({ banner }: IBannerProps) => {
    const [open, setOpen] = useState(false);

    const {
        message,
        variant = 'info',
        sticky,
        icon,
        link,
        linkText = 'More info',
        plausibleEvent,
        dialogTitle,
        dialog,
    } = banner;

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
            <BannerDialog
                open={open}
                setOpen={setOpen}
                title={dialogTitle || linkText}
            >
                {dialog!}
            </BannerDialog>
        </StyledBar>
    );
};

const VariantIcons = {
    warning: <WarningAmber />,
    info: <InfoOutlined />,
    error: <ErrorOutlineRounded />,
    success: <Check />,
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
    const internal = link.startsWith('/');

    const trackEvent = () => {
        if (!plausibleEvent) return;
        tracker.trackEvent('banner', {
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
        <Link href={link} target='_blank' rel='noreferrer' onClick={trackEvent}>
            {children}
        </Link>
    );
};
