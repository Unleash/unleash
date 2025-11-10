import Check from '@mui/icons-material/Check';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { styled, Icon, Link } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useNavigate } from 'react-router-dom';
import { BannerDialog } from './BannerDialog/BannerDialog.tsx';
import { useState } from 'react';
import { Markdown } from 'component/common/Markdown/Markdown';
import type { BannerVariant, IBanner } from 'interfaces/banner';
import { Sticky } from 'component/common/Sticky/Sticky';

const DEFAULT_VARIANT = 'info';

const StyledBar = styled('aside', {
    shouldForwardProp: (prop) =>
        !['variant', 'inline', 'maxHeight', 'height'].includes(prop as string),
})<{
    variant: BannerVariant;
    inline?: boolean;
    maxHeight?: number;
    height?: number;
}>(({ theme, variant, inline, maxHeight, height }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    gap: theme.spacing(1),
    width: '100%',
    ...(inline
        ? {
              border: '1px solid',
              borderRadius: theme.shape.borderRadiusMedium,
          }
        : {
              borderBottom: '1px solid',
          }),
    ...(maxHeight && {
        maxHeight: maxHeight,
        overflow: 'auto',
    }),
    ...(height && {
        height: height,
    }),
    borderColor:
        theme.palette[variant]?.border ?? theme.palette[DEFAULT_VARIANT].border,
    background:
        theme.palette[variant]?.light ?? theme.palette[DEFAULT_VARIANT].light,
    color: theme.palette[variant]?.dark ?? theme.palette[DEFAULT_VARIANT].dark,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledIcon = styled('div', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: BannerVariant }>(({ theme, variant }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette[variant]?.main ?? theme.palette[DEFAULT_VARIANT].main,
}));

interface IBannerProps {
    banner: IBanner;
    inline?: boolean;
    maxHeight?: number;
    height?: number;
}

export const Banner = ({ banner, inline, height, maxHeight }: IBannerProps) => {
    const [open, setOpen] = useState(false);

    const {
        message,
        variant = DEFAULT_VARIANT,
        sticky,
        icon,
        link,
        linkText = 'More info',
        linkClicked,
        plausibleEvent,
        dialogTitle,
        dialog,
    } = banner;

    const openDialog = () => {
        setOpen(true);
        linkClicked?.();
    };

    const bannerBar = (
        <StyledBar
            variant={variant}
            inline={inline}
            maxHeight={maxHeight}
            height={height}
        >
            <StyledIcon variant={variant}>
                <BannerIcon icon={icon} variant={variant} />
            </StyledIcon>
            <Markdown>{message}</Markdown>
            <BannerButton
                link={link}
                plausibleEvent={plausibleEvent}
                openDialog={openDialog}
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

    if (sticky) {
        return <Sticky>{bannerBar}</Sticky>;
    }

    return bannerBar;
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
