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
import ArticleIcon from '@mui/icons-material/Article';
import { ReactComponent as UnleashLogo } from 'assets/img/logoDarkWithText.svg';

const YOUTUBE_VIDEO_ID = 'PLACEHOLDER_VIDEO_ID';
const DOCS_URL = 'https://docs.getunleash.io/reference/release-plans';
const RELEASE_NOTES_URL = 'https://docs.getunleash.io/release-notes';

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
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.5),
}));

const StyledLogo = styled(UnleashLogo)(({ theme }) => ({
    height: theme.spacing(5),
}));

const ContentContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    overflowY: 'auto',
    flex: 1,
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.fontWeightLight,
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
    marginBottom: theme.spacing(3),
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

const YouTubeContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    paddingBottom: '56.25%',
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    backgroundColor: theme.palette.background.elevation1,
    '& iframe': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 0,
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

    const handleGetStarted = () => {
        onClose();
        navigate('/release-templates');
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
                    <StyledLink
                        href={RELEASE_NOTES_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <ArticleIcon fontSize='small' />
                        Release notes
                    </StyledLink>
                </LinksRow>

                <YouTubeContainer>
                    <iframe
                        src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
                        title='Release management introduction video'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                    />
                </YouTubeContainer>

                <ActionsRow>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleGetStarted}
                    >
                        Get started with release management
                    </Button>
                    <Button variant='text' onClick={onClose}>
                        Cancel
                    </Button>
                </ActionsRow>
            </ContentContainer>
        </DialogCard>
    );
};
