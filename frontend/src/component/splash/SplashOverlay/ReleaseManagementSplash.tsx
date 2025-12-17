import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    IconButton,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';
import splashVideo from 'assets/img/impact-metrics-video.mp4';

const DOCS_URL = 'https://docs.getunleash.io/concepts/impact-metrics';

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
    marginBottom: theme.spacing(2),
}));

const LinksRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
}));

const StyledLink = styled('a')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    textDecoration: 'none',
    fontSize: theme.fontSizes.smallBody,
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const VideoContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    marginBottom: theme.spacing(4),
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    backgroundColor: theme.palette.background.elevation1,
    '& video': {
        width: '100%',
        height: 'auto',
        display: 'block',
    },
}));

const PlayOverlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
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
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleGetStarted = () => {
        onClose();
        navigate('/release-templates');
    };

    const handlePlayClick = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <DialogCard>
            <HeaderRow>
                <StyledLogo aria-label='Unleash' />
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
                    Introducing release management
                </StyledTitle>

                <StyledDescription>
                    Structure your feature rollouts with release plans,
                    milestones, and automated progressions. Add safeguards to
                    protect your deployments and roll out features with
                    confidence.
                </StyledDescription>

                <LinksRow>
                    <StyledLink
                        href={DOCS_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <OpenInNewIcon fontSize='small' />
                        View documentation
                    </StyledLink>
                </LinksRow>

                <VideoContainer>
                    <video
                        ref={videoRef}
                        src={splashVideo}
                        controls={isPlaying}
                        playsInline
                        title='Release management introduction video'
                    />
                    {!isPlaying && (
                        <PlayOverlay onClick={handlePlayClick}>
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
