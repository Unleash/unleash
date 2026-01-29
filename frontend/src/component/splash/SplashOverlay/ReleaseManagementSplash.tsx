import { useEffect, useRef, useState } from 'react';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import {
    Box,
    Button,
    IconButton,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import { ReactComponent as UnleashLogoWhite } from 'assets/img/logoWithWhiteText.svg';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';

const VIDEO_URL = 'https://cdn.getunleash.io/impact-metrics.mp4';
const GETTING_STARTED_DOCS_URL =
    'https://docs.getunleash.io/guides/getting-started-release-management';

const DialogCard = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.shadows[5],
    maxWidth: theme.spacing(100),
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    margin: theme.spacing(2),
    position: 'relative',
    zIndex: 1,
}));

const HeaderRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.5),
}));

const StyledLogo = styled(UnleashLogo)(({ theme }) => ({
    height: theme.spacing(6),
}));

const StyledLogoWhite = styled(UnleashLogoWhite)(({ theme }) => ({
    height: theme.spacing(6),
}));

const ContentContainer = styled(Box)(({ theme }) => ({
    padding: `${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(3.5)} ${theme.spacing(3)}`,
    overflowY: 'auto',
    flex: 1,
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
}));

const StyledDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
}));

const VideoContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    paddingBottom: '56.25%',
    marginBottom: theme.spacing(4),
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledVideo = styled('video')({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
});

const PlayOverlay = styled('button')({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    padding: 0,
    outline: 'none',
    '&:focus-visible > div': {
        outline: '2px solid white',
        outlineOffset: '2px',
    },
});

const PlayButton = styled(Box)(({ theme }) => ({
    width: theme.spacing(10),
    height: theme.spacing(10),
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme.shadows[4],
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: theme.shadows[8],
    },
    '& svg': {
        fontSize: theme.spacing(5),
        color: theme.palette.common.white,
    },
}));

const ActionsRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
}));

interface ReleaseManagementSplashProps {
    onClose: () => void;
}

export const ReleaseManagementSplash = ({
    onClose,
}: ReleaseManagementSplashProps) => {
    const { trackEvent } = usePlausibleTracker();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        trackEvent('release-management-splash', {
            props: {
                eventType: 'displayed',
            },
        });
    }, []);

    const handleGetStarted = () => {
        trackEvent('release-management-splash', {
            props: {
                eventType: 'getting-started-click',
            },
        });
        window.open(GETTING_STARTED_DOCS_URL, '_blank', 'noopener,noreferrer');
        onClose();
    };

    const handlePlayClick = () => {
        trackEvent('release-management-splash', {
            props: {
                eventType: 'play-video',
            },
        });
        setIsPlaying(true);
        videoRef.current?.play();
    };

    return (
        <DialogCard>
            <HeaderRow>
                <ThemeMode
                    darkmode={<StyledLogoWhite aria-label='Unleash' />}
                    lightmode={<StyledLogo aria-label='Unleash' />}
                />
                <Tooltip title='Close' arrow>
                    <StyledCloseButton
                        onClick={onClose}
                        size='small'
                        aria-label='close'
                    >
                        <CloseIcon />
                    </StyledCloseButton>
                </Tooltip>
            </HeaderRow>

            <ContentContainer>
                <StyledTitle variant='h1'>
                    Put your rollouts on autopilot
                </StyledTitle>

                <StyledDescription>
                    Define your milestones once and reuse everywhere. Add
                    automations and watch them go from 5% canary to full
                    release, while safeguards catch issues before your users do.
                </StyledDescription>

                <VideoContainer>
                    <StyledVideo
                        ref={videoRef}
                        src={VIDEO_URL}
                        controls={isPlaying}
                        preload='metadata'
                    />
                    {!isPlaying && (
                        <PlayOverlay
                            onClick={handlePlayClick}
                            aria-label='Play video'
                            type='button'
                        >
                            <PlayButton>
                                <PlayArrowIcon />
                            </PlayButton>
                        </PlayOverlay>
                    )}
                </VideoContainer>

                <ActionsRow>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleGetStarted}
                    >
                        View the getting started guide
                    </Button>
                    <Button variant='text' onClick={onClose}>
                        Cancel
                    </Button>
                </ActionsRow>
            </ContentContainer>
        </DialogCard>
    );
};
